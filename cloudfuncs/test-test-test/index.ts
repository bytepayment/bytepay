

import cloud from '@/cloud-sdk'

exports.main = async function (ctx: FunctionContext) {
  // body, query 为请求参数, auth 是授权对象


  const Config = {
    // 前端地址
    CryptoPayLabUrl: 'http://localhost:10086',
    // 绑定仓库时添加的hook地址
    BindRepoWebhooksUrl: 'https://b614c047-f7fc-4f6d-a56f-3004c27dbe9a.bytepay.online:8000/func/webhooks',
    // Github 机器人 Token
    CryptoPayLabBotToken: 'Z2hwXzJUSmxHVENUZGJLYzFMZFhIa0hTYWtzV0xFOGxIQzFwS3E0Qw==',
    // Github 机器人 Id
    CryptoPayLabBotId: 97644321,
    // App Private Key
    CryptoPayLabPrivateKey: 'OaXrkPelv%Artij0ZL7P^^qyHjBKc&wsfyD3V3AXnq@3Gj3zQ$9g7OXvm8==hnh',

    CryptKey: 'G9U15nVyI5n9Ugoc',
    CryptIV: 'j59SOZYAGDSemJEf',

    OauthAppId: '8ab7f2f0d33da575a717', // Oauth App Client Id
    OauthAppSecret: '5c5ab49116569b6830aa0ca80d0c1d9ceb90b83b', // Oauth App Secret

    // Polka 测试链 Api Provider
    PolkaProviderWs: 'wss://westend-rpc.polkadot.io',
    // Polka 主链 Api Provider
    // PolkaProviderWs: 'wss://rpc.polkadot.io',

    // Acala 生产 环境
    // AcalaProviderWs: '"wss://karura.api.onfinality.io/public-ws"',
    // Acala 测试 环境
    AcalaProviderWs: 'wss://node-6870830370282213376.rz.onfinality.io/ws?apikey=0f273197-e4d5-45e2-b23e-03b015cb7000',

    // Subscan Api Key
    SubscanApiKey: '9b13dfb5b92bab46d30dab14fb28fac8',
    // Subscan Api Base Url, Now is Westend,
    SubscanApiBaseUrl: 'https://westend.api.subscan.io',

    // ACALA 的生产环境地址(查询交易记录)
    // AcalaSubscanApiBaseUrl: 'https://acala.api.subscan.io',
    // ACALA 的测试环境地址(查询交易记录)
    AcalaSubscanApiBaseUrl: 'https://acala-testnet.api.subscan.io',

    // Subscan Api Base Url, Now is Westend,
    SubscanBaseUrl: 'https://westend.subscan.io',
    ExistentailDepositDocUrl: 'https://wiki.polkadot.network/docs/build-protocol-info#existential-deposit',

    nearExplorerUrl: 'https://explorer.near.org/transactions/',
    nearConfig: {
      mainAccount: 'yudie.testnet',
      privateKey: '4g6oz55foGsd7DfxgGNdsy7g8G9qQH3x3XsTT646Gh22edfhxPqaXm3LbLzqAYbaKa4aYpqKRrsBf7gG6Qe8pzUA',
      publicKey: 'FfnKsGnWh1GeVBPCNnHvTQYoTe8VgRCidNTaqxvZfcok',
      networkId: 'testnet',
      nodeUrl: 'https://rpc.testnet.near.org',
      walletUrl: 'https://wallet.testnet.near.org',
      helperUrl: 'https://helper.testnet.near.org',
      explorerUrl: 'https://explorer.testnet.near.org',
    },
  }


  const configColl = cloud.database().collection('sys_config')

  const res = await configColl.add({
    key: 'init_config_key',
    value: Config,
  })

  return res
}
