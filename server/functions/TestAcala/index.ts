

import cloud from '@/cloud-sdk'
import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { options } from '@acala-network/api'
import { mnemonicGenerate } from '@polkadot/util-crypto'
import * as crypto from 'crypto'
const Funcs = cloud.shared.get('funcs')

exports.main = async function (ctx: FunctionContext) {
  const provider = new WsProvider("wss://karura.api.onfinality.io/public-ws");
  const api = new ApiPromise(options({ provider }));
  await api.isReadyOrError;

  const address = "13VvNs5mN2zQANtVyy9Xd9Z6W7vUX13VxjLNMzDyWXqgxD7c";
  const accountData = await api.query.system.account(address);
  console.log(accountData.toHuman());

  const tokenData = await api.query.tokens.accounts(address, {
    Token: "AUSD",
  });
  console.log(tokenData.toHuman());
  // console.log(createAccount())

}

const CryptoPayLabPrivateKey = "OaXrkPelv%Artij0ZL7P^^qyHjBKc&wsfyD3V3AXnq@3Gj3zQ$9g7OXvm8==hnh"
const CryptKey=  "G9U15nVyI5n9Ugoc"
const CryptIV=  "j59SOZYAGDSemJEf"

function hash(content: string) {
        return crypto.createHash('sha256').update(CryptoPayLabPrivateKey + content).digest('hex')
  }

function aesEncrypt(text: string) {
    console.log('CryptKey, CryptIV',CryptKey, CryptIV)
    const cipher = crypto.createCipheriv('aes128', CryptKey, CryptIV)
    let encrypt = cipher.update(text, 'utf8', 'hex')
    encrypt += cipher.final('hex')
    return encrypt
}

function aesDecrypt(text: string) {
    const cipher = crypto.createDecipheriv('aes128', CryptKey, CryptIV)
    let decrypted = cipher.update(text, 'hex', 'utf8')
    decrypted += cipher.final('utf8')
    return decrypted
}

function  createAccount(){
    const keyring = new Keyring({type: 'sr25519', ss58Format: 0})
    console.log('createAccount for acala ')
    const mnemonic = mnemonicGenerate()
    const mnemonic_encrypted = aesEncrypt(mnemonic)
    const pair = keyring.createFromUri(mnemonic)
    return {
        mnemonic: mnemonic_encrypted,
        address: pair.address,
        type: pair.type,
        meta: pair.meta,
        publicKey: pair.publicKey,
        frozenAmount: 0,
    }
}
