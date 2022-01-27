

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
interface IssueLoc {
  owner: string,
  repo: string,
  issue_number: number
}
const CreateReg = new RegExp(/\/bytepay\s+task\s+([0-9]\d*\.?\d*)DOT/)
const ApplyReg = new RegExp(/\/bytepay\s+apply/)
const PaidReg = new RegExp(/\/bytepay\s+pay$/)
const PaidReg2 = new RegExp(/\/bytepay\s+pay\s+(.*)\s+([0-9]\d*\.?\d*)DOT$/)
const BindReg = new RegExp(/\/bytepay\s+bind\s+(.*)/)
const RobottToken = Config.CryptoPayLabBotToken
const headers = { 'Accept': 'application/json', 'Authorization': `Bearer ${RobottToken}` }


// Robot 自动回复Comment
async function submitIssueComment(issue_loc: IssueLoc, body: string) {
  // Request Github
  return await axios({
    url: `https://api.github.com/repos/${issue_loc.owner}/${issue_loc.repo}/issues/${issue_loc.issue_number}/comments`,
    method: 'POST',
    headers,
    data: {
      body: body
    }
  })
}

async function CreateTask(collTask: CollectionReference, issuePayload: Issue, issue_loc: IssueLoc) {
  const { issue, comment, repository, sender } = issuePayload
  const issue_content = comment.body
  // 去除只有owner可以发布任务的限制
  // 1. 检查该Issue下是否已发布任务
  const { data: task } = await collTask.where({ issue_id: issue.id }).getOne()
  let robot_comment = ''
  if (task) {
    robot_comment = `**Bytepay: A Single Issue Can Create One Task Only.**`
    await submitIssueComment(issue_loc, robot_comment)
    return console.log(robot_comment)
  }
  // 2. 检查sender是否注册bytepay
  const collUser = cloud.database().collection('user')
  const { data: user } = await collUser.where({ id: sender.id }).getOne()
  if (!user) {
    robot_comment = `
    \r\n**@${sender.login}:**\r\n
    \r\nYou can goto ${CryptoPayLabUrl} to create an account and recharge some token\r\n
    \r\nThen you can create task under any issue if you want.\r\n
    `
    await submitIssueComment(issue_loc, robot_comment)
    return console.log(robot_comment)
  }
  // 3. 检查账户余额是否充足
  const balanceResult = await cloud.invoke('get_polkadot_account_info', { body: { id: sender.id } })
  if (balanceResult.error !== 0) return console.log('Get Account Balance Error')
  const matchResult = issue_content.match(CreateReg)
  const dotNumber = parseFloat(matchResult[1])
  // 4. 检查该用户已冻结金额，防止一币多发
  const frozenAmount = user?.frozenAmount || 0
  if (balanceResult.data.free - frozenAmount < dotNumber) {
    // Robot 发布 comment
    robot_comment = `
    \r\n**@${sender.login}:**\r\n
    \r\nSeems your account have only ${balanceResult.data.free - frozenAmount} DOT available, less than ${dotNumber} DOT you want pay.\r\n
    \r\n**Please recharge token on ${CryptoPayLabUrl} first.**\r\n
    `
    await submitIssueComment(issue_loc, robot_comment)
    return console.log(robot_comment)
  }
  // 5. 创建任务，添加至数据库
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
  await collUser.where({ id: sender.id }).update({ frozenAmount: frozenAmount + dotNumber })
  // Robot 发布 comment
  robot_comment = `
  \r\n**Bytepay: Finish This Task, ${sender.login} will pay you ${dotNumber} DOT.**\r\n
  \r\nComment in Following instruction to apply for this task\r\n
  \r\n\`/bytepay apply\`\r\n
  \r\nVisit ${CryptoPayLabUrl} for more detail\r\n
  `
  await submitIssueComment(issue_loc, robot_comment)
  console.log('Create task success')
}

