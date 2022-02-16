

import cloud from '@/cloud-sdk'

exports.main = async function (ctx: FunctionContext) {
  // body, query 为请求参数, auth 是授权对象
  const { auth, body, query } = ctx
  const { id } = body // github user id, unique
  // 数据库操作
  const db = cloud.database()
  const r = await db.collection('repos').where({owner_id: id}).get()
  console.log(r)

  return r.data
}
