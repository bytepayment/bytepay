

import cloud from '@/cloud-sdk'
import axios from 'axios'

const GET_USER_URL = 'https://api.github.com/user'

exports.main = async function (ctx: FunctionContext) {
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
    // Write into our own database
    const userColl = cloud.database().collection('user')
    const { data: user } = await userColl.where({ id: r.data.id }).getOne()
    if (!user) {
      await userColl.add({ token, ...r.data, isSetPass: false })
      return { token, ...r.data, isSetPass: false }
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
      return { ...user }
    }
  } catch (error) {
    console.log(error?.response || 'caught error')
    if (error?.response?.status === 400 || error?.response?.status === 401) {
      return { error: 1, error_msg: 'token was revoked'}
    }
  }

}
