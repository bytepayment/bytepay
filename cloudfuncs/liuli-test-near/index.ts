// noinspection JSUnusedLocalSymbols

import BN from 'bn.js'
import { Account, AccountAuthorizedApp, AccountBalance } from 'near-api-js/lib/account'
import { Near } from 'near-api-js/lib/near'
import { FinalExecutionOutcome } from 'near-api-js/lib/providers/index'
import { PublicKey } from 'near-api-js/lib/utils/index'

const NearAPI = require('near-api-js')

/**
 * 主函数
 */
exports.main = async function (ctx: any) {
    const service = new NearService()
    await service.init()

    const address = 'yudie.testnet'
    const info = await service.accountInfo(address)
    const balance = await service.accountBalance(address)

    return {
        info,
        balance,
        narrowBalance: service.narrow(balance),
    }
}

class NearService {
    private readonly UNIT = 1_0000_0000_0000_0000_0000_0000
    private _connect: Near
    private get connect() {
        if (!this._connect) {
            throw new Error('connect 未初始化')
        }
        return this._connect
    }

    public async init() {
        // 从私钥字符串创建 keyStore 您可以在此处定义您的密钥或使用环境变量
        // noinspection SpellCheckingInspection
        const PRIVATE_KEY = '3by8kdJoJHu7uUkKfoaLJ2Dp1q1TigeWMGpHu9UGXsWdREqPcshCM223kWadmrMKpV9AsWG5wL9F9hZzjHSRFXud'

        const keyStore = new NearAPI.keyStores.InMemoryKeyStore()
        try {
            // 将您创建的密钥对添加到 keyStore
            await keyStore.setKey('testnet', 'yudie.testnet', NearAPI.KeyPair.fromString(PRIVATE_KEY))
        } catch (err) {
            console.log('set key: ', err)
        }

        this._connect = await NearAPI.connect({
            deps: {keyStore: undefined},
            headers: {},
            initialBalance: '',
            keyPath: '',
            masterAccount: '',
            signer: undefined,
            networkId: 'testnet',
            nodeUrl: 'https://rpc.testnet.near.org',
            walletUrl: 'https://wallet.testnet.near.org',
            helperUrl: 'https://helper.testnet.near.org',
            keyStore: keyStore,
            explorerUrl: 'https://explorer.testnet.near.org',
        })
        console.log('已连接......')
    }

    /**
     * 账号余额
     */
    public async accountBalance(accountAddress: string) {
        const account = await this.connect.account(accountAddress)
        return await account.getAccountBalance()
    }

    /**
     * 账号详细信息
     */
    public async accountInfo(accountAddress: string): Promise<{ authorizedApps: AccountAuthorizedApp[] }> {
        const account: Account = await this.connect.account(accountAddress)
        return await account.getAccountDetails()
    }

    /**
     * 创建账户
     */
    public async createAccount(data: { form: string, accountId: string, publicKey: string | PublicKey, initAmount: string }): Promise<FinalExecutionOutcome> {
        const {accountId, initAmount, publicKey} = data
        const account = await this.connect.account(data.form)
        return await account.createAccount(accountId, publicKey, initAmount as any as BN)
    }

    /**
     * 发起转账
     */
    public async transfer(form: string, to: string, amount: string): Promise<FinalExecutionOutcome> {
        const account = await this.connect.account(form)
        return await account.sendMoney(to, amount as any as BN)
    }

    public narrow(balance: AccountBalance): AccountBalance {
        return Object.keys(balance)
            .reduce((pv, key) => {
                const value: string = balance[key]
                const number = parseFloat(value) / this.UNIT
                pv[key] = trimSuffix(number.toFixed(6))

                return pv
            }, {} as AccountBalance)
    }

}

const regExp = new RegExp('^(\\d+(\\.\\d+?)?)0*?$')
function trimSuffix(target: string) {
    const arr = regExp.exec(target)
    return arr![1]
}
