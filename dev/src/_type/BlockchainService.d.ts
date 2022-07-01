import type { Token } from '@/_type/Token'
import type { TransactionRequest } from '@/_type/TransactionRequest'
import type { UserAccount } from '@/_type/UserAccount'

/**
 * 区块链操作
 */

interface BlockchainService {
    /**
     * 交易
     * 不操作数据库
     */
    transfer: (request: TransactionRequest, onError?: (balance: string) => Promise<void>) => Promise<{ hash: string }>

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
