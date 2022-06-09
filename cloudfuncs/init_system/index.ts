// @ts-ignore
import cloud from '@/cloud-sdk'
import { KeyringPair$Meta } from '@polkadot/keyring/types'
import { KeypairType } from '@polkadot/util-crypto/types'
import * as crypto from 'crypto'
import { Db } from 'database-ql'

const DB: Db = cloud.database()
const COLLECTION = {
    user: 'user',
    sysConfig: 'sys_config'
}

/**
 * value 和 用户信息中的账户名对应
 */
enum Blockchain {
    ACALA = 'acala',
    POLKA = 'polka',
    NEAR = 'near'
}

// @ts-ignore
// noinspection JSUnusedLocalSymbols
exports.main = async function (ctx: FunctionContext) {
    const { value: config } = await SysConfigRepository.selectByKey(SysConfigRepository.INIT_CONFIG_KEY)
    console.log('读取基础配置信息: ', JSON.stringify(config, null, 4))

    cloud.shared.set('config', config)
    console.log('初始化基础配置完成')

    cloud.shared.set('funcs', new SharedFunction(config.CryptoPayLabPrivateKey, config.CryptKey, config.CryptIV))
    console.log('初始化基础共享函数, 完成')

    // 扩展
    cloud.shared.set('Blockchain', Blockchain)
    console.log('初始化 Blockchain 类型, 完成')

    console.log('开始初始化 BlockchainService...')
    const {
        SubscanApiKey: apiKey,
        AcalaSubscanApiBaseUrl: acalaUrl,
        SubscanApiBaseUrl: subscanUrl,
        AcalaProviderWs: acalaWs,
        PolkaProviderWs: polkaWs,
    } = config

    // 初始化 云函数名
    const SHARED_ACALA = 'block_service_impl_acala'
    const SHARED_POLKA = 'block_service_impl_polka'
    const SHARED_NEAR = 'block_service_impl_near'

    // 初始化 BlockchainService 实现
    const map = new Map<Blockchain, BlockchainService>()
    console.log('\t初始化 acala Service...')
    map.set(Blockchain.ACALA, await cloud.invoke(SHARED_ACALA, { body: { apiKey, apiBaseUrl: acalaUrl, providerWs: acalaWs } }))
    console.log('\t初始化 polka Service...')
    map.set(Blockchain.POLKA, await cloud.invoke(SHARED_POLKA, { body: { apiKey, apiBaseUrl: subscanUrl, providerWs: polkaWs } }))
    console.log('\t初始化 near Service...')
    map.set(Blockchain.NEAR, await cloud.invoke(SHARED_NEAR, { body: config.nearConfig }))

    cloud.shared.set('blockchain_service', new BlockchainDispatchService(map))
    console.log('初始化 完成')

    return 'ok ' + map.size
}

class BlockchainDispatchService implements BlockchainDispatch {
    private impl: Map<Blockchain, BlockchainService>

    constructor(impl: Map<Blockchain, BlockchainService>) {
        this.impl = impl
    }

    public async accountInfo(uid: number): Promise<Record<Blockchain, any>> {
        const user = await UserRepository.selectUserById(uid)

        const res: Record<Blockchain, any> = {} as any
        for (let key of Object.values(Blockchain)) {
            if (!user || !(user[key]) || !(user[key].address)) {
                throw new Error('账号信息为空 ' + key + user[key])
            }
            res[key] = await this.getImpl(key).accountInfo(user[key])
        }

        return res
    }

    public async bindAccount(blockchain: Blockchain, uid: number, address: string): Promise<void> {
        const oldUser = await UserRepository.selectUserById(uid)
        if (!oldUser) {
            return
        }
        await UserRepository.updateById(uid, { [`own_${blockchain}_address`]: address })
    }

    public async createAccount(blockchain: Blockchain, uid: number): Promise<UserAccount> {
        const account = await this.getImpl(blockchain).createAccount(uid)
        await UserRepository.updateById(uid, { [blockchain]: account })
        return account
    }

    public transfer(blockchain: Blockchain, request: TransactionRequest, onError: (balance: string) => Promise<void>): Promise<{ hash: string }> {
        return this.getImpl(blockchain).transfer(request, onError)
    }

    public transferRecord(blockchain: Blockchain, address: string, page: Page): Promise<Array<any>> {
        return this.getImpl(blockchain).transferRecord(address, page)
    }

