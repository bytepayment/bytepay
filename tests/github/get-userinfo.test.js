const { assert } = require('console')
const { getToken, test_user_id, test_user_login } = require('../config')
const request = require('../request')

describe('Github Public Userinfo', function () {
  this.timeout(0)
  let token = undefined
  before(async function () {
    token = await getToken()
  })
  it('get() should be ok', async function () {
    const r = await request.post('/get_github_user_info', {
      token,
    })
    assert(r.status === 200)
    assert(r.data.id === test_user_id)
    assert(r.data.login === test_user_login)
  })
})
