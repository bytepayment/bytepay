

import cloud from '@/cloud-sdk'
const Funcs = cloud.shared.get('funcs')
const createPolkaApi = Funcs.createPolkaApiFunc
const reducedUnit = Funcs.reducedUnitFunc

interface PolkaAccount {
  free: number,
  reserved: number,
  miscFrozen: number,
  feeFrozen: number,
}
export async function main(ctx: FunctionContext) {
  const { body } = ctx
  const { id } = body // user id
  const api = await createPolkaApi()
  // find user
  const collUser = cloud.database().collection('user')
  const f = await collUser.where({ id }).getOne()
  if (!f.data) return { error: 1, error_msg: 'User Not Found' }

  // Retrieve the account balance & nonce via the system module
  try {
    const address = f.data.polka.address
    const queryResult = await api.query.system.account(address);
    console.log(queryResult.data)
    const data = reducedUnit(queryResult.data)
    return { error: 0, data}
  } catch (error) {
    console.log(error)
    return { error: 2, error_msg: 'Internal Server Error' }
  }

}
