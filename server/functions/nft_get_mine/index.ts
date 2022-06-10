

import cloud from '@/cloud-sdk'

exports.main = async function (ctx: FunctionContext) {
  const uid = ctx.auth?.uid
    if (!uid) {
        return {
            error: 1,
            msg: "Unauthorized",
        }
    }
  // body, query 为请求参数, auth 是授权对象
  const { auth, body, query } = ctx
  const { classid } = ctx.body
  const { id } = body
  // 数据库操作
  const db = cloud.database()
  const r = await db.collection('nft_orders').where({ buyer_id: id }).get()

  if(r.ok) return {code:0,data:r.data}
}
