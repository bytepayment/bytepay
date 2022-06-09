

import cloud from '@/cloud-sdk'
const Hash = require('ipfs-only-hash')
import * as fs from 'fs'

exports.main = async function (ctx: FunctionContext) {

  const buf = fs.readFileSync('./package.json')
  const hash = await Hash.of(buf)
  console.log(hash)

  return 'ok'
}
