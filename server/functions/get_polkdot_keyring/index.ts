

import cloud from '@/cloud-sdk'
import { Keyring } from '@polkadot/keyring'
import { mnemonicGenerate } from '@polkadot/util-crypto';

const Funcs = cloud.shared.get('funcs')
const createPolkaApi = Funcs.createPolkaApiFunc
const aesEncrypt = Funcs.aesEncryptFunc

export async function main (ctx: FunctionContext) {

  const { body } = ctx
  const { id } = body
  // Find if this user have generate account already
  const userColl = cloud.database().collection('user')
  const f = await userColl.where({ id }).getOne()
  // User Not Found
  if (!f.data) {
    return { error: 1, error_msg: 'User Not found'}
  }
  // Have generated polka accounts already
  if (f.data.polka) {
    let polka = f.data.polka
    // shiled mnemonic property
    polka.mnemonic = null
    return { error: 0, data: polka }
  }
  // Generated polka account for this user
  const api = await createPolkaApi()
  // Constuct the keyring after the API (crypto has an async init)
  const keyring = new Keyring({ type: 'sr25519', ss58Format: 0  });
  const mnemonic = mnemonicGenerate()
  const mnemonic_encrypted = aesEncrypt(mnemonic)
  const pair = keyring.createFromUri(mnemonic);
  const address = pair.address
  const polka = {
    mnemonic: mnemonic_encrypted, address, type: pair.type, meta: pair.meta, publicKey: pair.publicKey
  }
  // Save polka accounts into our own database
  try {
    const ur = await userColl.where({id}).update({ polka })
    return { error: 0, data: { address, type: pair.type, meta: pair.meta, publicKey: pair.publicKey } }
  } catch (error) {
    return { error: 5, error_msg: error }
  }

}


