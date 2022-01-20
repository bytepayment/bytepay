const { assert } = require('console')
const { test_user_token, test_user_id, test_user_login } = require('../config')
const request = require('../request')

describe('Github Public Userinfo', function () {
  it('get() should be ok', async function () {
    const r = await request.post('/get_github_user_info', { token: test_user_token })
    assert(r.status === 200)
    assert(r.data.id === test_user_id)
    assert(r.data.login === test_user_login)
  }).timeout(0)
})