async function ApplyTask(collTask: CollectionReference, issuePayload: Issue, issue_loc: IssueLoc) {
  const { issue, comment, repository, sender } = issuePayload
  let robot_comment = ''
  // 1. 查找该任务是否已创建
  const { data: task } = await collTask.where({ issue_id: issue.id }).getOne()
  if (!task) {
    robot_comment = '**Bytepay: No one had created task in this issue before.'
    await submitIssueComment(issue_loc, robot_comment)
    return console.log(robot_comment)
  }
  // 2. 查找该任务是否已被申领
  if (task.status !== 'created') {
    robot_comment = `**Bytepay: task has already assigned to ${task.developer.login}.**`
    await submitIssueComment(issue_loc, robot_comment)
    return console.log(robot_comment)
  }
  // 3. 更新数据库
  await collTask.where({ issue_id: issue.id }).update({ developer: sender, status: 'applied' })
  // Robot 发布 comment
  robot_comment = `**Bytepay: Task has been assigned to @${sender.login}.**`
  await submitIssueComment(issue_loc, robot_comment)
  // 检查开发者是否绑定账户，提醒他可以绑定自己的账户
  const collUser = cloud.database().collection('user')
  const fu = await collUser.where({ id: sender.id }).getOne()
  if (!fu.data) { // 开发者未使用我们的平台
    robot_comment = `
    \r\n**@${sender.login}:**\r\n
    \r\nYou can open ${CryptoPayLabUrl} to create your account(highly recommend) \r\n
    \r\nor bind your own account in following Comment:\r\n
    \r\n\`/bytepay bind 5DTestUPts3kjeXSTMyerHihn1uwMfLj8vU8sqF7qYrFabHE\`\r\n
    `
    await submitIssueComment(issue_loc, robot_comment)
  } else if (!fu.data.own_polka_address) { // 开发者使用我们平台，但未绑定自己的账户
    robot_comment = `
    \r\n**@${sender.login}:**\r\n
    \r\nYou can use polka address we created by default or bind your own address on ${CryptoPayLabUrl}/settings/address.\r\n
    `
    await submitIssueComment(issue_loc, robot_comment)
  } else {
    // do nothing
    console.log('not match')
  }
}

async function PayTask(collTask: CollectionReference, issuePayload: Issue, issue_loc: IssueLoc) {
  const { issue, comment, repository, sender } = issuePayload
  let robot_comment = ''
  // 1. 查找该任务是否已创建
  const { data: task} = await collTask.where({ issue_id: issue.id }).getOne()
  if (!task) {
    robot_comment = '**No task under this issue.**'
    await submitIssueComment(issue_loc, robot_comment)
    return console.log(robot_comment)
  }
  // 2. 查找该任务是否已申领
  if (!task.developer) {
    robot_comment = 'Task have not been assigned.'
    await submitIssueComment(issue_loc, robot_comment)
    return console.log(robot_comment)
  }
  // 3. 只有task owner可以用/bytepay pay 指令来支付, 其余支付者使用另外一条指令
  if (task.author.id !== sender.id) {
    robot_comment = `
    \r\n**@${sender.login}**\r\n
    \r\nSeems you are not the owner of this task, you can pay for the developer by following instruction:\r\n
    \r\n\`/bytepay pay ${task.developer.login} 5DOT\`\r\n
    \r\nNotice: you can give any number of token you want if you account is available.\r\n
    `
    await submitIssueComment(issue_loc, robot_comment)
    return console.log(robot_comment)
  }
  // 4. 查找支付地址 - 1. 开发者使用了我们平台；2. 开发者未使用我们的平台
  const collUser = cloud.database().collection('user')
  const { data: developer } = await collUser.where({ id: task.developer.id }).getOne()
  const { data: owner } = await collUser.where({ id: task.author.id }).getOne()
  // 开发者未使用我们的平台且未绑定地址
  if (!developer && !task.developer.address) {
    // 提醒开发者绑定地址
    const comment_content = `
    \r\n**@${task.developer.login}:**\r\n
    \r\nWe can not locate your polka address, please create an polka account on ${CryptoPayLabUrl} or\r\n
    \r\nbind your account in following instruction:\r\n
    \r\n\`/bytepay bind 5DTestUPts3kjeXSTMyerHihn1uwMfLj8vU8sqF7qYrFabHE\`\r\n
    `
    return await submitIssueComment(issue_loc, comment_content)
  }
  let address = ''
  // 开发者未使用我们平台，但是绑定了地址
  if (!developer && task.developer.address) {
    address = task.developer.address
    // 开发者使用了我们的平台，但未绑定地址
  } else if (developer && !developer.own_polka_address) {
    address = developer.polka.address
    // 开发者使用了我们的平台，且绑定了地址
  } else {
    address = developer.own_polka_address
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
    robot_comment = `**Bytepay: transfer token error, please contact ${CryptoPayLabUrl}**`
    await submitIssueComment(issue_loc, robot_comment)
    console.log(robot_comment)
  }
  // 更新数据库 - 任务已支付，减去冻结金额
  await collTask.where({ issue_id: issue.id }).update({ status: 'paid', frozenAmount: owner.frozenAmount - task.pay })
  // Robot 发布 comment
  const comment_content = `**Bytepay: ${issue.user.login} have paid for this task, please @${task.developer.login} check your polka account.**`
  const r = await submitIssueComment(issue_loc, comment_content)
}

