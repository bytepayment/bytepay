// @ts-ignore
import cloud from '@/cloud-sdk'
import BN from 'bn.js'
import { Db } from 'database-ql'
import { Account, AccountBalance } from 'near-api-js/lib/account'
import { ConnectConfig } from 'near-api-js/lib/connect'
import { Near } from 'near-api-js/lib/near'

const NearAPI = require('near-api-js')

type NearConfig = {
    mainAccount: string
    publicKey: string
    privateKey: string
    networkId: string
    nodeUrl: string
    walletUrl: string
    helperUrl: string
    explorerUrl: string
}

const COLLECTION = {
    user: 'user',
}
const DB: Db = cloud.database()

/**
 * 初始化 near 服务
 */
exports.main = async function (ctx: any) {
    const config = ctx.body as NearConfig
    return new NearBlockServiceImpl(config)
}

class NearBlockServiceImpl implements BlockchainService {
    private readonly UNIT = 1_0000_0000_0000_0000_0000_0000
    /**
     * 楼上 {@link UNIT} 的十进制位数 用于金额放大补零
     */
    private readonly UNIT_LENGTH = 24
    private readonly initAmount = '1820000000000000000000' as any as BN
    /**
     * - group 1 完整数字
     * - group 2 整数部分
     * - group 3 可能存在的小数部分, 含小数点
     * - group 4 可能存在的小数部分, 不含小数点
     */
    private readonly TRIM_TRAILING = new RegExp('^((\\d+)(\\.(\\d+?))?)0*?$')
    private readonly prefix_reg_0 = new RegExp('^0*?([1-9]\\d+)$')

    private readonly config: NearConfig

    constructor(config: NearConfig) {
        this.config = config
    }

    public async accountInfo(account: Partial<UserAccount>): Promise<any> {
        const acc = await this.getAccountById(account.address!)

        let balance: AccountBalance = await acc.getAccountBalance()
        const details = await acc.getAccountDetails()

        balance = this.narrow(balance)

        return {
            free: balance.total,
            ...balance,
            ...details,
        }
    }

    private static async selectUserByUid(uid: number) {
        const res = await DB.collection(COLLECTION.user)
            .where({id: uid})
            .getOne()
        if (res.ok) {
            return res.data
        }
        throw new Error(res.error)
    }

    public async createAccount(uid: number): Promise<UserAccount> {
        const {_id} = await NearBlockServiceImpl.selectUserByUid(uid)
        const {mainAccount, publicKey} = this.config
        const ua: UserAccount = {
            address: _id + '.' + mainAccount,
            publicKey: publicKey,
            frozenAmount: 0,
            mnemonic: '',
        }

        const account = await this.getMainAccount()
        const outcome = await account.createAccount(ua.address, ua.publicKey, this.initAmount)
        console.log('创建账号成功', outcome)
        return ua
    }

    public async transfer(request: TransactionRequest, onError: (balance: string) => Promise<void>): Promise<{ hash: string }> {
        const {from, to, amount} = request

        const {free} = await this.accountInfo(from)
        if (parseFloat(free) < amount) {
            await onError(free)
            throw new Error('余额不足')
        }

        const account = await this.getAccountById(from.address)
        let outcome = await account.sendMoney(to, this.amountMagnified(amount) as any as BN)
        const hash = outcome.transaction_outcome.id

        // 保存交易记录
        const record = new TransactionRecord()
        record.fromAddress = from.address
        record.amount = String(amount)
        record.toAddress = to
        // 硬编码
        record.unit = 'NEAR'
        record.chain = 'NEAR'
        record.date = Date.now()
        record.hash = hash
        record.other = {
            completeReceipt: outcome,
            request: request,
        }
        await TransactionRecordRepository.insert(record)

        return {
            hash: hash,
            ...outcome,
        }
    }

    public async transferRecord(address: string, page: Page): Promise<Array<any>> {
        const cmd = DB.command
        const where = cmd.or({fromAddress: address}, {toAddress: address})
        const res = await TransactionRecordRepository.selectPage(page, where as any)
        // TODO: 类型声明和实际返回值不一致, 应该返回对象
        return res as any
    }

