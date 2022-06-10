

import cloud from '@/cloud-sdk'

const NFTFuncs = cloud.shared.get('nft_funcs')
const NFTConfig = cloud.shared.get('nft_config')

const createPolkaApi = NFTFuncs.createPolkaApiFunc
const Unit = NFTConfig.Unit
const TokenName = NFTConfig.TokenName

interface PolkaAccount {
  free: number,
  reserved: number,
  miscFrozen: number,
  feeFrozen: number,
}

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

  try {
    const { data: balances } = await api.query.system.account(address)
    const data = reducedUnit(balances)
    return { tokenName: TokenName, ...data}
  } catch (error) {
    console.log(error)
  }

}

function reducedUnit(account: PolkaAccount) {
  return {
    free: account.free / Unit,
    reserved: account.reserved / Unit,
    miscFrozen: account.miscFrozen / Unit,
    feeFrozen: account.feeFrozen / Unit
  }
}
