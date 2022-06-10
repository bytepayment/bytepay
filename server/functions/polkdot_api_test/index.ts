

import cloud from '@/cloud-sdk'
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring'
import { mnemonicGenerate } from '@polkadot/util-crypto';

const SUNLONG = '5FyS5dfoWvRHp6o5VkkmiJJeDdLSo5CzfR3PSKpyYX9ZbWVs';
const Alice = '5DTestUPts3kjeXSTMyerHihn1uwMfLj8vU8sqF7qYrFabHE'

export async function main(ctx: FunctionContext) {

  const api = await createPolkApi()
  // const wsProvider = new WsProvider('wss://rpc.polkadot.io');
// const api = await ApiPromise.create({ provider: wsProvider });
  // Retrieve the account balance & nonce via the system module
  // Retrieve the last timestamp
  // const now = await api.query.timestamp.now();
  // console.log(now)
  // Retrieve the account balance & nonce via the system module
  const queryResult = await api.query.system.account(SUNLONG);
  // console.log(await api.query.system.account(Alice))
  console.log(`${queryResult.data.free.toHuman()}`)
  // console.log(`${now}: balance of ${balance.free} and a nonce of ${nonce}`);
  // console.log(balance)
  return 'hello world'

}

async function generateAccountByMnemonic() {
  const mnemonic = mnemonicGenerate()
  // Constuct the keyring after the API (crypto has an async init)
  const keyring = new Keyring({ type: 'sr25519' });
  console.log(mnemonic)
  const pair = keyring.createFromUri(mnemonic);
  console.log(pair.address)
}

async function createPolkApi() {
  const key = 'wss://westend.api.onfinality.io/public-ws'
  // const key = 'wss://westend-rpc.polkadot.io'
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

