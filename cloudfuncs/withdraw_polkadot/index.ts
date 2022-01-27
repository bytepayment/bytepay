

import cloud from '@/cloud-sdk'
import * as crypto from 'crypto'

const Funcs = cloud.shared.get('funcs')
const createPolkaApi = Funcs.createPolkaApiFunc

interface PolkaAccount {
  free: number,
  reserved: number,
  miscFrozen: number,
  feeFrozen: number,
}

const privateKey = 'OaXrkPelv%Artij0ZL7P^^qyHjBKc&wsfyD3V3AXnq@3Gj3zQ$9g7OXvm8==hnh'

exports.main = async function (ctx: FunctionContext) {
  const { body } = ctx
  const { id, address, password, amount } = body
  const coll = cloud.database().collection('user')
  try {
    const f = await coll.where({ id }).getOne()
    // 1 - Check User
    if (!f.data) return { error: 1, error_msg: 'User Not Found!' }
    // 2 - Check Password
    console.log(hash(password))
    console.log(f.data.password)
    if (hash(password) !== f.data.password) return { error: 2, error_msg: 'Password Incorrect!' }
    // 3 - Check Amount
    // Get Amount And Frozen Amount
    const frozenAmount = f.data?.frozenAmount || 0
    const api = await createPolkaApi()
    const queryResult = await api.query.system.account(f.data.polka.address);
    const data = reducedUnit(queryResult.data)
    if (data.free - frozenAmount < Number(amount)) {
      return { error: 2, error_msg: `You have only ${data.free - frozenAmount} dot available, less than ${amount} you want to withdraw` }
    }
    // 4 - Start transfer
    const transResult = await cloud.invoke('polka_dot_transfer', { body: { pay_user_id: id, recv_address: address, amount } })
    if (transResult.error !== 0) return { error: 4, error_msg: transResult.error_msg }
    return { error: 0, data: transResult.data }
  } catch (error) {
    return { error: 5, error_msg: 'Internal Server Error' }
  }
}

function hash(content: string) {
  return crypto.createHash('sha256').update(privateKey + content).digest('hex')
}

function reducedUnit(account: PolkaAccount) {
  const unit = 1000 * 1000 * 1000 * 1000
  return {
    free: account.free / unit,
    reserved: account.reserved / unit,
    miscFrozen: account.miscFrozen / unit,
    feeFrozen: account.feeFrozen / unit
  }
}
