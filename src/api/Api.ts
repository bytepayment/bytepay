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
    public static async transactionRecord(request: TransactionRequest): Promise<Array<any>> {
        const response = await cloud.invokeFunction<Response<Array<any>>>('api-transaction-record', request)
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

enum Blockchain {
    ACALA = 'acala',
    POLKA = 'polka',
    NEAR = 'near'
}

export interface AccountBindRequest {
    chain: Blockchain
    address: string
    id: number
}

export interface AccountInfoRequest {
    id: number
}

export type AccountInfo = Record<Blockchain, AccountBaseInfo | BalanceInfo>

export type AccountBaseInfo = PolkaAccount | AcalaAccount

export type BalanceInfo = any

interface PolkaAccount {
    free: number,
    reserved: number,
    miscFrozen?: number,
    feeFrozen?: number,
}

interface AcalaAccount {
    free: number,
    reserved: number,
    frozen: number,
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
    // TODO: near 单位定义
    'XXX': Blockchain.NEAR,
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
