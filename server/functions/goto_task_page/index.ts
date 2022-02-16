

import cloud from '@/cloud-sdk'

exports.main = async function (ctx: FunctionContext) {
  // body, query 为请求参数, auth 是授权对象
  const { body } = ctx
  const { id } = body

  // 数据库操作
  const db = cloud.database()
  const { data: user } = await db.collection('user').where({ id }).getOne()
  if (!user) {
    return { error: 1, error_msg: 'User Not Found' }
  }
  const gotoTaskPageTimes = user.gotoTaskPageTimes || 0

  await db.collection('user').where({ id }).update({ gotoTaskPageTimes: gotoTaskPageTimes + 1 })
  return { error: 0, error_msg: 'Success' }
}
