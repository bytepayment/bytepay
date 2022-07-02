import { User } from '@/_type/User'
import { UserAccount } from '@/_type/UserAccount'
import cloud from '@/cloud-sdk'
import { BlockchainDispatch } from '@/_type/BlockchainDispatch'

const DB = cloud.database()
const Fun: SharedFun = cloud.shared.get('funcs')
const SERVICE: BlockchainDispatch = cloud.shared.get('blockchain_service')

/**
 * 测试: 快捷查询用户信息, 含解码后的助记词, 余额 等
 */
// @ts-ignore
exports.main = async function (ctx: FunctionContext) {
    const query = ctx.body as Body
    const userAllInfo: User = await UserRepository.selectOne(query)

    const user = Tool.formatUser(userAllInfo)
    const 余额 = await Tool.getFree(user?.id!)

    return {
        用户信息: user,
        余额,
    }
}

class Tool {
    static formatUser(user: User) {
        if (!user) {
            return null
        }
        const {_id, id, login, polka, acala, own_acala_address, own_polka_address} = user
        Tool.formatUserAccount(polka)
        Tool.formatUserAccount(acala)

        return {_id, id, login, polka, acala, own_acala_address, own_polka_address}
    }

    static formatUserAccount(account: UserAccount) {
        if (account) {
            account.publicKey = JSON.stringify(account.publicKey) as any
            account['mnemonic 明文'] = Fun.aesDecrypt(account.mnemonic)
        }
    }

    static async getFree(id: number) {
        return await SERVICE.accountInfo(id)
    }

}

// noinspection JSUnusedGlobalSymbols
class UserRepository {
    private static collection = DB.collection('user')

    public static selectUserById(id: number) {
        return this.selectOne({id})
    }

    public static async selectUserByGithubLogin(login: string) {
        return this.selectOne({login})
    }

    public static updateFrozenAmount(id: number, account: string, amount: number) {
        return this.updateById(id, {[account]: {frozenAmount: amount}})
    }

    public static async updateById(id: number, data: Record<string, any>) {
        return await this.update({id}, data)
    }

    private static async update(where: any, data: any) {
        const res = await this.collection.where(where).update(data)
        if (res.ok) {
            return res.updated
        }
        throw new Error(res.error)
    }

    public static async selectOne(where: any) {
        const res = await this.collection
            .where(where)
            .getOne()
        if (res.ok) {
            return res.data
        }
        throw new Error(res.error)
    }
}

type Body = Partial<User>
