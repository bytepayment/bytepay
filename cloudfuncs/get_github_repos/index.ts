


import cloud from '@/cloud-sdk'
import axios from 'axios'

const GET_REPO_URL = 'https://api.github.com/user/repos'

exports.main = async function (ctx: FunctionContext) {
  // body, query 为请求参数, auth 是授权对象
  const { auth, body, query } = ctx
  const { token } = body
  const headers = { 'Accept': 'application/json' , 'Authorization': `Bearer ${token}`}
  // 数据库操作
  const r = await axios({
    url: GET_REPO_URL,
    method: 'GET',
    headers
  })
  return r.data
}


