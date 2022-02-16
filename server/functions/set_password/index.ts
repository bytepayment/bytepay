

import cloud from '@/cloud-sdk'
import * as crypto from 'crypto'

const Funcs = cloud.shared.get('funcs')
const hash = Funcs.hashFunc


exports.main = async function (ctx: FunctionContext) {
  // body, query 为请求参数, auth 是授权对象
  const { body } = ctx
  const { id, password_form } = body
  console.log(password_form)
  const coll = cloud.database().collection('user')
  const f = await coll.where({ id }).getOne()
  if (!f.data) return { error: 1, error_msg: 'user not found'}
  // 设置新密码
  if (!f.data.isSetPass) {
    const password = hash(password_form.new_pass)
    await coll.where({ id }).update({ password, isSetPass: true })
    return { error: 0, error_msg: 'success' }
  // 修改老密码
  } else if (password_form.old_pass && password_form.new_pass && password_form.new_pass_again) {
    if (password_form.new_pass !== password_form.new_pass_again) {
      return { error: 2, error_msg: 'two password are not same.' }
    }
    const old_pass_hash = hash(password_form.old_pass)
    // 旧密码校验不一致
    if (old_pass_hash !== f.data.password) {
      return { error: 3, error_msg: 'Invalid Old Password' }
    }
    await coll.where({ id }).update({ password: hash(password_form.new_pass), isSetPass: true })
    return { error: 0, error_msg: 'success' }
  // 校验失败
  } else {
    return { error: 5, error_msg: 'user submit content error'}
  }
}