async function OtherPayTask(collTask: CollectionReference, issuePayload: Issue, issue_loc: IssueLoc) {
  const { issue, comment, repository, sender } = issuePayload

  let robot_comment = ''
  // 1. 查找该任务是否已创建
  const { data: task } = await collTask.where({ issue_id: issue.id }).getOne()
  if (!task) {
    robot_comment = '**Bytepay: No one had created task in this issue before.'
    await submitIssueComment(issue_loc, robot_comment)
    return console.log(robot_comment)
  }
  // 2. 查找该任务是否已被申领
  if (task.status === 'created') {
    robot_comment = `**Bytepay: task has already assigned to ${task.developer.login}.**`
    await submitIssueComment(issue_loc, robot_comment)
    return console.log(robot_comment)
  }
  // 3. 查找意愿支付者是否注册我们平台
  const collUser = cloud.database().collection('user')
  const { data: user } = await collUser.where({ id: sender.id }).getOne()
  if (!user) {
    robot_comment = `
    \r\n**@${sender.login}:**\r\n
    \r\nWe can not locate your polka account, please create an account and recharge some token.\r\n
    \r\n**CryptoPayLab Url: ${CryptoPayLabUrl}**\r\n
    `
    await submitIssueComment(issue_loc, robot_comment)
    return console.log(robot_comment)
  }
  // 4. 判断该支付者是否余额充足
  const balanceResult = await cloud.invoke('get_polkadot_account_info', { body: { id: user.id } })
  if (balanceResult.error !== 0) return console.log('Get Account Balance Error')
  const issue_content = comment.body
  const matchResult = issue_content.match(PaidReg2)
  const dotNumber = parseFloat(matchResult[2])
  // 4.1 检查该用户已冻结金额，防止一币多发
  const frozenAmount = user?.frozenAmount || 0
  if (balanceResult.data.free - frozenAmount < dotNumber) {
    // Robot 发布 comment
    robot_comment = `
    \r\n**@${sender.login}:**\r\n
    \r\nSeems your account have only ${balanceResult.data.free - frozenAmount} DOT available, less than ${dotNumber} DOT you want pay.\r\n
    \r\n**Please recharge token on ${CryptoPayLabUrl} first.**\r\n
    `
    await submitIssueComment(issue_loc, robot_comment)
    return console.log(robot_comment)
  }
  // 5. 触发转账
  const { data: developer } = await collUser.where({ id: task.developer.id }).getOne()
  // 开发者未使用我们的平台且未绑定地址
  if (!developer && !task.developer.address) {
    // 提醒开发者绑定地址
    const comment_content = `
    \r\n**@${task.developer.login}:**\r\n
    \r\nWe can not locate your polka address, please create an polka account on ${CryptoPayLabUrl} or\r\n
    \r\nbind your account in following instruction:\r\n
    \r\n\`/bytepay bind 5DTestUPts3kjeXSTMyerHihn1uwMfLj8vU8sqF7qYrFabHE\`\r\n
    `
    return await submitIssueComment(issue_loc, comment_content)
  }
  let address = ''
  // 开发者未使用我们平台，但是绑定了地址
  if (!developer && task.developer.address) {
    address = task.developer.address
    // 开发者使用了我们的平台，但未绑定地址
  } else if (developer && !developer.own_polka_address) {
    address = developer.polka.address
    // 开发者使用了我们的平台，且绑定了地址
  } else {
    address = developer.own_polka_address
  }
  // 支付
  const trans_result = await cloud.invoke('polka_dot_transfer', {
    body: {
      pay_user_id: sender.id,
      recv_address: address,
      amount: dotNumber
    }
  })
  if (trans_result.error !== 0) {
    robot_comment = `**Bytepay: transfer token error, please contact ${CryptoPayLabUrl}**`
    await submitIssueComment(issue_loc, robot_comment)
    console.log(robot_comment)
  }
  // Robot 发布 comment
  const comment_content = `
  \r\n**@${task.developer.login}:**\r\n
  \r\n${user.login} have paid ${dotNumber} DOT for you :)\r\n
  `
  return await submitIssueComment(issue_loc, comment_content)
}

async function CloseIssueEvent(collTask: CollectionReference, issuePayload: Issue, issue_loc: IssueLoc) {
  const { issue, comment, repository, sender } = issuePayload
  const { data: task } = await collTask.where({ issue_id: issue.id }).getOne()
  // 1. If no task under this issue, do nothing
  if (!task) return console.log(`Task not found for this issue: ${issue.html_url}`)
  // 2. 判断任务状态
  if (task.status === 'created') { // 无人申领，置为closed
    return await collTask.where({ issue_id: issue.id }).update({ status: 'closed'})
  } else if (task.status === 'applied') { // 有人申领，尚未支付，置为closed-without-pay
    // 解冻金额
    const collUser = cloud.database().collection('user')
    const { data: author } = await collUser.where({ id: task.author.id }).getOne()
    await collUser.where({id: author.id}).update({ frozenAmount: author.frozenAmount - task.pay, status: 'closed-without-pay' })
  } else if (task.status === 'paid') { // 已支付, 置为closed
    return await collTask.where({ issue_id: issue.id }).update({ status: 'closed'})
  } else {
    return console.log('Close event match nothing')
  }
}

