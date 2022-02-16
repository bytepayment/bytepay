

import cloud from '@/cloud-sdk'
import { Keyring } from '@polkadot/keyring'
import { mnemonicGenerate } from '@polkadot/util-crypto';

interface Sender {
  id: number
  login: string
}

exports.main = async function (ctx: FunctionContext) {
  const { body: sender } = ctx
  // check if user alread exist
  const collUser = cloud.database().collection('user')
  const { data: user } = await collUser.where({ id: sender.id }).getOne()
  if (user) return console.log('User already exists')
  // create a polka account
  const keyring = new Keyring({ type: 'sr25519', ss58Format: 0 });
  const mnemonic = mnemonicGenerate()
  const pair = keyring.createFromUri(mnemonic);
  const address = pair.address
  const polka = {
    mnemonic, address, type: pair.type, meta: pair.meta, publicKey: pair.publicKey
  }
  // add new user
  const new_user = {
    ...sender,
    polka,
    isSetPass: false
  }
  await collUser.add(new_user)
  console.log('add success')

}
