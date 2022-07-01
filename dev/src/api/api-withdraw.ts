import type { BlockchainDispatch } from '@/_type/BlockchainDispatch'
import type { TransactionRequest } from '@/_type/TransactionRequest'
import type { UserAccount } from '@/_type/UserAccount'
import cloud from '@/cloud-sdk'
import * as crypto from 'crypto'
import { Db } from 'database-ql'

/**
 * <h2 color="red">
 *     这里的定义仅提供基础示例, 如果后期扩展 以 init_system 中为准
 * </h2>
 * value 和 用户信息中的账户名对应
 */
enum Blockchain {
    ACALA = 'acala',
    POLKA = 'polka',
    NEAR = 'near'
}

const SERVICE: BlockchainDispatch = cloud.shared.get('blockchain_service')
/**
 * <h2 color="red">
 *     TODO: 不提供动态扩展 需要后期补充
 * </h2>
 */
const CurrencyMapping = {
    'DOT': Blockchain.POLKA,
    'AUSD': Blockchain.ACALA,
    'NEAR': Blockchain.NEAR,
}
const privateKey = 'OaXrkPelv%Artij0ZL7P^^qyHjBKc&wsfyD3V3AXnq@3Gj3zQ$9g7OXvm8==hnh'
const DB: Db = cloud.database()
const COLLECTION = {
    user: 'user',
}
type Body = {
    id: number,
    address: string,
    password: string,
    amount: number,
    cm: keyof typeof CurrencyMapping
}

/**
 * 首页信息查询
 * - 账号信息
 * - 账号余额
 */
// @ts-ignore
exports.main = async function (ctx: FunctionContext) {
    const {id, address, password, amount, cm} = ctx.body as Body

    const user = await selectUserById(id)
    if (!user) {
        return Response.error('User Not Found!')
    }
    if (hash(password) !== user.password) {
        return Response.error('Password Incorrect!')
    }
    if (!cm) {
        return Response.error('WRONG_REQUEST_PARAMETER')
    }

    try {
        const currency = CurrencyMapping[cm.toUpperCase()]
        if (!currency) {
            // noinspection ExceptionCaughtLocallyJS
            throw new Error('不支持的 类型' + cm)
        }

        const account: UserAccount = user[currency]

        const t: TransactionRequest = {
            amount,
            from: account,
            to: address,
            token: cm,
            frozen: String(account.frozenAmount || 0),
        }

        const maxAmount = await SERVICE.canWithdrawnAmount(currency, id)
        console.log('最大可提现金额: ', maxAmount, '期待转账金额: ', amount)
        // 魔法值: 0.04 -> 转账手续费预留
        t.amount = Math.min(parseFloat(maxAmount) - 0.04, parseFloat(String(amount)))


        return Response.ok(await SERVICE.transfer(currency, t))
    } catch (error) {
        console.log('Error: ', error)
        return Response.error('Internal Server Error', 5)
    }
}

function hash(content: string) {
    return crypto.createHash('sha256').update(privateKey + content).digest('hex')
}

async function selectUserById(id: number) {
    const res = await DB.collection(COLLECTION.user)
        .where({id})
        .getOne()
    if (res.ok) {
        return res.data
    }
    throw new Error(res.error)
}

class Response {
    private error: number
    private data?: any
    private msg?: string

    constructor(error: number, data?: any, msg?: string) {
        this.error = error
        this.data = data
        this.msg = msg
    }

    static ok(data: any) {
        return new Response(0, data)
    }

    static error(msg: string, error: number = 1) {
        return new Response(error, null, msg)
    }
}
