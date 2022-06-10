

import cloud from '@/cloud-sdk'

exports.main = async function (ctx: FunctionContext) {
  // body, query 为请求参数, auth 是授权对象
  const { body } = ctx
  const { address, id } = body
  // 数据库操作
  const db = cloud.database()
  const f = await db.collection('user').where({ id }).getOne()
  if (!f.data) {
    return { error: 1, error_msg: 'No Specified User!'}
  }
  // 这个限制逻辑可能需要去掉
  // if (f.data.own_polka_address) {
  //   return { error: 2, error_msg: 'You have bind your own address already!'}
  // }
  // 更新数据库
  await db.collection('user').where({ id }).update({own_polka_address: address})

  return { error: 0, error_msg: 'success' }
}
