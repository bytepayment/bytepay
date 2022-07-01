import type { BlockchainDispatch } from '@/_type/BlockchainDispatch'
import cloud from '@/cloud-sdk'

const SERVICE: BlockchainDispatch = cloud.shared.get('blockchain_service')

interface Body {
    chain: Blockchain
    id: number
}

/**
 * api-withdrawn-amount
 * @author 冰凝
 * @date 2022-06-24 下午 05:07
 **/
// @ts-ignore
exports.main = async function (ctx: FunctionContext) {
    const uid = ctx.auth?.uid
    if (!uid) {
        return Response.error('Unauthorized')
    }

    const {chain, id} = ctx.body as Body
    try {
        return Response.ok(await SERVICE.canWithdrawnAmount(chain, id))
    } catch (e: any) {
        console.log('出错了: ', e)
        return Response.error(e?.message)
    }
}

enum Blockchain {
    ACALA = 'acala',
    POLKA = 'polka',
    NEAR = 'near'
}
class Response<T = any> {
    private error: number
    private data?: T
    private msg?: string

    constructor(error: number, data?: any, msg?: string) {
        this.error = error
        this.data = data
        this.msg = msg
    }

    static ok<T>(data: T) {
        return new Response<T>(0, data)
    }

    static error(msg: string, error: number = 1) {
        return new Response(error, null, msg)
    }
}
