import type { UserAccount } from '@/_type/UserAccount'

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
