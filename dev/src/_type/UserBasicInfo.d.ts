
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

    token: string
}
