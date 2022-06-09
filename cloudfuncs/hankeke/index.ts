

import cloud from '@/cloud-sdk'
import { AccountIdentifier, LedgerCanister } from "@dfinity/nns";

 /**
   * - group 1 完整数字
   * - group 2 整数部分
   * - group 3 可能存在的小数部分, 含小数点
   * - group 4 可能存在的小数部分, 不含小数点
   */

const TRIM_TRAILING = new RegExp('^((\\d+)(\\.(\\d+?))?)0*?$')


const prefix_reg_0 = new RegExp('^0*?([1-9]\\d+)$')

  
exports.main = async function (ctx: FunctionContext) {

const ledger = LedgerCanister.create();

  const accountIdentifier = AccountIdentifier.fromHex(
    "efa01544f509c56dd85449edf2381244a48fad1ede5183836229c00ab00d52df"
  );

  const balance = await ledger.accountBalance({ accountIdentifier });

  console.log(`Balance: ${balance.toE8s()}`);

}

  /**
     * 交易金额 放大到实际数字
     */
    function amountMagnified(amount: number) {
        const arr = TRIM_TRAILING.exec(String(amount))

        const integer = arr![2]
        let decimal = arr![4] || ''
        
        decimal = decimal.substring(0, Math.min(24, decimal.length))
        const zeroPadding = Math.max(24 - decimal.length, 0)
        console.log('zeroPadding', zeroPadding, 'decimal', decimal)
        
        // 整数 + 小数 + (24 - 小数长度)个零
        const amt = integer + decimal + new Array(zeroPadding+1).join('0')
        return amt;
        //return prefix_reg_0.exec(amt)[1]
    }