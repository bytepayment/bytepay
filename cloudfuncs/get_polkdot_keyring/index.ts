

import cloud from '@/cloud-sdk'
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring'
import { mnemonicGenerate } from '@polkadot/util-crypto';


export async function main (ctx: FunctionContext) {

  const { body } = ctx
  const { id } = body
  // Find if this user have generate account already
  const userColl = cloud.database().collection('user')
  const f = await userColl.where({ id }).getOne()
  // User Not Found
  if (!f.data) {
    return { error: 1, error_msg: 'User Not found'}
  }
  // Have generated polka accounts already
  if (f.data.polka) {
    let polka = f.data.polka
    // shiled mnemonic property
    polka.mnemonic = null
    return { error: 0, data: polka }
  }
  // Generated polka account for this user
  const api = await createPolkApi()
  // Constuct the keyring after the API (crypto has an async init)
  const keyring = new Keyring({ type: 'sr25519' });
  const mnemonic = mnemonicGenerate()
  const pair = keyring.createFromUri(mnemonic);
  const address = pair.address
  const polka = {
    mnemonic, address, type: pair.type, meta: pair.meta, publicKey: pair.publicKey
  }
  // Save polka accounts into our own database
  try {
    const ur = await userColl.where({id}).update({ polka })
    return { error: 0, data: { address, type: pair.type, meta: pair.meta, publicKey: pair.publicKey } }
  } catch (error) {
    return { error: 5, error_msg: error }
  }

}

async function createPolkApi() {
  // const key = 'wss://westend.api.onfinality.io/public-ws'
  const key = 'wss://westend-rpc.polkadot.io'
  let api: ApiPromise = cloud.shared.get(key)
  if (api) {
    console.log('use already connected polkaapi: ', api.isConnected)
    return api
  }

  const wsProvider = new WsProvider(key);
  api = await ApiPromise.create({ provider: wsProvider });
  cloud.shared.set(key, api)
  return api
}