async function BindDotAddress(collTask: CollectionReference, issuePayload: Issue, issue_loc: IssueLoc) {
  const { issue, comment, repository, sender } = issuePayload
  const issue_content = comment.body
  const matchResult = issue_content.match(BindReg)
  const address = matchResult[1]
  const { data: task} = await collTask.where({ issue_id: issue.id }).getOne()
  // Check if Have Task - 检查任务是否已创建
  if (!task) return console.log('Task Not Found')
  // Check if Task Has Been Applied - 检查任务是否已申领
  if (task.status !== 'applied') return console.log('Task Has Not Been Applied Or Finished.')
  // Check if sender is the developer - 检查绑定地址的是否为开发者
  if (task.developer.id !== sender.id) {
    const comment_content = `**Bytepay: @${sender.login}, you are not the developer.**`
    return await submitIssueComment(issue_loc, comment_content)
  }
  const collUser = cloud.database().collection('user')
  const {data: user} = await collUser.where({ id: sender.id }).getOne()
  // 如未授权我们平台，则绑定至该任务下个人地址
  if (!user) {
    console.log(address)
    await collTask.where({ issue_id: issue.id }).update({ "developer.address": address })
    // 提醒开发者使用我们的平台
    const comment_content = `**Bytepay: @${sender.login}, address bind success, please visit ${CryptoPayLabUrl} to check your task.**`
    return await submitIssueComment(issue_loc, comment_content)
  }
  // 如果开发者授权了我们的平台，且未绑定个人地址，则绑定至其个人地址
  if (!user.own_polka_address) {
    await collUser.where({ id: sender.id }).update({ own_polka_address: address })
    const comment_content = `**Bytepay: @${sender.login}, address bind success, please visit ${CryptoPayLabUrl} to check your task.**`
    return await submitIssueComment(issue_loc, comment_content)
  }
  // 如果开发者授权了我们的平台，且绑定了个人地址，则提醒他不要重复绑定
  if (user.own_polka_address) {
    await collUser.where({ id: sender.id }).update({ own_polka_address: address })
    const comment_content = `**Bytepay: @${sender.login}, you have already bind your address, please goto ${CryptoPayLabUrl} to manager your address.**`
    return await submitIssueComment(issue_loc, comment_content)
  }

}

// 按照定义，我们只监听 issue comment event 和 issue close event
// issue 格式参照上述正则定义
async function Dispatch(issuePayload: Issue) {
  // 1. 屏蔽我们自己的机器人
  if (issuePayload.sender.id === Config.CryptoPayLabBotId) return
  // 2. 定义Common变量，便于函数引用
  const db = cloud.database()
  const collTask = db.collection('tasks')
  const issue_content = issuePayload?.comment?.body || ''
  const issue_loc : IssueLoc = {
    owner: issuePayload.repository.owner.login,
    repo: issuePayload.repository.name,
    issue_number: issuePayload.issue.number
  }
  // 3. 监听以下内容：
  // 3.1 issue comment event
  if (issuePayload.action === 'created' && issuePayload.comment) {
    // 根据正则匹配进行分发
    // 3.1.1 发布任务
    if (issue_content.match(CreateReg)) {
      await CreateTask(collTask, issuePayload, issue_loc)
    // 3.1.2 申请任务
    } else if (issue_content.match(ApplyReg)) {
      await ApplyTask(collTask, issuePayload, issue_loc)
    // 3.1.3 支付任务
    } else if (issue_content.match(PaidReg)) {
      await PayTask(collTask, issuePayload, issue_loc)
    // 3.1.4 开发者支付任务
    } else if (issue_content.match(PaidReg2)) {
      console.log('match others pay for the developer')
      await OtherPayTask(collTask, issuePayload, issue_loc)
    // 3.1.5 开发者：绑定自己的钱包地址
    } else if (issue_content.match(BindReg)) {
      await BindDotAddress(collTask, issuePayload, issue_loc)
    } else {
      console.log('Not Bytepay related issue comment')
    }
  // 3.2 issue close event
  } else if (issuePayload.action === 'closed'){
    await CloseIssueEvent(collTask, issuePayload, issue_loc)
  } else {
    return
  }

}

exports.main = async function (ctx: FunctionContext) {
  // body 为 github 传入的 issue 对象
  const { body } = ctx
  // 调试用
  console.log(body)
  // 解析 issue, 数据分发
  await Dispatch(body)
}

