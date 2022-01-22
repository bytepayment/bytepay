const assert = require('assert')
const { test_dev_id, test_repo_id } = require('../config')
const request = require('../request')

/**
 * This test file focus on polkadot related apis
 * 1. Get author tasks by repo
 * 2. Get dev tasks
 */

describe('Get Tasks From Bytepay', function () {
  this.timeout(0)

  it('dev_task:get() should be ok', async function () {
    const r = await request.post('/get_dev_tasks', {
      dev_id: test_dev_id,
    })
    assert(r.status === 200)
    const tasks = r.data
    assert(Array.isArray(tasks))
    assert(tasks.length > 0)
    assert(tasks[0].hasOwnProperty('title'))
    assert(tasks[0].hasOwnProperty('author'))
    assert(tasks[0].hasOwnProperty('developer'))
    assert(tasks[0].hasOwnProperty('pay'))
    assert(tasks[0].hasOwnProperty('status'))
  })

  it('author_task:get() should be ok', async function () {
    const r = await request.post('/get_tasks', {
      repo_id: test_repo_id,
    })
    assert(r.status === 200)
    const tasks = r.data
    assert(Array.isArray(tasks))
    assert(tasks.length > 0)
    assert(tasks[0].hasOwnProperty('title'))
    assert(tasks[0].hasOwnProperty('author'))
    assert(tasks[0].hasOwnProperty('developer'))
    assert(tasks[0].hasOwnProperty('pay'))
    assert(tasks[0].hasOwnProperty('status'))
  })
})
