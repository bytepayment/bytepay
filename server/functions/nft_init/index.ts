

import cloud from '@/cloud-sdk'
import { ApiPromise, WsProvider } from '@polkadot/api';


const NFTConfig = {
  TokenName: 'BNX',
  Unit: 1000 * 1000 * 1000 * 1000,
  SubstrateLocalProvider: 'ws://216.128.134.168:9944',
  BinaryClassId: 0x00000001,
  SourceClassId: 0x00000002
}

const createPolkaApiFunc = async function () {
  const key = NFTConfig.SubstrateLocalProvider
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

const NFTFuncs = {
  createPolkaApiFunc
}

exports.main = async function (ctx: FunctionContext) {
  const uid = ctx.auth?.uid
    if (!uid) {
        return {
            error: 1,
            msg: "Unauthorized",
        }
    }

  cloud.shared.set('nft_config', NFTConfig)
  cloud.shared.set('nft_funcs', NFTFuncs)
  return 'ok'
}
