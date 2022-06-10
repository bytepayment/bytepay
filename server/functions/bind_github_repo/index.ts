// @ts-ignore
import cloud from '@/cloud-sdk'
import axios from 'axios'
import { Db } from 'database-ql'

const DB: Db = cloud.database()
const Config = cloud.shared.get('config')
const BindRepoWebhooksUrl = Config.BindRepoWebhooksUrl

const TABLE_NAME_REPOS = 'repos'

type Body = {
    token: string
    owner_name: string
    repo_name: string
    owner_id: string
    repo_id: string
    meta: any
}

/**
 * 绑定一个 repo，意味着添加一个 webhook
 * @param ctx
 */
// @ts-ignore
exports.main = async function (ctx: FunctionContext) {
    const uid = ctx.auth?.uid
    if (!uid) {
        return {error: 1, msg: 'Unauthorized'}
    }

    const {token, owner_name, repo_name, owner_id, repo_id, meta} = ctx.body as Body
    try {
        if (await existed(owner_id, repo_id)) {
            return {error: 1, error_msg: 'The repo has binded already.'}
        }

        const data = await setWebHook(owner_name, repo_name, token)
        const {id: hook_id, webhookSecret} = data
        await DB.collection(TABLE_NAME_REPOS).add({owner_id, repo_id, owner_name, repo_name, meta, hook_id, webhookSecret})
        delete data.webhookSecret
        
        return {error: 0, data}
    } catch (error: any) {
        if (error instanceof Error) {
            return {error: 1, error_msg: error.message}
        }

        let error_msg_r = error?.response?.data?.errors || ''
        if (error_msg_r && Array.isArray(error_msg_r)) {
            return {error: 3, error_msg: error_msg_r.map(i => i.message).join(';')}
        }

        return {error: 3, error_msg: 'request github caught error...'}
    }
}

/**
 * Github API: 指定仓库设置 webhook
 * @param {string} ownerName
 * @param {string} repoName
 * @param {string} token
 * @return {Promise<void>}
 * @see https://docs.github.com/en/rest/webhooks/repos#create-a-repository-webhook
 */
async function setWebHook(ownerName: string, repoName: string, token: string) {
    const headers = {'Accept': 'application/vnd.github.v3+json', 'Authorization': `Bearer ${ token }`}
    // 构造添加 Webhook 主体
    const secret = RandomUtil.randomString(RandomUtil.ALL, 128)
    const data = {
        config: {
            url: BindRepoWebhooksUrl,
            content_type: 'json',
            secret,
            insecure_ssl: 0,
        },
        events: ['issues', 'issue_comment'],
    }
    // 请求 Github 添加
    const res = await axios({
        url: `https://api.github.com/repos/${ ownerName }/${ repoName }/hooks`,
        method: 'POST',
        headers,
        data,
    })
    if (res.status != 201) {
        throw new Error(res.data)
    }
    return {
        ...res.data,
        webhookSecret: secret,
    }
}

/**
 * 检查之前是否绑定
 * @param {string} ownerId
 * @param {string} repoId
 * @return {Promise<boolean>} 存在?
 */
async function existed(ownerId: string, repoId: string): Promise<boolean> {
    const res = await DB.collection(TABLE_NAME_REPOS)
        .where({owner_id: ownerId, repo_id: repoId})
        .count()
    if (!res.ok) {
        throw new Error(res.error)
    }
    return res.total > 0
}

/**
 * RandomUtil
 * @author LL
 * @date 2022-01-10 下午 9:54
 **/
export class RandomUtil {
    /**
     * 纯数字
     */
    public static NUMBER = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    /**
     * 小写字母
     */
    public static LOWER_CASE_LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
    /**
     * 大写字母
     */
    public static UPPERCASE_LETTER = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

    public static ALL = [...RandomUtil.NUMBER, ...RandomUtil.LOWER_CASE_LETTERS, ...RandomUtil.UPPERCASE_LETTER]

    /**
     * 使用指定字符池 pond, 生成 指定长度 length 的字符串
     * @param pond {number [] | string []}
     * @param length {number} 长度 最终字符串长度
     * @return string
     */
    public static randomString(pond: Array<string | number>, length: number): string {
        let res = new Array(length)
        const pondLength = pond.length
        for (let i = 1; i <= length; i++) {
            let randomIndex = this.randomNumber(0, pondLength)
            res.push(pond[randomIndex])
        }
        return res.join('')
    }

    /**
     * 获得一个随机整数 介于: [min, max)
     * @param min {number}
     * @param max {number}
     * @return {number}
     */
    public static randomNumber(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min)) + min
    }
}
