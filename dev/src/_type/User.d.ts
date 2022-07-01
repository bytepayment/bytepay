import type { UserAccountInfo } from '@/_type/UserAccountInfo'

type User = UserBasicInfo & UserAccountInfo

/**
 * 用户基础信息
 */
interface UserBasicInfo {
    _id: string
    /**
     * Github UID
     */
    id: number
    /**
     * Github 用户名
     */
    login: string

    isSetPass?: boolean
    password: string
}
