

import cloud from '@/cloud-sdk'
const Funcs = cloud.shared.get('funcs')
const aesEncrypt = Funcs.aesEncryptFunc
const aesDecrypt = Funcs.aesDecryptFunc

exports.main = async function (ctx: FunctionContext) {
  // body, query 为请求参数, auth 是授权对象
  const { auth, body, query } = ctx

  // 数据库操作
  const db = cloud.database()
  const coll = db.collection('user')
  const {data: users } = await coll.get()
  if (!users) return console.log('no users found')
  for (let index = 0; index < users.length; index++) {
    const user = users[index]
    const encrypt = aesEncrypt(user.polka.mnemonic)
    console.log('Username: ', user.login)
    // console.log('Polkamn: ', user.polka.mnemonic)
    // console.log('encryt:', encrypt)
    // console.log('decrypt', aesDecrypt(encrypt))
    console.log('Equal: ', aesDecrypt(encrypt) === user.polka.mnemonic)
    // coll.where({id: user.id}).update({'polka.mnemonic': encrypt})
  }
  
}
