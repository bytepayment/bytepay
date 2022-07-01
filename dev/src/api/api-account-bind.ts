import type { Blockchain } from '@/_type/Blockchain'
import type { BlockchainDispatch } from '@/_type/BlockchainDispatch'
import cloud from '@/cloud-sdk'

type Body = {
    chain: Blockchain
    address: string
    id: number
}
const SERVICE: BlockchainDispatch = cloud.shared.get('blockchain_service')
/**
 * 首页信息查询
 * - 账号信息
 * - 账号余额
 */
// @ts-ignore
exports.main = async function (ctx: FunctionContext) {
    const uid = ctx.auth?.uid
    if (!uid) {
        return {error: 1, msg: 'Unauthorized',}
    }

    const {chain, address, id} = ctx.body as Body
    try {
        await SERVICE.bindAccount(chain, id, address)
        return {error: 0}
    } catch (e: any) {
        console.log('出错了: ', e)
        return {
            error: 1,
            msg: e?.message,
        }
    }
}
