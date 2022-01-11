import cloud from "@/cloud-sdk"
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
    author_association: string
  }
  comment: {
    id: number
    body: string
    created_at: string
    updated_at: string
    html_url: string
    user: User
    author_association: string
  }
  repository: {
    id: number
    name: string
    full_name: string
    owner: User
    html_url: string
  }
  sender: User
}
const CreateReg = new RegExp(/Dotpay:\s+\/pay\s+([0-9]\d*\.?\d*)\s+DOT/)
const ApplyReg = new RegExp(/Dotpay:\s+\/apply task/)
const PaidReg = new RegExp(/Dotpay:\s+\/paid\s(.*)\s+([0-9]\d*\.?\d*)\s+DOT/)

exports.main = async function (ctx: FunctionContext) {
  // body 为 github 传入的 issue 对象
  const { body } = ctx
  // 解析 issue, 数据分发
  Dispatch(body)
  const db = cloud.database()
  const collHookPayload = db.collection("hook_payload")
  collHookPayload.add({ ...body }) // 调试用，待删
}

// Can you speak chinese, yes i can
// 按照定义，我们只监听 issue comment, 即 issue中含有 comment 字段
// issue 格式参照
async function Dispatch(issuePayload: Issue) {
  // Discard Non-Comment Issue
  if (!issuePayload.comment) {
    return
  }
  // 数据库操作
  const db = cloud.database()
  const collHookPayload = db.collection("hook_payload")
  const collTask = db.collection("tasks")
  const { issue, comment, repository, sender } = issuePayload
  const issue_content = comment.body
  // 发布任务
  if (issue_content.match(CreateReg)) {
    // Check If Have Permission - 只有库的作者才可以发布任务
    if (sender.id !== repository.owner.id) {
      return console.log("Only Author Of Repository Can Create A New Task.")
    }
    // 一个 Issue 下只能发布一个任务
    const f = await collTask.where({ id: issue.id }).getOne()
    if (f.data) {
      return console.log("A Single Issue Can Create One Task Only.")
    }
    // Add This Task Into Our Own Database
    const matchResult = issue_content.match(CreateReg)
    const dotNumber = parseFloat(matchResult[1])
    const newTask = {
      id: issue.id,
      name: issue.title,
      task_url: issue.html_url,
      repo: repository.full_name,
      repo_url: repository.html_url,
      author: issue.user.login,
      pay: dotNumber,
      describe: issue.body,
      createTime: comment.created_at,
      updataTime: comment.updated_at,
    }
    await collTask.add(newTask)
    // 申请任务
  } else if (issue_content.match(ApplyReg)) {
    const matchResult = issue_content.match(CreateReg)
    // 支付任务
  } else if (issue_content.match(PaidReg)) {
    const matchResult = issue_content.match(CreateReg)
    // 未匹配
  } else {
    console.log("Not Dotpay related issue")
  }
}
