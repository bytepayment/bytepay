import type { Blockchain } from '@/_type/Blockchain'
import type { BlockchainDispatch } from '@/_type/BlockchainDispatch'
import type { User } from '@/_type/User'
import type { UserAccount } from '@/_type/UserAccount'
import cloud from '@/cloud-sdk'
import { Db } from 'database-ql'

const DB: Db = cloud.database()
const COLLECTION = {
    user: 'user',
}
const SERVICE: BlockchainDispatch = cloud.shared.get('blockchain_service')
type Body = { id: number }
/**
 * 首页信息查询
 * - 账号信息
 * - 账号余额
 */
// @ts-ignore
exports.main = async function (ctx: FunctionContext) {
    const {id} = ctx.body as Body

    const user = await UserRepository.selectUserById(id)
    if (!user) {
        return {error: 1, msg: '用户不存在'}
    }

    const chain: Record<string, Blockchain> = cloud.shared.get('Blockchain')

    try { // 查询账号信息
        const account: Partial<Record<Blockchain, UserAccount>> = {}
        for (const key of Object.values(chain)) {
            let zh = user[key]
            if (!zh || Object.keys(zh).length <= 0) {
                try {
                    zh = await SERVICE.createAccount(key, id)
                } catch (e) {
                    console.log('创建账号失败: ', key, e)
                }
            }
            // 隐藏注记词
            // @ts-ignore
            delete zh?.mnemonic
            account[key] = zh
        }

        // 查询余额信息
        const balance: Partial<Record<Blockchain, any>> = await SERVICE.accountInfo(id)

        return {error: 0, data: {account, balance}}
    } catch (e: any) {
        console.log('出错了: ', e)
        return {
            error: 1,
            msg: e?.message,
        }
    }
}

class UserRepository {
    private static collection = DB.collection(COLLECTION.user)

    public static selectUserById(id: number) {
        return this.selectOne({id})
    }

    private static async selectOne(where: Partial<User>): Promise<User> {
        const res = await this.collection
            .where(where)
            .getOne<User>()
        if (res.ok) {
            return res.data
        }
        throw new Error(res.error)
    }
}
