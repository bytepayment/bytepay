

import cloud from '@/cloud-sdk'
import axios from 'axios'
import { CollectionReference } from './node_modules/database-ql'

const Config = cloud.shared.get('config')
const CryptoPayLabUrl = Config.CryptoPayLabUrl
// Declare Issue Data Type
interface User {
  id: number
  login: string
  site_admin: boolean
}
interface Issue {
  issue: {
    id: number
    title: string
    body: string
    html_url: string
    user: User
    author_association: string,
    "number": number
  },
  comment: {
    id: number
    body: string
    created_at: string
    updated_at: string
    html_url: string
    user: User
    author_association: string
  },
  repository: {
    id: number
    name: string
    full_name: string
    owner: User
    html_url: string
  },
  sender: User,
  action: string
}
const CreateReg = new RegExp(/Dotpay:\s+\/pay\s+([0-9]\d*\.?\d*)\s+DOT/)
const ApplyReg = new RegExp(/Dotpay:\s+\/apply\s+task/)
const FinishedReg = new RegExp(/Dotpay:\s+\/finish\s+task/)
const PaidReg = new RegExp(/Dotpay:\s+\/paid\s+task/)
const BindReg = new RegExp(/Dotpay:\s+\/bind\s+(.*)/)
const RobottToken = Config.CryptoPayLabBotToken
const headers = { 'Accept': 'application/json', 'Authorization': `Bearer ${RobottToken}` }

// Robot 自动回复Comment
async function submitIssueComment(owner: string, repo: string, issue_number: number, body: string) {
  // Request Github
  return  await axios({
    url: `https://api.github.com/repos/${owner}/${repo}/issues/${issue_number}/comments`,
    method: 'POST',
    headers,
    data: {
      body: body
    }
  })
}

async function CreateTask(collTask: CollectionReference, issuePayload: Issue) {
  const { issue, comment, repository, sender } = issuePayload
  const issue_content = comment.body
  // Check If Have Permission - 只有库的作者才可以发布任务
  if (sender.id !== repository.owner.id) {
    const comment_content = `**Dotpay: Only Owner Of Repository Can Create A New Task, @${sender.login} is not owner.**`
    const r = await submitIssueComment(issue.user.login, repository.name, issue.number, comment_content)
    return console.log('Only Owner Of Repository Can Create A New Task.')
  }
  // Check If Create Already - 一个 Issue 下只能发布一个任务
  const f = await collTask.where({ issue_id: issue.id }).getOne()
  if (f.data) {
    const comment_content = `**Dotpay: A Single Issue Can Create One Task Only.**`
    const r = await submitIssueComment(issue.user.login, repository.name, issue.number, comment_content)
    return console.log('A Single Issue Can Create One Task Only.')
  }
  // Check if balance have enough amount - 检查账户余额是否充足
  const balanceResult = await cloud.invoke('get_polkadot_account_info', { body: { id: sender.id } })
  if (balanceResult.error !== 0) return console.log('Get Account Balance Error')
  const matchResult = issue_content.match(CreateReg)
  const dotNumber = parseFloat(matchResult[1])
  // 检查该用户已冻结金额，防止一币多发
  const collUser = cloud.database().collection('user')
  const fu = await collUser.where({ id: sender.id }).getOne()
  if (!fu.data) return console.log('Author have\'t login our platform.')
  const frozenAmount = fu.data?.frozenAmount || 0
  if (balanceResult.data.free - frozenAmount < dotNumber) {
    // Robot 发布 comment
    const comment_content = `**Dotpay: @${sender.login}'s polka account have only ${balanceResult.data.free - frozenAmount} Dot available, less than ${dotNumber} you want pay.**`
    const r = await submitIssueComment(issue.user.login, repository.name, issue.number, comment_content)
    return console.log('Account balance is not enough...')
  }
  // Add This Task Into Our Own Database
  const newTask = {
    issue_id: issue.id,
    issue_number: issue.number,
    title: issue.title,
    task_url: issue.html_url,
    repo_name: repository.full_name,
    repo_id: repository.id,
    repo_url: repository.html_url,
    author: issue.user,
    pay: dotNumber,
    describe: issue.body,
    createTime: comment.created_at,
    updataTime: comment.updated_at,
    status: 'created'
  }
  // 更新数据库
  await collTask.add(newTask)
  await collUser.where({ id: sender.id}).update({frozenAmount: frozenAmount + dotNumber})
  // Robot 发布 comment
  const comment_content = `**Dotpay: Finish This Task, @${sender.login} will pay you ${dotNumber} Dot. Visit ${CryptoPayLabUrl} for more detail**`
  const r = await submitIssueComment(issue.user.login, repository.name, issue.number, comment_content)
  console.log(r)
}

