import cloud from '@/cloud-sdk'
import { Keyring } from '@polkadot/keyring'

const NFTFuncs = cloud.shared.get('nft_funcs')
const NFTConfig = cloud.shared.get('nft_config')

const createPolkaApi = NFTFuncs.createPolkaApiFunc
const keyring = new Keyring({ type: 'sr25519', ss58Format: 42 });
const alice = keyring.addFromUri('//Alice', { name: 'Alice Default' });
const BinaryClassId = NFTConfig.BinaryClassId
const SourceClassId = NFTConfig.SourceClassId

exports.main = async function (ctx: FunctionContext) {
  const uid = ctx.auth?.uid
    if (!uid) {
        return {
            error: 1,
            msg: "Unauthorized",
        }
    }
  const { body } = ctx
  const { address } = body
  const api = await createPolkaApi()

  const data = await (await api.query.uniques.class(SourceClassId)).toString()
  console.log(data)
}

async function createClass(id) {
  const api = await createPolkaApi()
  try {
    const data = await api.tx.uniques
      .create(id, alice.address)
      .signAndSend(alice)
    console.log(data)
  } catch (error) {
    console.log(error)
  }
}

