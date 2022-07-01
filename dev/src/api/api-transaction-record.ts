import type { Blockchain } from '@/_type/Blockchain'
import type { BlockchainDispatch } from '@/_type/BlockchainDispatch'
import cloud from '@/cloud-sdk'

const SERVICE: BlockchainDispatch = cloud.shared.get('blockchain_service')
type Body = {
    chain: Blockchain
    address: string
    page: {
        page: number
        size: number
    }
}
/**
 * 首页信息查询
 * - 账号信息
 * - 账号余额
 */
// @ts-ignore
exports.main = async function (ctx: FunctionContext) {
    const {chain, address, page} = ctx.body as Body
    try {
        let data = await SERVICE.transferRecord(chain, address, page)
        return {error: 0, data}
    } catch (e: any) {
        console.log('出错了: ', e)
        return {
            error: 1,
            msg: e?.message,
        }
    }
}
