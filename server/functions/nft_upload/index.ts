

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
  // 解析表单
  // 处理文件上传
  // 存数据库
  const db = cloud.database()
  const r = await db.collection('admins').get()
  console.log(r)

  return r.data
}
