// @ts-ignore
// noinspection JSNonASCIINames
import cloud from '@/cloud-sdk'

const DB = cloud.database()
const Fun: SharedFun = cloud.shared.get('funcs')
const SERVICE: BlockchainDispatch = cloud.shared.get('blockchain_service')

enum Blockchain {
    ACALA = 'acala',
    POLKA = 'polka',
    // NEAR = 'near'
}

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

interface BlockchainDispatch {

    /**
     * 交易
     */
    transfer: (blockchain: Blockchain, request: TransactionRequest) => Promise<{ hash: string }>

    /**
     * 交易记录
     */
    transferRecord: (blockchain: Blockchain, address: string, page: Page) => Promise<Array<any>>

    /**
     * 创建账号
     */
    createAccount: (blockchain: Blockchain, uid: number) => Promise<UserAccount>

    /**
     * 绑定账号
     */
    bindAccount: (blockchain: Blockchain, uid: number, address: string) => Promise<void>

    /**
     * 查询账号信息
     */
    accountInfo: (uid: number) => Promise<Record<Blockchain, any>>
}

interface SharedFun {
    hash(content: string): string

    aesEncrypt(text: string): string

    aesDecrypt(text: string): string
}

interface User {
    _id: string
    id: number
    login: string
    polka: UserAccount
    acala: UserAccount
    own_polka_address?: string
    own_acala_address?: string
}

interface UserAccount {
    address: string
    mnemonic: string
    // noinspection JSNonASCIINames
    'mnemonic 明文': string
    publicKey: Record<number, number>
    type: string
    frozenAmount?: number
}

/**
 * 一次交易请求
 */
interface TransactionRequest {
    from: UserAccount
    to: string
    /**
     * 此次交易金额
     */
    amount: number
    /**
     * 货币类型 可选
     */
    token?: string
    /**
     * 冻结金额
     */
    frozen: string
}

interface Page {
    /**
     * 从 1 开始
     */
    page: number
    /**
     * 从 1 开始
     */
    size: number
}

enum Token {
    // noinspection SpellCheckingInspection
    ACA_TOKEN = 'ACA',
    LDOT_TOKEN = 'LDOT',
    LCDOT_TOKEN = 'LCDOT',
    DOT_TOKEN = 'DOT',
    RENBTC_TOKEN = 'RENBTC',
    CASH_TOKEN = 'CASH',
    KAR_TOKEN = 'KAR',
    KUSD_TOKEN = 'KUSD',
    KSM_TOKEN = 'KSM',
    LKSM_TOKEN = 'LKSM',
    TAI_TOKEN = 'TAI',
    BNC_TOKEN = 'BNC',
    VSKSM_TOKEN = 'VSKSM',
    PHAC_TOKEN = 'PHA',
    KINT_TOKEN = 'KINT',
    KBTC_TOKEN = 'KBTC'
}
