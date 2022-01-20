const { assert } = require('console')
const { test_user_token } = require('../config')
const request = require('../request')

describe('Github Public Repo', function () {
  it('get() should be ok', async function () {
    const r = await request.post('/get_github_repos', { token: test_user_token })
    assert(r.status === 200)
    assert(r.data.length >= 1) // We ensure this user have 1 repo at least.
    // assert important repo property
    assert(r.data[0].id)
    assert(r.data[0].name)
    assert(r.data[0].owner)
  }).timeout(0)
})