import cloud from '@/cloud-sdk'
import { Keyring } from '@polkadot/keyring'
const keyring = new Keyring({ type: 'sr25519', ss58Format: 42 });

const NFTFuncs = cloud.shared.get('nft_funcs')
const NFTConfig = cloud.shared.get('nft_config')

const createPolkaApi = NFTFuncs.createPolkaApiFunc
const Unit = NFTConfig.Unit
const TokenName = NFTConfig.TokenName

exports.main = async function (ctx: FunctionContext) {
  const uid = ctx.auth?.uid
    if (!uid) {
        return {
            error: 1,
            msg: "Unauthorized",
        }
    }
  const { body } = ctx
  const { nft_id, buyer_id } = body
  if (!nft_id || !buyer_id) return { error: 1, error_msg: 'Missing NFT Id or Buyer Id' }

  const collUser = cloud.database().collection('user')
  const collNFT = cloud.database().collection('nft')
  // 1. Find Nft And Buyer Info In Database
  const { data: nft } = await collNFT.where({ _id: nft_id }).getOne()
  if (!nft) return { error: 2, error_msg: 'NFT Not Found' }
  const { data: buyer } = await collUser.where({ id: buyer_id }).getOne()
  if (!buyer) return { error: 3, error_msg: 'Buyer Info Not Found' }

  // 2. Transfer token from buyer to NFT Owner
  try {
    const api = await createPolkaApi()
    const buyer_pair = keyring.addFromUri(buyer.bytechain.mnemonic)
    const hash = await api.tx.balances
        .transfer(nft.owner_address, Number(nft.price) * Unit)
        .signAndSend(buyer_pair);
  } catch (error) {
    console.log(error)
  }

  // 3. Save to order collection
  const collOrder = cloud.database().collection('nft_orders')
  await collOrder.add({
    title: nft.title,
    price: nft.price,
    version: nft.version,
    project: nft.project,
    file_path: nft.file_path,
    file_hash: nft.file_hash,
    file_cid: nft.file_cid,
    buyer_id,
    buy_time: new Date().getTime()
  })

  // 4. Update Nft document
  nft.buyer.push(buyer_id)
  await collNFT.where({ _id: nft_id }).update({ buyer: nft.buyer, left_amount: nft.left_amount - 1})


  return { error: 0, message: 'Buy success' }
}
