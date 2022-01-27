

import cloud from '@/cloud-sdk'
import axios from 'axios'

const GET_USER_URL = 'https://api.github.com/user'

exports.main = async function (ctx: FunctionContext) {
  // body, query 为请求参数, auth 是授权对象
  const { auth, body, query } = ctx
  const { token } = body
  const headers = { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
  // Request Github
  try {
    const r = await axios({
      url: GET_USER_URL,
      method: 'POST',
      headers
    })
    // Write into our own database
    const userColl = cloud.database().collection('user')
    const f = await userColl.where({ id: r.data.id }).getOne()
    if (!f.data) {
      await userColl.add({ token, ...r.data, isSetPass: false })
      return { token, ...r.data, isSetPass: false }
    } else {
      console.log('update user info')
      if (r.data.updated_at !== f.data.updated_at) {
        await userColl.where({ id: r.data.id }).update({ ...r.data })
      }
      if (token !== f.data.token) {
        await userColl.where({ id: r.data.id }).update({ token })
      }
      if (f.data.polka) f.data.polka.mnemonic = null;
      if (f.data.password) f.data.password = null;
      return { ...f.data }
    }
  } catch (error) {
    console.log(error?.response || 'caught error')
    if (error?.response?.status === 400 || error?.response?.status === 401) {
      return { error: 1, error_msg: 'token was revoked'}
    }
  }

}
