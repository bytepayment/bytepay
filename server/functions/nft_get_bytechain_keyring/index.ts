

import cloud from '@/cloud-sdk'
import { Keyring } from '@polkadot/keyring'
import { mnemonicGenerate } from '@polkadot/util-crypto';

const NFTFuncs = cloud.shared.get('nft_funcs')
const NFTConfig = cloud.shared.get('nft_config')

const createPolkaApi = NFTFuncs.createPolkaApiFunc
const Unit = NFTConfig.Unit
const keyring = new Keyring({ type: 'sr25519', ss58Format: 42 });
const alice = keyring.addFromUri('//Alice', { name: 'Alice Default' });

exports.main = async function (ctx: FunctionContext) {
  const uid = ctx.auth?.uid
    if (!uid) {
        return {
            error: 1,
            msg: "Unauthorized",
        }
    }
  const { body } = ctx
  const { id } = body
  if (!id) return { error: 1, error_msg: 'missing id'}
  // 1. Find if this user have generate account already
  const userColl = cloud.database().collection('user')
  const { data: user } = await userColl.where({ id }).getOne()
  // 1-1. User Not Found
  if (!user) {
    return { error: 1, error_msg: 'User Not found'}
  }
  // 1-2. Have generated bytechain accounts already
  if (user.bytechain) {
    let bytechain = user.bytechain
    // shiled mnemonic property
    bytechain.mnemonic = null
    return { error: 0, data: bytechain }
  }
  // 2. Generated bytechain account for this user
  const api = await createPolkaApi()
  // 2.1 Constuct the keyring after the API (crypto has an async init)
  const mnemonic = mnemonicGenerate()
  const mnemonic_encrypted = mnemonic
  const pair = keyring.createFromUri(mnemonic);
  const address = pair.address
  const bytechain = {
    mnemonic: mnemonic_encrypted, address, type: pair.type, meta: pair.meta, publicKey: pair.publicKey
  }
  // 2.2 Transfer 100 Unit from alice to this user
 try {
    const hash = await api.tx.balances
        .transfer(address, 100 * Unit)
        .signAndSend(alice);
  } catch (error) {
    console.log(error)
  }
  // 3. Save bytechain accounts into our own database
  try {
    const ur = await userColl.where({id}).update({ bytechain })
    return { error: 0, data: { address, type: pair.type, meta: pair.meta, publicKey: pair.publicKey } }
  } catch (error) {
    return { error: 5, error_msg: error }
  }
}
