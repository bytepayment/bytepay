

import cloud from '@/cloud-sdk'
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring'

const Funcs = cloud.shared.get('funcs')
const createPolkaApi = Funcs.createPolkaApiFunc
const aesDecrypt = Funcs.aesDecryptFunc

export async function main (ctx: FunctionContext) {

  const { body } = ctx
  const { pay_user_id, recv_address, amount } = body
  const api = await createPolkaApi()
  // 检查支付用户的polka账号信息
  const coll = cloud.database().collection('user')
  const f = await coll.where({ id: pay_user_id }).getOne()
  if (!f.data) return { error: 1, error_msg: 'No user' }
  const mnemonic = f.data.polka.mnemonic
  const mnemonic_decrypted = aesDecrypt(mnemonic)
  // Create key pair
  const keyring = new Keyring({ type: 'sr25519' });
  const pair = keyring.createFromUri(mnemonic_decrypted);
  // 单位换算
  const amount_dot = 10000 * 10000 * 10000 * amount
  // Sign and Send the transaction
  try {
    const hash = await api.tx.balances
        .transfer(recv_address, amount_dot)
        .signAndSend(pair);
    return { error: 0, data: { hash: hash.toHex() }}
  } catch (error) {
    console.log(error)
    return { error: 5, error_msg: error }
  }
  
}


