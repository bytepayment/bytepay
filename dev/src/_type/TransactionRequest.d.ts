import type { UserAccount } from '@/_type/UserAccount'

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
