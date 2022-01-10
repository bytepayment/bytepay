

import cloud from '@/cloud-sdk'
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring'

const SUNLONG = '5G6DLm6e6Np4x9WuDdNuozbcdtFHQyBxhcU7C1dUgZFVzhZk';

const mnemonic = 'flavor gallery bean admit envelope aim mosquito prison state reform observe help'

export async function main (ctx: FunctionContext) {

  const api = await createPolkApi()

  const amount = 10000 * 10000 * 10000 * 0.1

  // Constuct the keyring after the API (crypto has an async init)
  const keyring = new Keyring({ type: 'sr25519' });
  const pair = keyring.createFromUri(mnemonic);
  console.log(pair)
  // Sign and Send the transaction
  const hash = await api.tx.balances
    .transfer(SUNLONG, amount)
    .signAndSend(pair);

  console.log('Transfer sent with hash', hash.toHex());
  return  hash.toHex()
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

