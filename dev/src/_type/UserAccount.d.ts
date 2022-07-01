import type { KeyringPair$Meta } from '@polkadot/keyring/types'
import type { KeypairType } from '@polkadot/util-crypto/types'

/**
 * 用户账户
 */
export interface UserAccount {
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
