import type { User } from '@/_type/User'
import cloud from '@/cloud-sdk'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { Keyring } from '@polkadot/keyring'

const DB = cloud.database()
const Fun: SharedFun = cloud.shared.get('funcs')

interface Body {
    to: string
    amount: number
    formId: number

}

/**
 * 测试 polka 转账
 */
// @ts-ignore
exports.main = async function (ctx: FunctionContext) {
    const {to, formId, amount} = ctx.body as Body

    const user: User = await UserRepository.selectUserById(formId)

    if (!user) {
        return '不存在的用户'
    }

    console.log(user.polka)

    const m = Fun.aesDecrypt(user.polka.mnemonic)
    console.debug('解码后的助记词: ', m)

    const sign = new Keyring({type: 'sr25519'}).createFromUri(m)

    const wsProvider = new WsProvider('wss://westend-rpc.polkadot.io')
    const api = await ApiPromise.create({provider: wsProvider})
    const res = api.tx.balances
        .transfer(to, amount * 1_0000_0000_0000)
        .signAndSend(sign)

    console.log('res: ', res)

    return res
}

// noinspection JSUnusedGlobalSymbols,DuplicatedCode
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
