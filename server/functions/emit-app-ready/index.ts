

import cloud from '@/cloud-sdk'

exports.main = async function (ctx: FunctionContext) {
  cloud.emit('App:ready', {})
  console.log(cloud.shared.get('config'))
  const funcs = cloud.shared.get('funcs')
  console.log(funcs)
  return 'ok'
}
