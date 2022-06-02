import { cloud } from '@/api/cloud'
import { getUser } from '@/utils/auth'

// noinspection JSUnusedGlobalSymbols
/**
 * ~
 */
export class Api {

    /**
     * 账号绑定
     */
    public static async accountBind(request: Omit<AccountBindRequest, 'id'>): Promise<void> {
        const response = await cloud.invokeFunction<Response<void>>('api-account-bind', this.setUserId(request))
        return Response.checkData(response)
    }

    /**
     * 账号信息
     */
    public static async accountInfo(request?: Omit<AccountInfoRequest, 'id'>): Promise<AccountInfo> {
        const response = await cloud.invokeFunction<Response<AccountInfo>>('api-account-info', this.setUserId(request))
        return Response.checkData(response)
    }

    /**
     * 交易记录
     */
    public static async transactionRecord(request: TransactionRequest): Promise<TransactionRecordResponse> {
        const response = await cloud.invokeFunction<Response<TransactionRecordResponse>>('api-transaction-record', request)
        return Response.checkData(response)
    }

    /**
     * 提现
     */
    public static async withdraw(request: Omit<WithdrawRequest, 'id'>): Promise<{ hash: string }> {
        const response = await cloud.invokeFunction<Response<{ hash: string }>>('api-withdraw', this.setUserId(request))
        return Response.checkData(response)
    }

    private static setUserId<T>(t: T): T & { id: number } {
        if (!t) {
            return {id: this.getUserId()} as any
        }
        return {
            ...t,
            id: this.getUserId(),
        }
    }

    private static getUserId(): number {
        return getUser().id
    }

}


export enum Blockchain {
    ACALA = 'acala',
    POLKA = 'polka',
    NEAR = "near"
}

export interface AccountBindRequest {
    chain: Blockchain
    address: string
    id: number
}

export interface AccountInfoRequest {
    id: number
}

export type AccountInfo = {
    account: Record<Blockchain, { address: string, type: string, publicKey: object }>
    balance: Record<Blockchain, PolkaAccount>
}

export interface TransactionRecordResponse {
    count: number
    transfers: Array<TransactionRecordItem>,
    list: any
}

export interface TransactionRecordItem {
    amount: string
    amount_v2: string
    asset_symbol: string
    asset_type: string
    block_num: number
    block_timestamp: number
    event_idx: number
    extrinsic_index: string
    fee: string
    from: string
    from_account_display: RecordAccountDisplay,
    hash: string
    module: string
    nonce: number
    success: boolean
    to: string
    to_account_display: RecordAccountDisplay,
}

export interface RecordAccountDisplay {
    account_index: string
    address: string
    display: string
    identity: boolean
    judgements: null
    parent: null
}

interface PolkaAccount {
    free: number,
    reserved: number,
    miscFrozen?: number,
    feeFrozen?: number,
}

export interface TransactionRequest {
    chain: Blockchain
    address: string
    page: Page
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

export interface WithdrawRequest {
    id: number,
    address: string,
    password: string,
    amount: number,
    cm: keyof typeof CurrencyMapping
}

const CurrencyMapping: Record<string, Blockchain> = {
    'DOT': Blockchain.POLKA,
    'AUSD': Blockchain.ACALA,
    'TODO':Blockchain.NEAR
    // TODO: near 单位定义
    // 'XXX': Blockchain.NEAR,
}

export class Response<D> {
    public error: number
    public msg: string
    public data: D

    constructor(error: number, msg: string, data: D) {
        this.error = error
        this.msg = msg
        this.data = data
    }

    public static checkData<D>(res: Response<D>): D {
        if (res?.error === 0) {
            return res.data
        }
        throw new Error(res?.msg || 'ERROR')
    }
}
