import type { User } from '@/_type/User'
import cloud from '@/cloud-sdk'


const Funcs: SharedFun = cloud.shared.get('funcs')
const hash = Funcs.hash
const DB = cloud.database()

// @ts-ignore
exports.main = async function (ctx: FunctionContext): Promise<{error: number, error_msg: string}> {
    const uid = ctx.auth?.uid
    if (!uid) {
        return {error: 1, error_msg: 'Unauthorized'}
    }
    const {id, password_form} = ctx.body as Body

    try {
        await doTask(id, password_form)
    } catch (e: any) {
        return {error: 1, error_msg: e?.message}
    }

    return {error: 0, error_msg: 'success'}
}

async function doTask(id: number, password_form: Body['password_form']) {
    const collection = DB.collection('user')

    const {data: user} = await collection.where({id}).getOne<User>()
    if (!user) {
        throw new Error('user not found')
    }

    const {new_pass, new_pass_again, old_pass} = password_form

    // 更新密码, 检查参数
    if (user.isSetPass) {
        if (new_pass || new_pass_again || old_pass) {
            throw new Error('user submit content error')
        }
        if (new_pass !== new_pass_again) {
            throw new Error('two password are not same.')
        }
        if (hash(old_pass) !== user.password) {
            console.log('旧密码无效')
            throw new Error('Invalid Old Password')
        }
    }

    const res = await collection.doc(user._id).update({password: hash(new_pass), isSetPass: true})
    if (!res.ok) {
        throw new Error(res.error)
    }
}

interface Body {
    id: number
    password_form: {
        new_pass: string
        new_pass_again: string
        old_pass: string
    }
}
