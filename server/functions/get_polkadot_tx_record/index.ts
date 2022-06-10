

import cloud from '@/cloud-sdk'
import axios from 'axios'

const Config = cloud.shared.get('config')

const key = Config.SubscanApiKey
const baseUrl = Config.SubscanApiBaseUrl

exports.main = async function (ctx: FunctionContext) {
  // body, query 为请求参数, auth 是授权对象
  const { body } = ctx
  const { id, page = 0, row = 10 } = body // user id
  // find user
  const collUser = cloud.database().collection('user')
  const f = await collUser.where({ id }).getOne()
  if (!f.data) return { error: 1, error_msg: 'no user' }
  try {
    let address = f.data.polka.address
    // 如果绑定了自己的账户，则查询自己账户的信息
    // if (f.data.own_polka_address) address = f.data.own_polka_address
    const r = await axios({
      url: `${baseUrl}/api/scan/transfers`,
      method: 'POST',
      headers: {
        'X-API-KEY': key,
        'Content-Type': 'application/json'
      },
      data: {
        address,
        page,
        row
      }
    })
    console.log(r.data)
    return { error: 0, ...r.data }
  } catch (error) {
    console.log(error)
    return { error: 2, error_msg: 'Internal Server Error' }
  }

}
