import type { BlockchainDispatch } from '@/_type/BlockchainDispatch'
import type { BlockchainService } from '@/_type/BlockchainService'
import type { TransactionRequest } from '@/_type/TransactionRequest'
import type { User } from '@/_type/User'
import type { UserAccount } from '@/_type/UserAccount'
import cloud from '@/cloud-sdk'
import * as crypto from 'crypto'
import type { Db } from 'database-ql'

const DB: Db = cloud.database()
const COLLECTION = {
    user: 'user',
    sysConfig: 'sys_config',
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
exports.main = async function (ctx: FunctionContext) {
    const {value: config} = await SysConfigRepository.selectByKey(SysConfigRepository.INIT_CONFIG_KEY)
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
    map.set(Blockchain.ACALA, await cloud.invoke(SHARED_ACALA, {body: {apiKey, apiBaseUrl: acalaUrl, providerWs: acalaWs}}))
    console.log('\t初始化 polka Service...')
    map.set(Blockchain.POLKA, await cloud.invoke(SHARED_POLKA, {body: {apiKey, apiBaseUrl: subscanUrl, providerWs: polkaWs}}))
    console.log('\t初始化 near Service...')
    map.set(Blockchain.NEAR, await cloud.invoke(SHARED_NEAR, {body: config.nearConfig}))

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
        await UserRepository.updateById(uid, {[`own_${ blockchain }_address`]: address})
    }

    public async createAccount(blockchain: Blockchain, uid: number): Promise<UserAccount> {
        const account = await this.getImpl(blockchain).createAccount(uid)
        await UserRepository.updateById(uid, {[blockchain]: account})
        return account
    }

    public async transfer(blockchain: Blockchain, request: TransactionRequest, onError?: (balance: string) => Promise<void>): Promise<{ hash: string }> {
        return await this.getImpl(blockchain).transfer(request, onError)
    }

    public transferRecord(blockchain: Blockchain, address: string, page: Page): Promise<Array<any>> {
        return this.getImpl(blockchain).transferRecord(address, page)
    }

    private getImpl(block: Blockchain): BlockchainService {
        const value = this.impl.get(<Blockchain>block.toLowerCase())
        if (value) {
            return value
        }
        throw new Error('缺少 BlockchainService impl: ' + block)
    }

    public async canWithdrawnAmount(blockchain: Blockchain, uid: number): Promise<string> {
        const user = await UserRepository.selectUserById(uid)
        if (!user) {
            throw new Error('用户不存在')
        }
        let amount = (await this.getImpl(blockchain).accountInfo(user[blockchain])).free
        amount = parseFloat(amount) - parseFloat(String(user[blockchain].frozenAmount ?? 0))

        // near 保留金额
        if (blockchain === Blockchain.NEAR) {
            amount -= 0.00182
        }

        return amount
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
        const res = await this.collection.where({key}).getOne<SysConfig>()
        if (res.ok) {
            return res.data
        }
        throw new Error(res.error)
    }

}

class UserRepository {
    private static collection = DB.collection(COLLECTION.user)

    public static selectUserById(id: number) {
        return this.selectOne({id})
    }

    public static async selectUserByGithubLogin(login: string) {
        return this.selectOne({login})
    }

    public static updateFrozenAmount(id: number, account: Blockchain, amount: number) {
        return this.updateById(id, {[account]: {frozenAmount: amount}})
    }

    public static async updateById(id: number, data: Partial<User>) {
        return await this.update({id}, data)
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