async function ApplyTask(collTask: CollectionReference, issuePayload: Issue) {
  const { issue, comment, repository, sender } = issuePayload
  // Check if task exists - 查找该任务是否已创建
  const f = await collTask.where({ issue_id: issue.id }).getOne()
  if (!f.data) return console.log('No task anymore')
  // Check if task has been applied - 查找该任务是否已被申领
  if (f.data.status !== 'created') return console.log('Task has been assigned')
  // 更新数据库
  await collTask.where({ issue_id: issue.id }).update({ developer: sender, status: 'applied' })
  // Robot 发布 comment
  const comment_content = `**Dotpay: Task has been assigned to @${sender.login}.**`
  const r = await submitIssueComment(issue.user.login, repository.name, issue.number, comment_content)
  // 检查开发者是否绑定账户，提醒他可以绑定自己的账户
  const collUser = cloud.database().collection('user')
  const fu = await collUser.where({ id: sender.id }).getOne()
  if (!fu.data) { // 开发者未使用我们的平台
    const comment_content = `
    \r\nDotpay: @${sender.login} You can open ${CryptoPayLabUrl} to create your account(highly recommend) or bind your own polka account in following Comment:\r\n
    \r\nDotpay: /bind address\r\n
    \r\neg. \`Dotpay: /bind 5DTestUPts3kjeXSTMyerHihn1uwMfLj8vU8sqF7qYrFabHE\`\r\n
    `
    await submitIssueComment(issue.user.login, repository.name, issue.number, comment_content)
  } else if (!fu.data.own_polka_address) { // 开发者未绑定自己的账户
    const comment_content = `**Dotpay: @${sender.login}, you can use polka address we created by default or bind your own address on ${CryptoPayLabUrl}/settings/address.**`
    await submitIssueComment(issue.user.login, repository.name, issue.number, comment_content)
  } else {
    // do nothing
    console.log('not match')
  }
}

async function FinishTask(collTask: CollectionReference, issuePayload: Issue) {
  const { issue, comment, repository, sender } = issuePayload
  // Check if task exists - 查找该任务是否已创建
  const f = await collTask.where({ issue_id: issue.id }).getOne()
  if (!f.data) return console.log('No task anymore')
  // Check if task has been applied - 查找该任务是否已被申领
  if (f.data.status !== 'applied') return console.log('Task has not been assigned')
  // Check if sender is applier - 查找完成人与申领人是否为同一个人
  console.log(f.data)
  console.log(sender)
  if (f.data.developer.id !== sender.id) return console.log('It\'s not your task!')
  // 更新数据库
  await collTask.where({ issue_id: issue.id }).update({ status: 'finished' })
  // Robot 发布 comment
  const comment_content = `**Dotpay: @${sender.login} completed this task, please @${issue.user.login} check and pay.**`
  const r = await submitIssueComment(issue.user.login, repository.name, issue.number, comment_content)
}

async function PayTask(collTask: CollectionReference, issuePayload: Issue) {
  const { issue, comment, repository, sender } = issuePayload
  const issue_content = comment.body
  // Check if task exists - 查找该任务是否已创建
  const f = await collTask.where({ issue_id: issue.id }).getOne()
  if (!f.data) return console.log('No task anymore')
  const task = f.data
  // Check if task has been applied - 查找该任务是否已完成
  if (task.status !== 'finished') return console.log('Task has not been finished')
  // Check if sender is author
  if (task.author.id !== sender.id) return console.log('You are not the author!')
  // Check if balance is enough - 提现时对冻结金额做了限制，此处可确保余额充足
  // 查找支付地址 - 1. 开发者使用了我们平台；2. 开发者未使用我们的平台
  const collUser = cloud.database().collection('user')
  const fu_dev = await collUser.where({ id: task.developer.id }).getOne()
  const fu_author = await collUser.where({ id: task.author.id }).getOne()
  // 开发者未使用我们的平台且未绑定地址
  if (!fu_dev.data && !task.developer.address) {
    // 提醒开发者绑定地址
    const comment_content = `**Dotpay: Developer @${task.developer.login} haven't bind any polka address, please bind first.**`
    const r = await submitIssueComment(issue.user.login, repository.name, issue.number, comment_content)
    return
  }
  let address = ''
  // 开发者未使用我们平台，但是绑定了地址
  if (!fu_dev.data && task.developer.address) {
    address = task.developer.address
  // 开发者使用了我们的平台，但未绑定地址
  } else if (fu_dev.data && !fu_dev.data.own_polka_address) {
    address = fu_dev.data.polka.address
  // 开发者使用了我们的平台，且绑定了地址
  } else {
    address = fu_dev.data.own_polka_address
  }
  // 支付
  const trans_result = await cloud.invoke('polka_dot_transfer', {
    body: {
      pay_user_id: sender.id,
      recv_address: address,
      amount: task.pay
    }
  })
  if (trans_result.error !== 0) {
    // 支付失败
    return
  }
  // 更新数据库 - 任务已支付，减去冻结金额
  await collTask.where({ issue_id: issue.id }).update({ status: 'paid', frozenAmount: fu_author.data.frozenAmount - task.pay })
  // Robot 发布 comment
  const comment_content = `**Dotpay: @${issue.user.login} have paid for this task, please @${f.data.developer.login} check your polka account.**`
  const r = await submitIssueComment(issue.user.login, repository.name, issue.number, comment_content)
}

