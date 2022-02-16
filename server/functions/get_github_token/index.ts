
import cloud from '@/cloud-sdk'
import axios from 'axios'

const Config = cloud.shared.get('config')

const client_id = Config.OauthAppId
const client_secret = Config.OauthAppSecret

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
