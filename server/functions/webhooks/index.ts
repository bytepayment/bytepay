

import cloud from '@/cloud-sdk'
import axios from 'axios'
import { CollectionReference } from './node_modules/database-ql'

const Config = cloud.shared.get('config')
const Funcs = cloud.shared.get('funcs')
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
const RobottToken = Buffer.from(Config.CryptoPayLabBotToken, 'base64').toString()
const headers = { 'Accept': 'application/json', 'Authorization': `Bearer ${RobottToken}` }

function debugInfo(payload: Issue) {
  const debugInfo = {
    action: payload.action,
    issue: {
      id: payload.issue.id,
      title: payload.issue.title,
      body: payload.issue.body
    },
    comment: {
      body: payload.comment.body
    },
    sender: {
      id: payload.sender.id,
      login: payload.sender.login
    },
    repository: {
      name: payload.repository.full_name,
      owner: payload.repository.owner.login
    }
  }
  console.log(debugInfo)
}

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
  if (!user.token) {
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
    status: 'created',
    repository
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
  const { issue, sender } = issuePayload
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
  // 3. 申领成功，更新数据库
  await collTask.where({ issue_id: issue.id }).update({ developer: sender, status: 'applied' })
  // Robot 发布 comment
  robot_comment = `**Bytepay: Task has been assigned to @${sender.login}.**`
  await submitIssueComment(issue_loc, robot_comment)
  // 检查开发者是否绑定账户，提醒他可以绑定自己的账户
  const collUser = cloud.database().collection('user')
  const { data: user } = await collUser.where({ id: sender.id }).getOne()
  if (user.own_polka_address) return
  // 未绑定个人地址的，提醒其绑定
  robot_comment = `
  \r\n**@${sender.login}:**\r\n
  \r\nSeems you are not bind your own address, you can bind on ${CryptoPayLabUrl}/settings/address or\r\n
  \r\nComment in following instruction\r\n
  \r\n\`/bytepay bind 5DTestUPts3kjeXSTMyerHihn1uwMfLj8vU8sqF7qYrFabHE\`\r\n
  `
  await submitIssueComment(issue_loc, robot_comment)
  
}

async function PayTask(collTask: CollectionReference, issuePayload: Issue, issue_loc: IssueLoc) {
  const { issue, sender } = issuePayload
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
  if (sender.id !== task.author.id) {
    robot_comment = `
    \r\n**@${sender.login}**\r\n
    \r\nSeems you are not the owner of this task, you can pay for the developer by following instruction:\r\n
    \r\n\`/bytepay pay ${task.developer.login} 5DOT\`\r\n
    \r\nNotice: you can give any number of token to anyone if your account is available.\r\n
    `
    await submitIssueComment(issue_loc, robot_comment)
    return console.log(robot_comment)
  }
  // 4. 确定支付地址 - 如绑定自己地址，则使用个人地址；如未绑定，则使用默认生成的波卡地址
  const collUser = cloud.database().collection('user')
  const { data: developer } = await collUser.where({ id: task.developer.id }).getOne()
  const { data: owner } = await collUser.where({ id: task.author.id }).getOne()
  let address = developer.polka.address
  if (developer.own_polka_address) address = developer.own_polka_address
  // 5. 检查是否满足支付条件
  const { error: eb, data: rb } = await Funcs.getPolkaAccountInfoFunc(address)
  const { error: eo, data: ob } = await Funcs.getPolkaAccountInfoFunc(owner.polka.address)
  if (eb != 0|| eo != 0) {
    robot_comment = `**Bytepay: Get ${address} and ${owner.polka.address} account info error.**`
    submitIssueComment(issue_loc, robot_comment)
    return console.log(robot_comment)
  }
  const receiver_blance_total = rb.free + rb.reserved + rb.miscFrozen + rb.feeFrozen
  if ((receiver_blance_total < 1 && task.pay < 1) || ob.free - task.pay < 1) {
    robot_comment = `
    \r\nTransfer not executed because of Existential Deposit Error\r\n
    \r\nView ${Config.ExistentailDepositDocUrl} for detail.\r\n
    `
  }
  console.log({ rb, ob })
  // 6. 支付
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
    return console.log(robot_comment)
  }
  // 7. 更新数据库 - 任务状态修改未已支付；支付账户减去冻结金额
  await collTask.where({ issue_id: issue.id }).update({ status: 'paid' })
  await collUser.where({ id: owner.id }).update({frozenAmount: owner.frozenAmount - task.pay})
  // 8. Robot 发布 comment
  robot_comment = `
  \r\n**@${task.developer.login}:**\r\n
  \r\n**${sender.login} have paid for this task**, visit ${Config.SubscanBaseUrl}/extrinsic/${trans_result?.data?.hash || ''} for detail\r\n
  `
  await submitIssueComment(issue_loc, robot_comment)
  console.log(robot_comment)
  if (developer.own_polka_address) return
  // 未绑定个人账户，提醒其去bytepay提现
  robot_comment = `
  \r\n**@${task.developer.login}:**\r\n
  \r\nGoto ${CryptoPayLabUrl}/settings/withdraw to withdraw the token you earned :)\r\n
  `
  await submitIssueComment(issue_loc, robot_comment)
  console.log(robot_comment)
  
}

