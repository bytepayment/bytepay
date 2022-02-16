

import cloud from '@/cloud-sdk'
import { ApiPromise, WsProvider } from '@polkadot/api';
import * as crypto from 'crypto'

interface PolkaAccount {
  free: number,
  reserved: number,
  miscFrozen: number,
  feeFrozen: number,
}

const Config = {
  CryptoPayLabUrl: 'http://localhost:10086', // 前端地址
  CryptoPayLabBotToken: 'Z2hwXzJUSmxHVENUZGJLYzFMZFhIa0hTYWtzV0xFOGxIQzFwS3E0Qw==', // Github 机器人 Token
  CryptoPayLabBotId: 97644321, // Github 机器人 Id
  CryptoPayLabPrivateKey: 'OaXrkPelv%Artij0ZL7P^^qyHjBKc&wsfyD3V3AXnq@3Gj3zQ$9g7OXvm8==hnh', // App Private Key
  CryptKey: 'G9U15nVyI5n9Ugoc',
  CryptIV: 'j59SOZYAGDSemJEf',
  OauthAppId: '8ab7f2f0d33da575a717', // Oauth App Client Id
  OauthAppSecret: '5c5ab49116569b6830aa0ca80d0c1d9ceb90b83b', // Oauth App Secret
  PolkaProviderWestend: 'wss://westend-rpc.polkadot.io', // Polka 测试链 Api Provider
  PolkaProviderDefault: 'wss://rpc.polkadot.io', // Polka 主链 Api Provider
  BindRepoWebhooksUrl: 'https://b614c047-f7fc-4f6d-a56f-3004c27dbe9a.bytepay.online:8000/func/webhooks', // 绑定仓库时添加的hook地址
  SubscanApiKey: '9b13dfb5b92bab46d30dab14fb28fac8', // Subscan Api Key
  SubscanApiBaseUrl: 'https://westend.api.subscan.io', // Subscan Api Base Url, Now is Westend,
  SubscanBaseUrl: 'https://westend.subscan.io', // Subscan Api Base Url, Now is Westend,
  ExistentailDepositDocUrl: 'https://wiki.polkadot.network/docs/build-protocol-info#existential-deposit',
}

const createPolkaApiFunc = async function () {
  // const key = 'wss://westend.api.onfinality.io/public-ws'
  const key = Config.PolkaProviderWestend
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

const getPolkaAccountInfoFunc = async function (address: string) {
  const api = await createPolkaApiFunc()
  try {
    const queryResult = await api.query.system.account(address);
    const data = reduceUnitFunc(queryResult.data)
    return { error: 0, data}
  } catch(error) {
    return { error: 2, error_msg: 'Internal Server Error' }
  }
}

const hashFunc = function (content: string) {
  return crypto.createHash('sha256').update(Config.CryptoPayLabPrivateKey + content).digest('hex')
}

const reduceUnitFunc = function (account: PolkaAccount) {
  const unit = 1000 * 1000 * 1000 * 1000
  return {
    free : account.free / unit,
    reserved : account.reserved / unit,
    miscFrozen : account.miscFrozen / unit,
    feeFrozen : account.feeFrozen / unit
  }
}

const aesEncryptFunc = function (text: string) {
  const cipher = crypto.createCipheriv('aes128', Config.CryptKey, Config.CryptIV)
  let crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex')
  return crypted
}

const aesDecryptFunc = function (text: string) {
  const cipher = crypto.createDecipheriv('aes128', Config.CryptKey, Config.CryptIV)
  let decrypted = cipher.update(text, 'hex', 'utf8')
  decrypted += cipher.final('utf8')
  return decrypted
}

const Funcs = {
  createPolkaApiFunc,
  getPolkaAccountInfoFunc,
  hashFunc,
  reduceUnitFunc,
  aesEncryptFunc,
  aesDecryptFunc
}

exports.main = async function (ctx: FunctionContext) {

  cloud.shared.set('config', Config)
  cloud.shared.set('funcs', Funcs)
  return 'ok'
}
