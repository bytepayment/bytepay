

import cloud from '@/cloud-sdk'

exports.main = async function (ctx: FunctionContext) {

  return {
    '1': amountMagnified(1),
    '0.1': amountMagnified(0.1),
    '0.01': amountMagnified(0.01),
  }
}


function amountMagnified(amount: number) {
  const TRIM_TRAILING = new RegExp('^((\\d+)(\\.(\\d+?))?)0*?$')
  const prefix_reg_0 = new RegExp('^0*?([1-9]\\d+)$')
  
  const arr = TRIM_TRAILING.exec(String(amount))

  const integer = arr![2]
  let decimal = arr![4] || ''

  decimal = decimal.substring(0, Math.min(24, decimal.length))
  const zeroPadding = Math.max(24 - decimal.length, 0)

  // 整数 + 小数 + (24 - 小数长度)个零
  const amt = integer + decimal + new Array(zeroPadding).join('0')
  return prefix_reg_0.exec(amt)![1]
}