

import cloud from '@/cloud-sdk'

exports.main = async function (ctx: FunctionContext) {
  // body, query 为请求参数, auth 是授权对象
  const { body } = ctx
  const { repo_id } = body
  // 数据库操作
  const db = cloud.database()
  const r = await db.collection('tasks').where({repo_id}).get()

  return r.data
}
