

import cloud from '@/cloud-sdk'
import axios from 'axios'

const GET_USER_URL = 'https://api.github.com/user'

exports.main = async function (ctx: FunctionContext) {
  // body, query 为请求参数, auth 是授权对象
  const { auth, body, query } = ctx
  const { token } = body
  const headers = { 'Accept': 'application/json' , 'Authorization': `Bearer ${token}`}
  // Request Github
  const r = await axios({
    url: GET_USER_URL,
    method: 'POST',
    headers
  })
  // Write into our own database
  const userColl = cloud.database().collection('user')
  const f = await userColl.where({ id: r.data.id }).getOne()
  if (!f.data) {
    userColl.add({token, ...r.data})
  } else {
    console.log('update user info')
    userColl.where({ id: r.data.id }).update({token})
  }
  return r.data
}
