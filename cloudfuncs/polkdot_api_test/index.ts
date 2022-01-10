

import cloud from '@/cloud-sdk'
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring'
import { mnemonicGenerate } from '@polkadot/util-crypto';

const SUNLONG = '5FyS5dfoWvRHp6o5VkkmiJJeDdLSo5CzfR3PSKpyYX9ZbWVs';

const mnemonic = mnemonicGenerate()

export async function main (ctx: FunctionContext) {

  const api = await createPolkApi()


  // Constuct the keyring after the API (crypto has an async init)
  const keyring = new Keyring({ type: 'sr25519' });
  console.log(mnemonic)
  const pair = keyring.createFromUri(mnemonic);
  console.log(pair.address)
  console.log(pair.publicKey)

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

