
import cloud from '@/cloud-sdk'
import { blake2AsHex } from '@polkadot/util-crypto'
const Hash = require('ipfs-only-hash')

const NFTFuncs = cloud.shared.get('nft_funcs')
const NFTConfig = cloud.shared.get('nft_config')
import { Keyring } from '@polkadot/keyring'

const keyring = new Keyring({ type: 'sr25519', ss58Format: 42 });
const createPolkaApi = NFTFuncs.createPolkaApiFunc

exports.main = async function (ctx: FunctionContext) {
  const uid = ctx.auth?.uid
    if (!uid) {
        return {
            error: 1,
            msg: "Unauthorized",
        }
    }
  // body, query 为请求参数, auth 是授权对象
  const { auth, body, query } = ctx

  let {
    id,
    title,
    price,
    version,
    project,
    total_supply,
    description,
    chanin_id,
    owner,
    owner_address,
    classid,
    file_path,
    file_hash,
    file_cid
  } = ctx.body

  // 验证
  if (!title) return { code: 1, message: 'title can not be null' }
  if (!price) return { code: 1, message: 'price can not be null' }
  if (!version) return { code: 1, message: 'version can not be null' }
  if (!project) return { code: 1, message: 'project can not be null' }
  if (!total_supply) return { code: 1, message: 'circulation can not be null' }
  if (!description) return { code: 1, message: 'description can not be null' }
  if (!classid) return { code: 1, message: 'classid can not be null' }
  if (!file_path) return { code: 1, message: 'filepath can not be null'}


  // 数据库操作
  const db = cloud.database()
  const r = await db.collection('nft').where({ project: project, classid:classid}).get()

  // 判断是否已经发布同版本
  for (let i = 0; i < r.data.length; i++) {
    if (version == r.data[i].version) return { code: 1, message: 'Can not submit same version of project' }
  }

  // Update File Hash
  try {
    const r = await cloud.fetch(`https://b614c047-f7fc-4f6d-a56f-3004c27dbe9a_public.fs.bytepay.online:8000${file_path}`)
    file_hash = blake2AsHex(r.data, 256)
    file_cid = await Hash.of(r.data)
    console.log(file_hash, file_cid)

  } catch (error) {
    return { code: 1, message: 'Get file hash error'}
  }

  // write into bytechain
  const api = await createPolkaApi()
  const { data: buyer } = await cloud.database().collection('user').where({ id }).getOne()
  if (!buyer) return { code: 2, message: 'User Not Found'}
  const buyer_pair = keyring.addFromUri(buyer.bytechain.mnemonic)
  try {
    const data = await api.tx.uniques
      .mint(classid, file_hash.substr(0, 10), buyer.bytechain.address)
      .signAndSend(buyer_pair)
    console.log(data)
  } catch (error) {
    console.log(error)
    return { code: 3, message: 'Mint NFT Error' }
  }

  // 入库
  const res = await db.collection('nft').add({
    title: title,
    price: price,
    version: version,
    project: project,
    total_supply: Number(total_supply),
    left_amount:  Number(total_supply),
    description: description,
    chain_id: chanin_id,
    owner: owner,
    owner_address: owner_address,
    id,
    classid: classid,
    file_path: file_path,
    file_hash: file_hash || 'file_hash',
    file_cid:  file_cid || 'file_cid',
    buyer: [],
    status: 0,
    created_time:Date.now()
  })

  if (res.ok) return { code: 0, message: 'success' }
}









