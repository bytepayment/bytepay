

import cloud from '@/cloud-sdk'
import axios from 'axios'

const CryptoPayLabUrl = 'https://crypto-pay-lab.io'
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
  sender: User
}
const CreateReg = new RegExp(/Dotpay:\s+\/pay\s+([0-9]\d*\.?\d*)\s+DOT/)
const ApplyReg = new RegExp(/Dotpay:\s+\/apply task/)
const FinishedReg = new RegExp(/Dotpay:\s+\/finish task/)
const PaidReg = new RegExp(/Dotpay:\s+\/paid\s(.*)\s+([0-9]\d*\.?\d*)\s+DOT/)
const BindReg = new RegExp(/Dotpay:\s+\/bind (.*)/)
const RobottToken = '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'
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

async function CreateTask(collTask, issuePayload: Issue) {
  const { issue, comment, repository, sender } = issuePayload
  const issue_content = comment.body
  // Check If Have Permission - 只有库的作者才可以发布任务
  if (sender.id !== repository.owner.id) {
    return console.log('Only Owner Of Repository Can Create A New Task.')
  }
  // Check If Create Already - 一个 Issue 下只能发布一个任务
  const f = await collTask.where({ issue_id: issue.id }).getOne()
  if (f.data) {
    return console.log('A Single Issue Can Create One Task Only.')
  }
  // Check if balance have enough amount - 检查账户余额是否充足
  const balanceResult = await cloud.invoke('get_polkadot_account_info', { body: { id: sender.id } })
  if (balanceResult.error !== 0) return console.log('Get Account Balance Error')
  const matchResult = issue_content.match(CreateReg)
  const dotNumber = parseFloat(matchResult[1])
  if (balanceResult.data.free < dotNumber) {
    // Robot 发布 comment
    const comment_content = `**Dotpay: @${sender.login}'s polka account have only ${balanceResult.data.free} Dot, less than ${dotNumber} you want pay.**`
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
  // Robot 发布 comment
  const comment_content = `**Dotpay: Finish This Task, @${sender.login} will pay you ${dotNumber} Dot.**`
  const r = await submitIssueComment(issue.user.login, repository.name, issue.number, comment_content)
  console.log(r)
}

async function ApplyTask(collTask, issuePayload: Issue) {
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
    **Dotpay: @${sender.login} You can open ${CryptoPayLabUrl} to create your account or bind your own polka account in following Comment\r\n**
    Dotpay: /bind address\r\n
    eg. \`Dotpay: /bind 5DTestUPts3kjeXSTMyerHihn1uwMfLj8vU8sqF7qYrFabHE\`
    `
    await submitIssueComment(issue.user.login, repository.name, issue.number, comment_content)
  } else if (!fu.data.own_polka_address) { // 开发者未绑定自己的账户
    const comment_content = `**Dotpay: you can use polka address we created by default or bind your own address on ${CryptoPayLabUrl}/settings/address.**`
    await submitIssueComment(issue.user.login, repository.name, issue.number, comment_content)
  } else {
    // do nothing
    console.log('not match')
  }
}

async function FinishTask(collTask, issuePayload: Issue) {
  const { issue, comment, repository, sender } = issuePayload
  // Check if task exists - 查找该任务是否已创建
  const f = await collTask.where({ issue_id: issue.id }).getOne()
  if (!f.data) return console.log('No task anymore')
  // Check if task has been applied - 查找该任务是否已被申领
  if (f.data.status !== 'applied') return console.log('Task has not been assigned')
  // Check if sender is applier - 查找完成人与申领人是否为同一个人
  if (f.data.developer.id === sender.id) return console.log('It\'s not your task!')
  // 更新数据库
  await collTask.where({ issue_id: issue.id }).update({ status: 'finished' })
  // Robot 发布 comment
  const comment_content = `**Dotpay: ${sender.login} completed this task, please ${issue.user.login} check and pay.**`
  const r = await submitIssueComment(issue.user.login, repository.name, issue.number, comment_content)
}

async function PayTask(collTask, issuePayload: Issue) {
  const { issue, comment, repository, sender } = issuePayload
  // Check if task exists - 查找该任务是否已创建
  const f = await collTask.where({ issue_id: issue.id }).getOne()
  if (!f.data) return console.log('No task anymore')
  // Check if task has been applied - 查找该任务是否已完成
  if (f.data.status !== 'finished') return console.log('Task has not been assigned')
  // Check if sender is author
  if (f.data.author.id === sender.id) return console.log('You are not the author!')
  // 更新数据库
  await collTask.where({ issue_id: issue.id }).update({ status: 'paid' })
  // 支付 - 待完成
  // Robot 发布 comment
  const comment_content = `**Dotpay: ${issue.user.login} have paid for this task, please ${f.data.developer.login} check your polka account.**`
  const r = await submitIssueComment(issue.user.login, repository.name, issue.number, comment_content)
}

async function BindDotAddress(collTask, issuePayload: Issue) {
  const { issue, comment, repository, sender } = issuePayload
  const issue_content = comment.body
}

// 按照定义，我们只监听 issue comment, 即 issue中含有 comment 字段
// issue 格式参照上述正则定义
async function Dispatch(issuePayload: Issue) {
  // Discard Non-Comment Issue
  if (!issuePayload.comment) return
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
  // 支付任务
  } else if(issue_content.match(FinishedReg)) {
    await FinishTask(collTask, issuePayload)
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

