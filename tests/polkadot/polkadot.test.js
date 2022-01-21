const assert = require('assert')
const {
  getToken,
  test_user_id,
  test_user_login,
  test_user_polka_address,
  test_bind_own_address,
  test_recv_address,
} = require('../config')
const request = require('../request')

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * This test file focus on polkadot related apis
 * 1. Get userinfo(test user) on bytepay first
 * 2. User id of userinfo to retrieve polkadot address(bytepay would created an polka account by default)
 * 3. Get polka account info use api.query.system.account office api
 * 4. We support developer bind his own address
 * 5. Get 10 recent transfers of test user
 * 6. Make an transfer (limit amount less than 0.1 DOT) Test
 * 7. Check it's account info again to ensure the transfer is success
 */

describe('Polkadot Related API', function () {
  this.timeout(0)
  let userinfo = undefined
  let token = undefined
  let accountInfo = undefined

  before(async function () {
    token = await getToken()
  })

  it('userinfo:get() should be ok', async function () {
    const r = await request.post('/get_github_user_info', {
      token,
    })
    userinfo = r.data
    assert(r.status === 200)
    assert(r.data.id === test_user_id)
  })

  it('polkadot-address:get() should be ok', async function () {
    const r = await request.post('/get_polkdot_keyring', { id: userinfo.id })
    assert(r.status === 200)
    assert(r.data.data.address === test_user_polka_address)
  })

  it('polkadot-mnemonic:get() should be null', async function () {
    const r = await request.post('/get_polkdot_keyring', { id: userinfo.id })
    assert(r.status === 200)
    assert(!r.data.data.mnemonic)
  })

  it('polkadot-account-info:get() should be ok', async function () {
    const r = await request.post('/get_polkadot_account_info', {
      id: userinfo.id,
    })
    assert(r.status === 200)
    const data = r.data.data
    assert(data.hasOwnProperty('free'))
    // For test user, we make an limit to ensure its account can transfer maxium 0.0001 Dot once,
    // So we are sure that its free dot is above 1 DOT, cause we recharge 1.5 Dot
    assert(data.free > 1)
    assert(data.hasOwnProperty('reserved'))
    assert(data.hasOwnProperty('miscFrozen'))
    assert(data.hasOwnProperty('feeFrozen'))
    accountInfo = r.data.data
  })

  it('developer:bind_own_address() should be ok', async function () {
    const r = await request.post('/bind_polka_address', {
      id: userinfo.id,
      address: test_bind_own_address,
    })
    assert(r.status === 200)
    assert(r.data.error === 0)
    assert(r.data.error_msg === 'success')
    // Get userinfo again to check
    const ru = await request.post('/get_github_user_info', {
      token,
    })
    assert(ru.status === 200)
    assert(ru.data.own_polka_address === test_bind_own_address)
  })

  it('polkadot-transfers-record:get() should be ok', async function () {
    const r = await request.post('/get_polkadot_tx_record', {
      id: userinfo.id,
    })
    assert(r.data.error === 0)
    assert(r.data.data.count > 7) // For test account, we have 8 transfer at least
    assert(r.data.data.transfers[0].from)
    assert(r.data.data.transfers[0].to)
    assert(r.data.data.transfers[0].amount)
  })

  it('polkadot-transfer:signAndSend() should be ok', async function () {
    const r = await request.post('/polkadot_transfer_only_for_test', {
      pay_user_id: userinfo.id,
      recv_address: test_recv_address,
      amount: 0.00001,
    })
    assert(r.status === 200)
    const result = r.data
    assert(result.error === 0)
    assert(result.data.hasOwnProperty('hash'))
  })

  it('polkadot:ensure-transfer-success() should be ok', async function () {
    // Wait 6 seconds to ensure transfer success
    await sleep(6000)
    const r = await request.post('/get_polkadot_account_info', {
      id: userinfo.id,
    })
    assert(r.status === 200)
    const newAccountInfo = r.data.data
    assert(newAccountInfo.hasOwnProperty('free'))
    assert(accountInfo.free > newAccountInfo.free)
  })
})
