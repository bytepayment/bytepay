
import cloud from '@/cloud-sdk'
import axios from 'axios'

const client_id = '8ab7f2f0d33da575a717'
const client_secret = '5c5ab49116569b6830aa0ca80d0c1d9ceb90b83b'
const tokenUrl = `https://github.com/login/oauth/access_token`
const headers = { 'Accept': 'application/json' }

exports.main = async function (ctx: FunctionContext) {
  // body, query 为请求参数, auth 是授权对象
  const { body } = ctx
  console.log(body)
  const { code } = body
  const data = { client_id, client_secret, code }
  const tokenRes = await axios({
    url: tokenUrl,
    data,
    headers
  })
  console.log(tokenRes.data)
  return tokenRes.data
}