async function OtherPayTask(collTask: CollectionReference, issuePayload: Issue, issue_loc: IssueLoc) {
  const { comment, sender } = issuePayload

  let robot_comment = ''
  const collUser = cloud.database().collection('user')
  const { data: user } = await collUser.where({ id: sender.id }).getOne()
  // 1. 判断该支付者是否余额充足
  const balanceResult = await cloud.invoke('get_polkadot_account_info', { body: { id: user.id } })
  if (balanceResult.error !== 0) return console.log('Get Account Balance Error')
  const issue_content = comment.body
  const matchResult = issue_content.match(PaidReg2)
  const receiver_login = matchResult[1]
  const dotNumber = parseFloat(matchResult[2])
  const frozenAmount = user?.frozenAmount || 0
  // 余额不足提醒充值
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
  // 2. 确定收款人地址
  const { data: receiver } = await collUser.where({ login: receiver_login }).getOne()
  if (!receiver) {
    robot_comment = `**We can not locate ${receiver_login}'s address**`
    submitIssueComment(issue_loc, robot_comment)
    return console.log(robot_comment)
  }
  let address = receiver.polka.address
  if (receiver.own_polka_address) address = receiver.own_polka_address
    // 5. 检查是否满足支付条件
  const { error: eb, data: rb } = await Funcs.getPolkaAccountInfoFunc(address)
  if (eb != 0) {
    robot_comment = `**Bytepay: Get ${address} account info error.**`
    submitIssueComment(issue_loc, robot_comment)
    return console.log(robot_comment)
  }
  const receiver_blance_total = rb.free + rb.reserved + rb.miscFrozen + rb.feeFrozen
  if ((receiver_blance_total < 1 && dotNumber < 1) || balanceResult.data.free - dotNumber < 1) {
    robot_comment = `
    \r\nTransfer not executed because of Existential Deposit Error\r\n
    \r\nView ${Config.ExistentailDepositDocUrl} for detail.\r\n
    `
  }
  console.log({ rb, ob: balanceResult.data })
  // 3. 支付
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
    return console.log(robot_comment)
  }
  // 4. Robot 发布 comment
  robot_comment = `
  \r\n**@${receiver_login}:**\r\n
  \r\n**${sender.login} have paid ${dotNumber} DOT for you :)**, visit ${Config.SubscanBaseUrl}/extrinsic/${trans_result?.data?.hash || ''} for detail\r\n
  `
  await submitIssueComment(issue_loc, robot_comment)
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
  const { issue, comment, sender } = issuePayload
  const issue_content = comment.body
  const matchResult = issue_content.match(BindReg)
  const address = matchResult[1]
  let robot_comment = ''
  // 确定绑定者账户
  const collUser = cloud.database().collection('user')
  const { data: user } = await collUser.where({ id: sender.id }).getOne()
  // 绑定地址
  await collUser.where({ id: sender.id }).update({ own_polka_address: address })
  // Robot Comment
  robot_comment = `
  \r\n**@${sender.login}:**\r\n
  \r\nBind Success.\r\n
  \r\nNow Your Own Polka Address Is: \`${address}\`\r\n
  `
  // 如之前已绑定，则提醒
  if (user.own_polka_address) {
    robot_comment += `
    \r\nPrevious Is: \`${user.own_polka_address}\`\r\n
    `
  }
  await submitIssueComment(issue_loc, robot_comment)
  return console.log(robot_comment)
}

// 按照定义，我们只监听 issue comment event 和 issue close event
// issue 格式参照上述正则定义
async function Dispatch(issuePayload: Issue) {
  const { sender } = issuePayload
  const collUser = cloud.database().collection('user')
  // 1. 屏蔽我们自己的机器人
  if (issuePayload.sender.id === Config.CryptoPayLabBotId) return
  // 0. 为sender注册账户
  try {
    const { data: user } = await collUser.where({ id: sender.id }).getOne()
    if (!user) {
      console.log('Create user manualy.')
      await cloud.invoke('create_user', { body: sender })
    }
  } catch (error) {
    console.log('create account manualy error', error)
  }
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
    // 调试用
    debugInfo(issuePayload)
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
  // 解析 issue, 数据分发
  await Dispatch(body)
}

