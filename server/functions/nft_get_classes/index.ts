import cloud from '@/cloud-sdk'
const NFTFuncs = cloud.shared.get('nft_funcs')
const NFTConfig = cloud.shared.get('nft_config')

const BinaryClassId = NFTConfig.BinaryClassId
const SourceClassId = NFTConfig.SourceClassId

interface NFTClass {
  meta: {
    name: string,
    desc: string
  },
  chain_key: string,
  class_id: string
}

const BinClass: NFTClass = {
  meta: {
    name: 'Binary',
    desc: 'Binary file'
  },
  chain_key: BinaryClassId,
  class_id: '0x00000001'
}

const SourceClass: NFTClass = {
  meta: {
    name: 'Source',
    desc: 'Source file'
  },
  chain_key: SourceClassId,
  class_id: '0x00000002'
}

exports.main = async function (ctx: FunctionContext) {
  const uid = ctx.auth?.uid
    if (!uid) {
        return {
            error: 1,
            msg: "Unauthorized",
        }
    }

  
  

  return [BinClass, SourceClass]
}
