// @ts-ignore
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

    const { chain, address, page } = ctx.body as Body
    const uid = ctx.auth?.uid
    if (!uid) {
           return {
            error: 1,
            msg: "Unauthorized",
        }
    }

    try {
        let data = await SERVICE.transferRecord(chain, address, page)
        return { error: 0, data }
    } catch (e: any) {
        console.log('出错了: ', e)
        return {
            error: 1,
            msg: e?.message,
        }
    }
}

// 复制的类型信息 ========================================================================================================================
/**
 * <h2 color="red">
 *     这里的定义仅提供基础示例, 如果后期扩展 以 init_system 中为准
 * </h2>
 * value 和 用户信息中的账户名对应
 */
enum Blockchain {
    ACALA = 'acala',
    POLKA = 'polka',
    NEAR = 'near'
}

type BlockchainDispatch = any
