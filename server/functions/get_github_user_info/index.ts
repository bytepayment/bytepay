

import cloud from '@/cloud-sdk'
import axios from 'axios'

const GET_USER_URL = 'https://api.github.com/user'

exports.main = async function (ctx: FunctionContext) {
  console.log(ctx)
  // body, query 为请求参数, auth 是授权对象
  const { body } = ctx
  const { token } = body
  const headers = { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
  // Request Github
  try {
    const r = await axios({
      url: GET_USER_URL,
      method: 'GET',
      headers
    })
    console.log(r.data, 'r.daat')
    // Write into our own database
    const userColl = cloud.database().collection('user')
    const { data: user } = await userColl.where({ id: r.data.id }).getOne()
    if (!user) {

      await userColl.add({ token, ...r.data, isSetPass: false })
      const res = await userColl.where({ id: r.data.id }).getOne()
      const tempUser = res.data.user
      // 默认 token 有效期为 7 天
      const expire = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365
      const payload = {
        uid: tempUser._id,
        exp: expire,
      }

      const access_token = cloud.getToken(payload)

      return {  token:access_token, ...r.data, isSetPass: false }
    } else {
      if (r.data.updated_at !== user.updated_at) {
        console.log('Update user info')
        await userColl.where({ id: r.data.id }).update({ ...r.data })
      }
      if (token !== user.token) {
        console.log('Update user token')
        await userColl.where({ id: r.data.id }).update({ token })
      }
      // shiled polka mnemonic and password
      if (user.polka) user.polka.mnemonic = null;
      if (user.password) user.password = null;

            // 默认 token 有效期为 7 天
      const expire = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365
      const payload = {
        uid: user._id,
        exp: expire,
      }

       user.token =  cloud.getToken(payload)
      
      return { ...user }
    }
  } catch (error) {
    console.log(error)
    console.log(error?.response || 'caught error')
    if (error?.response?.status === 400 || error?.response?.status === 401) {
      return { error: 1, error_msg: 'token was revoked' }
    }
  }

}
