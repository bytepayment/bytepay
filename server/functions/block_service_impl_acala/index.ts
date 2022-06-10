// @ts-ignore
import cloud from '@/cloud-sdk'
import { options } from '@acala-network/api'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { Keyring } from '@polkadot/keyring'
import { KeyringPair$Meta } from '@polkadot/keyring/types'
import { mnemonicGenerate } from '@polkadot/util-crypto'
import { KeypairType } from '@polkadot/util-crypto/types'
import axios from 'axios'

type Body = { apiKey: string, apiBaseUrl: string, providerWs: string }

const Fun: SharedFun = cloud.shared.get('funcs')

/**
 * 初始化 acala 服务
 * @param {{body: Body }} ctx
 */
// @ts-ignore
exports.main = async function (ctx: FunctionContext) {
    const { apiKey, apiBaseUrl, providerWs } = ctx.body as Body
    return new AcalaBlockServiceImpl(Fun.aesDecrypt, Fun.aesEncrypt, apiKey, apiBaseUrl, providerWs)
}

class AcalaBlockServiceImpl implements BlockchainService {
    /**
     * 解码
     */
    decrypt: (s: string) => string
    /**
     * 加密
     */
    encrypt: (s: string) => string

    private readonly apiKey: string
    private readonly apiBaseUrl: string
    private readonly providerWs: string

    constructor(decrypt: (s: string) => string, encrypt: (s: string) => string, apiKey: string, apiBaseUrl: string, providerWs: string) {
        this.decrypt = decrypt
        this.encrypt = encrypt
        this.apiKey = apiKey
        this.apiBaseUrl = apiBaseUrl
        this.providerWs = providerWs
    }

    public async accountInfo(account: Partial<UserAccount>, token?: Token): Promise<any> {
        if (!token) {
            const acala = await (await this.api()).query.system.account(account.address)
            // @ts-ignore
            return this.amountReduce(acala.data)
        } else {
            // TODO: 动态单位
            return await (await this.api()).query.tokens.accounts(account.address, {Token: token})
        }
    }

    // noinspection JSUnusedLocalSymbols
    public async createAccount(uid: number): Promise<UserAccount> {
        console.log('acla for uid', uid)
        const keyring = new Keyring({type: 'sr25519', ss58Format: 0})
        const mnemonic = mnemonicGenerate()
        console.log('acla for mnemonic', mnemonic)
        const mnemonic_encrypted = this.encrypt(mnemonic)
        const pair = keyring.createFromUri(mnemonic)
        return {
            mnemonic: mnemonic_encrypted,
            address: pair.address,
            type: pair.type,
            meta: pair.meta,
            publicKey: pair.publicKey,
            frozenAmount: 0,
        }
    }

    public async transfer(request: TransactionRequest, onError: (balance: string) => Promise<void>): Promise<{ hash: string }> {
        const {to, from, amount, token = Token.ACA_TOKEN} = request

        const info = await this.accountInfo(from)
        if (parseFloat(info.free) < parseFloat(amount as any)) {
            await onError(info.free)
            throw new Error(`INSUFFICIENT BALANCE: free: ${info.free} amount: ${amount}`)
        }

        // 解码
        const mnemonic = this.decrypt(from.mnemonic!)
        // 金额转化
        const magnifyAmount = this.amountZoom(token as any, amount)
        // transfer
        const hash = await (await this.api()).tx.currencies
            .transfer(to, {Token: token}, String(magnifyAmount))
            .signAndSend(this.getPair(mnemonic))

        return {
            hash: hash.toHex(),
        }
    }

    public async transferRecord(address: string, page: Page): Promise<Array<any>> {
        const {page: ps = 0, size: row = 10} = page
        const {apiKey, apiBaseUrl} = this

        const r = await axios({
            url: `${ apiBaseUrl }/api/scan/transfers`,
            method: 'POST',
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json',
            },
            data: {
                address,
                page: Math.max(ps - 1, 0),
                row,
            },
        })

        return r.data?.data
    }

    /**
     * 创建 Acala 实例
     */
    private async api(): Promise<ApiPromise> {
        const key = this.providerWs
        let api: ApiPromise = cloud.shared.get(key)
        if (api) {
            console.log('use already connected Acala Api: ', api.isConnected)
            return api
        }
        console.log('Create new connection acala api')
        const wsProvider = new WsProvider(key)
        // @ts-ignore
        api = await ApiPromise.create(options({provider: wsProvider}))
        cloud.shared.set(key, api)
        return api
    }

    /**
     * 金额缩放 放大
     */
    private amountZoom(token: Token, amount: number): number {
        const unit_12 = 1_0000_0000_0000
        const unit_10 = 100_0000_0000
        switch (token) {
            case Token.ACA_TOKEN:
                return amount * unit_12
            case Token.LDOT_TOKEN:
            case Token.LCDOT_TOKEN:
            case Token.DOT_TOKEN:
                return amount * unit_10
            default:
                throw new Error('不支持的 token')
        }
    }

    /**
     * 金额缩放 缩小
     */
    private amountReduce(account: any) {
        const unit = 1_0000_0000_0000
        return {
            free: account.free / unit,
            reserved: account.reserved / unit,
            miscFrozen: account.miscFrozen / unit,
            feeFrozen: account.feeFrozen / unit,
        }
    }

    /**
     * @param {string} mnemonic 解码后的注记词
     */
    private getPair(mnemonic: string) {
        return new Keyring({type: 'sr25519'}).createFromUri(mnemonic)
    }

}

/* 复制的类型信息 =================================================================================================================== */

/**
 * 币种
 */
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

interface SharedFun {
    hash(content: string): string

    aesEncrypt(text: string): string

    aesDecrypt(text: string): string
}

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
     * 操作数据库
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
