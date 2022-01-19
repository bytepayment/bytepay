

import cloud from '@/cloud-sdk'

exports.main = async function (ctx: FunctionContext) {
  cloud.emit('App:ready', {})
  console.log(cloud.shared.get('config'))
  return 'ok'
}
