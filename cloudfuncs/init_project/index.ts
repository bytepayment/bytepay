

import cloud from '@/cloud-sdk'
import { ApiPromise, WsProvider } from '@polkadot/api';
import * as crypto from 'crypto'


const Config = {
  CryptoPayLabUrl: 'http://dotpay.com:3000', // 前端地址
  CryptoPayLabBotToken: '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', // Github 机器人 Token
  CryptoPayLabPrivateKey: 'OaXrkPelv%Artij0ZL7P^^qyHjBKc&wsfyD3V3AXnq@3Gj3zQ$9g7OXvm8==hnh', // App Private Key
  OauthAppId: '8ab7f2f0d33da575a717', // Oauth App Client Id
  OauthAppSecret: '5c5ab49116569b6830aa0ca80d0c1d9ceb90b83b', // Oauth App Secret
  PolkaProviderWestend: 'wss://westend-rpc.polkadot.io', // Polka 测试链 Api Provider
  PolkaProviderDefault: 'wss://rpc.polkadot.io', // Polka 主链 Api Provider
  BindRepoWebhooksUrl: 'https://6119a1ac-1e79-4449-8665-f4f7d3066a5a.lafyun.com/func/webhooks', // 绑定仓库时添加的hook地址
  SubscanApiKey: '9b13dfb5b92bab46d30dab14fb28fac8', // Subscan Api Key
  SubscanApiBaseUrl: 'https://westend.api.subscan.io', // Subscan Api Base Url, Now is Westend,
}


const hashFunc = function (content: string) {
  return crypto.createHash('sha256').update(Config.CryptoPayLabPrivateKey + content).digest('hex')
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

const Funcs = {
  createPolkaApiFunc,
  hashFunc
}

exports.main = async function (ctx: FunctionContext) {

  cloud.shared.set('config', Config)
  cloud.shared.set('funcs', Funcs)
  return 'ok'
}
