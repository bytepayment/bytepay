

import cloud from '@/cloud-sdk'

 import { nanoid } from 'nanoid/non-secure'

exports.main = async function (ctx: FunctionContext) {
  const id = nanoid(64)
  console.log(id)
}