    private async getMainAccount(): Promise<Account> {
        return await this.getAccountById(this.config.mainAccount)
    }

    private async getAccountById(accountId: string): Promise<Account> {
        return await (await this.createConnect(accountId)).account(accountId)
    }

    /**
     * 交易金额 放大到实际数字
     */
    private amountMagnified(amount: number) {
        const arr = this.TRIM_TRAILING.exec(String(amount))

        const integer = arr![2]
        let decimal = arr![4] || ''

        decimal = decimal.substring(0, Math.min(this.UNIT_LENGTH, decimal.length))
        const zeroPadding = Math.max(this.UNIT_LENGTH - decimal.length, 0)

        // 整数 + 小数 + (24 - 小数长度)个零
        const amt = integer + decimal + new Array(zeroPadding + 1).join('0')
        return this.prefix_reg_0.exec(amt)![1]
    }

    /**
     * 查询到的余额, 缩小为人类可读数字, 四舍五入 修剪尾随0
     */
    private narrow(balance: AccountBalance): AccountBalance {
        return Object.keys(balance)
            .reduce((pv, key) => {
                const value: string = balance[key]
                const number = parseFloat(value) / this.UNIT
                pv[key] = this.trimSuffix(number.toFixed(6))

                return pv
            }, {} as AccountBalance)
    }

    private trimSuffix(target: string) {
        const arr = this.TRIM_TRAILING.exec(target)
        return arr![1]
    }

    private async createConnect(account: string): Promise<Near> {
        const {privateKey, networkId, nodeUrl, walletUrl, helperUrl, explorerUrl} = this.config
        const keyStore = new NearAPI.keyStores.InMemoryKeyStore()
        // 将您创建的密钥对添加到 keyStore
        await keyStore.setKey(networkId, account, NearAPI.KeyPair.fromString(privateKey))

        return await NearAPI.connect({
            deps: undefined,
            headers: {},
            initialBalance: undefined,
            keyPath: undefined,
            masterAccount: undefined,
            signer: undefined,
            networkId,
            nodeUrl,
            walletUrl,
            helperUrl,
            keyStore,
            // @ts-ignore
            explorerUrl,
        } as ConnectConfig)
    }

}

// noinspection JSUnusedGlobalSymbols
export class TransactionRecord {
    public static readonly TABLE_NAME = 'transaction_record'
    public _id: string
    /**
     * 支付方
     */
    public fromAddress: string
    /**
     * 收款方
     */
    public toAddress: string
    /**
     * 交易金额
     */
    public amount: string
    /**
     * 单位
     */
    public unit: string
    /**
     * 链
     */
    public chain: string
    /**
     * 交易时间戳
     */
    public date: number
    /**
     * 交易结果
     */
    public hash: string
    /**
     * 其他
     */
    public other: {
        completeReceipt: any
    } & any
}

class TransactionRecordRepository {
    private static readonly connection = DB.collection(TransactionRecord.TABLE_NAME)

    public static async insert(record: Partial<TransactionRecord>) {
        const res = await this.connection.add(record)
        if (res.ok) {
            return res.id
        }
        throw new Error(res.error)
    }

    public static async selectPage(page: Page, where: Partial<Record<keyof TransactionRecord, any>>) {
        const count = await this.count(where)

        if (count <= 0) {
            return {total: 0, list: []}
        }

        const res = await this.connection.where(where)
            .orderBy('date' as keyof TransactionRecord, 'desc')
            .field({other: 0})
            .get<TransactionRecord>()

        if (res.ok) {
            return {total: count, list: res.data}
        }
        throw new Error(res.error)
    }

    public static async count(where: Partial<Record<keyof TransactionRecord, any>>) {
        let res = await this.connection.where(where).count()
        if (res.ok) {
            return res.total
        }
        throw new Error(res.error)
    }
}

/* 复制的类型信息 =================================================================================================================== */

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
    accountInfo: (account: Partial<UserAccount>, token?: any) => Promise<any>
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
    publicKey: any,
    /**
     * 交易冻结金额, 默认 0
     */
    frozenAmount: number
}
