

import cloud from '@/cloud-sdk'
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring'

const Funcs = cloud.shared.get('funcs')
const createPolkaApi = Funcs.createPolkaApiFunc

export async function main (ctx: FunctionContext) {

  const { body } = ctx
  const { pay_user_id, recv_address, amount } = body
  const api = await createPolkaApi()
  if (pay_user_id !== 37979965) {
    return { error: 2, error_msg: 'This api is opened for test user only.'}
  }
  // 检查支付用户的polka账号信息
  const coll = cloud.database().collection('user')
  const f = await coll.where({ id: pay_user_id }).getOne()
  if (!f.data) return { error: 1, error_msg: 'No user' }
  const mnemonic = f.data.polka.mnemonic
  // Create key pair
  const keyring = new Keyring({ type: 'sr25519' });
  const pair = keyring.createFromUri(mnemonic);
  // 单位换算
  const amount_dot = 10000 * 10000 * 10000 * amount
  // Sign and Send the transaction
  // Just Limit the test
  if (pay_user_id === 37979965 && amount > 0.0001) {
    return { error: 2, error_msg: 'Too much amount for this user.'}
  }
  try {
    const hash = await api.tx.balances
        .transfer(recv_address, amount_dot)
        .signAndSend(pair);
    return { error: 0, data: { hash: hash.toHex() }}
  } catch (error) {
    console.log(error)
    return { error: 5, error_msg: 'Internal server error' }
  }
  
}


