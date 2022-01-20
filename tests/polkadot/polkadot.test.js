const { assert } = require('console')
const { test_user_token,
      test_user_id,
      test_user_login,
      test_user_polka_address,
      test_bind_own_address } = require('../config')
const request = require('../request')

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
  let userinfo = undefined

  it('userinfo:get() should be ok', async function() {
    const r = await request.post("/get_github_user_info", {
      token: test_user_token,
    })
    userinfo = r.data
    assert(r.status === 200)
    assert(r.data.id === test_user_id)
  }).timeout(0)

  it('polkadot-address:get() should be ok', async function () {
    const r = await request.post('/get_polkdot_keyring', { id: userinfo.id })
    assert(r.status === 200)
    assert(r.data.data.address === test_user_polka_address)
  }).timeout(0)

  it('polkadot-mnemonic:get() should be null', async function() {
    const r = await request.post('/get_polkdot_keyring', { id: userinfo.id })
    assert(r.status === 200)
    assert(!r.data.data.mnemonic)
  }).timeout(0)

  it('polkadot-account-info:get() should be ok', async function() {
    const r = await request.post('/get_polkadot_account_info', { id: userinfo.id })
    assert(r.status === 200)
    assert(r.data.data.hasOwnProperty('free'))
    // For test user, we make an limit to ensure its account can transfer maxium 0.0001 Dot once,
    // So we are sure that its free dot is above 1 DOT, cause we recharge 1.5 Dot
    assert(r.data.data.free > 1)
    assert(r.data.data.hasOwnProperty('reserved'))
    assert(r.data.data.hasOwnProperty('miscFrozen'))
    assert(r.data.data.hasOwnProperty('feeFrozen'))
  })

  it('developer:bind_own_address() should be ok', async function() {
    const r = await request.post('/bind_polka_address', { id: userinfo.id, address: test_bind_own_address })
    assert(r.status === 200)
    assert(r.data.error === 0)
    assert(r.data.error_msg === 'success')
    // Get userinfo again to check
    const ru = await request.post("/get_github_user_info", { token: test_user_token })
    assert(ru.status === 200)
    assert(ru.data.own_polka_address === test_bind_own_address)
  }).timeout(0)

  it('polkadot-transfers-record:get() should be ok', async function() {

  }).timeout(0)

  it('polkadot-transfer:signAndSend() should be ok', async function() {

  }).timeout(0)

  it('polkadot:ensure-transfer-success() should be ok', async function() {

  }).timeout(0)
})