    private getImpl(block: Blockchain): BlockchainService {
        const value = this.impl.get(block)
        if (value) {
            return value
        }
        throw new Error('缺少 BlockchainService impl' + block)
    }

}

class SharedFunction implements SharedFun {

    private readonly CryptoPayLabPrivateKey: string
    private readonly CryptKey: string
    private readonly CryptIV: string

    constructor(CryptoPayLabPrivateKey: string, CryptKey: string, CryptIV: string) {
        this.CryptoPayLabPrivateKey = CryptoPayLabPrivateKey
        this.CryptKey = CryptKey
        this.CryptIV = CryptIV
    }

    public hash = (content: string) => {
        return crypto.createHash('sha256').update(this.CryptoPayLabPrivateKey + content).digest('hex')
    }

    public aesEncrypt = (text: string) => {
        const cipher = crypto.createCipheriv('aes128', this.CryptKey, this.CryptIV)
        let encrypt = cipher.update(text, 'utf8', 'hex')
        encrypt += cipher.final('hex')
        return encrypt
    }

    public aesDecrypt = (text: string) => {
        const cipher = crypto.createDecipheriv('aes128', this.CryptKey, this.CryptIV)
        let decrypted = cipher.update(text, 'hex', 'utf8')
        decrypted += cipher.final('utf8')
        return decrypted
    }
}


class SysConfigRepository {
    private static collection = DB.collection(COLLECTION.sysConfig)

    public static readonly INIT_CONFIG_KEY = 'init_config_key'

    public static async selectByKey(key: string): Promise<SysConfig> {
        const res = await this.collection.where({ key }).getOne<SysConfig>()
        if (res.ok) {
            return res.data
        }
        throw new Error(res.error)
    }

}

class UserRepository {
    private static collection = DB.collection(COLLECTION.user)

    public static selectUserById(id: number) {
        return this.selectOne({ id })
    }

    public static async selectUserByGithubLogin(login: string) {
        return this.selectOne({ login })
    }

    public static updateFrozenAmount(id: number, account: Blockchain, amount: number) {
        return this.updateById(id, { [account]: { frozenAmount: amount } })
    }

    public static async updateById(id: number, data: Partial<User>) {
        return await this.update({ id }, data)
    }

    private static async update(where: Partial<User>, data: Partial<User>) {
        const res = await this.collection.where(where).update(data)
        if (res.ok) {
            return res.updated
        }
        throw new Error(res.error)
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

/* ==================================================================================================================================== */


class SysConfig<T = Record<string, any>> {
    public key: string
    public value: T
}

interface BlockchainDispatch {

    /**
     * 交易
     */
    transfer: (blockchain: Blockchain, request: TransactionRequest, onError: (balance: string) => Promise<void>) => Promise<{ hash: string }>

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

/* 复制的类型: ==================================================================================================================================== */

/**
 * 区块链操作
 */
interface BlockchainService {
    /**
     * 交易
     * 不操作数据库
     */
    transfer: (request: TransactionRequest, onError: (balance: string) => Promise<void>) => Promise<{ hash: string }>

    /**
     * 交易记录
     * 不操作数据库
     */
    transferRecord: (address: string, page: Page) => Promise<Array<any>>

    /**
     * 创建账号
     */
    createAccount: (uid: number) => Promise<UserAccount>

    /**
     * 查询账号信息
     */
    accountInfo: (account: Partial<UserAccount>, token?: Token) => Promise<any>
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

type User = UserBasicInfo & UserAccountInfo

/**
 * 用户基础信息
 */
interface UserBasicInfo {
    _id: string
    /**
     * Github UID
     */
    id: number
    /**
     * Github 用户名
     */
    login: string
}

/**
 * 用户账户信息
 */
interface UserAccountInfo {
    /**
     * 生成地址
     */
    acala: UserAccount
    polka: UserAccount
    near: UserAccount
    /**
     * 绑定地址
     */
    own_polka_address: string
    own_acala_address: string
    own_near_address: string
}

/**
 * 用户账户
 */
interface UserAccount {
    /**
     * 注记词
     */
    mnemonic: string,
    /**
     * 账号地址
     */
    address: string,
    type: KeypairType,
    meta: KeyringPair$Meta,
    publicKey: Uint8Array,
    /**
     * 交易冻结金额, 默认 0
     */
    frozenAmount: number
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