async function BindDotAddress(collTask: CollectionReference, issuePayload: Issue) {
  const { issue, comment, repository, sender } = issuePayload
  const issue_content = comment.body
  const matchResult = issue_content.match(BindReg)
  const address = matchResult[1]
  const ft = await collTask.where({ issue_id: issue.id }).getOne()
  // Check if Have Task - 检查任务是否已创建
  if (!ft.data) return console.log('Task Not Found')
  // Check if Task Has Been Applied - 检查任务是否已申领
  if (ft.data.status !== 'applied' && ft.data.status !== 'finished') return console.log('Task Has Not Been Applied Or Finished.')
  // Shield our bot - 屏蔽我们的机器人
  if (sender.login === 'CryptoPayLabBot') return console.log('Shield our bot')
  // Check if sender is the developer - 检查绑定地址的是否为开发者
  if (ft.data.developer.id !== sender.id) {
    const comment_content = `**Dotpay: @${sender.login}, you are not the developer.**`
    const r = await submitIssueComment(issue.user.login, repository.name, issue.number, comment_content)
    return
  }
  const collUser = cloud.database().collection('user')
  const f = await collUser.where({ id: sender.id }).getOne()
  // 如未授权我们平台，则绑定至该任务下个人地址
  if (!f.data) {
    console.log(address)
    await collTask.where({ issue_id: issue.id }).update({"developer.address": address})
    // 提醒开发者使用我们的平台
    const comment_content = `**Dotpay: @${sender.login}, address bind success, please visit ${CryptoPayLabUrl} to check your task.**`
    return await submitIssueComment(issue.user.login, repository.name, issue.number, comment_content)
  }
  // 如果开发者授权了我们的平台，且未绑定个人地址，则绑定至其个人地址
  if (!f.data.own_polka_address) {
    await collUser.where({ id: sender.id }).update({ own_polka_address: address })
    const comment_content = `**Dotpay: @${sender.login}, address bind success, please visit ${CryptoPayLabUrl} to check your task.**`
    return await submitIssueComment(issue.user.login, repository.name, issue.number, comment_content)
  }
  // 如果开发者授权了我们的平台，且绑定了个人地址，则提醒他不要重复绑定
  if (f.data.own_polka_address) {
    await collUser.where({ id: sender.id }).update({ own_polka_address: address })
    const comment_content = `**Dotpay: @${sender.login}, you have already bind your address, please goto ${CryptoPayLabUrl} to manager your address.**`
    return await submitIssueComment(issue.user.login, repository.name, issue.number, comment_content)
  }
  
}

// 按照定义，我们只监听 issue comment, 即 issue中含有 comment 字段
// issue 格式参照上述正则定义
async function Dispatch(issuePayload: Issue) {
  // Discard Non-Comment Issue
  if (!issuePayload.comment) return
  if (issuePayload.action !== 'created') return 
  const db = cloud.database()
  const collTask = db.collection('tasks')
  const issue_content = issuePayload.comment.body
  // 根据正则匹配进行分发
  // 发布任务
  if (issue_content.match(CreateReg)) {
    await CreateTask(collTask, issuePayload)
  // 申请任务
  } else if (issue_content.match(ApplyReg)) {
    await ApplyTask(collTask, issuePayload)
  // 完成任务
  } else if(issue_content.match(FinishedReg)) {
    await FinishTask(collTask, issuePayload)
  // 支付任务
  } else if (issue_content.match(PaidReg)) {
    await PayTask(collTask, issuePayload)
  // 开发者：绑定自己的钱包地址
  } else if (issue_content.match(BindReg)) {
    await BindDotAddress(collTask, issuePayload)
  } else {
    console.log('Not Dotpay related issue')
  }
}

exports.main = async function (ctx: FunctionContext) {
  // body 为 github 传入的 issue 对象
  const { body } = ctx
  // 解析 issue, 数据分发
  await Dispatch(body)
  // 调试用
  const db = cloud.database()
  const collHookPayload = db.collection('hook_payload')
  const issue_content = body.comment.body
  if (issue_content.match(CreateReg) || issue_content.match(ApplyReg) || issue_content.match(PaidReg) || issue_content.match(FinishedReg) || issue_content.match(BindReg)) {
    // collHookPayload.add({...body})
  }
}

