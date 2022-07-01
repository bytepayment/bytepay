import type { Blockchain } from '@/_type/Blockchain'
import type { TransactionRequest } from '@/_type/TransactionRequest'
import type { UserAccount } from '@/_type/UserAccount'

interface BlockchainDispatch {

    /**
     * 交易
     */
    transfer: (blockchain: Blockchain, request: TransactionRequest, onError?: (balance: string) => Promise<void>) => Promise<{ hash: string }>

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

    /**
     * 查询可提现金额
     */
    canWithdrawnAmount: (blockchain: Blockchain, uid: number) => Promise<string>
}
