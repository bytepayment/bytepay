// @ts-ignore
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
        return {
            error: 1,
            msg: "Unauthorized",
        }
    }
    const { chain, address, id } = ctx.body as Body
    try {
        await SERVICE.bindAccount(chain, id, address)
        return { error: 0 }
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

interface BlockchainDispatch {

    /**
     * 绑定账号
     */
    bindAccount: (blockchain: Blockchain, uid: number, address: string) => Promise<void>

}
