const assert = require('assert')
const generator = require('project-name-generator')
const {
  getToken,
  test_user_id,
  test_user_login,
  test_repo_name,
} = require('../config')
const axios = require('axios')

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * For This Test Workflow, we will do following things
 * 1. Create an issue in test repo: sulnong/Transl
 */

describe('Interact With Repo', function () {
  this.timeout(0)
  let token = undefined
  let createIssue = undefined
  before(async function () {
    token = await getToken()
  })
  it.skip('Issue:create() should be ok', async function () {
    const r = await axios({
      url: `https://api.github.com/repos/${test_user_login}/${test_repo_name}/issues`,
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${token}`,
      },
      data: {
        title: `Test Issue By Dotpay: ${generator().spaced}`,
        body: 'This issue is for bytepay test',
      },
    })
    assert(r.status === 201)
    createIssue = r.data
    assert(createIssue.hasOwnProperty('id'))
    assert(createIssue.hasOwnProperty('number'))
    assert(createIssue.hasOwnProperty('title'))
    assert(createIssue.hasOwnProperty('body'))
  })

  it.skip('Task:create() sould be ok', async function () {
    await sleep(2000) // sleep 3 seconds wait github create issue
    const url = `https://api.github.com/repos/${test_user_login}/${test_repo_name}/issues/3/comments`
    const r = await axios({
      url,
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${token}`,
      },
      data: {
        body: 'Dotpay: /pay 0.0001 DOT',
      },
    })
    assert(r.status === 201)
    result = r.data
    assert(result.id === createIssue.id)
    assert(result.body === 'Dotpay: /pay 0.0001 DOT')
  })

  it('Task:apply() should be ok', async function () {
    await sleep(2000) // sleep 3 seconds wait github create issue
    const url = `https://api.github.com/repos/${test_user_login}/${test_repo_name}/issues/3/comments`
    const r = await axios({
      url,
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${token}`,
      },
      data: {
        body: 'Dotpay: /pay 0.0001 DOT',
      },
    })
    assert(r.status === 201)
    result = r.data
    assert(result.id === createIssue.id)
    assert(result.body === 'Dotpay: /pay 0.0001 DOT')
  })

  it('Task:finish() should be ok', async function () {
    await sleep(2000) // sleep 3 seconds wait github create issue
    const url = `https://api.github.com/repos/${test_user_login}/${test_repo_name}/issues/3/comments`
    const r = await axios({
      url,
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${token}`,
      },
      data: {
        body: 'Dotpay: /pay 0.0001 DOT',
      },
    })
    assert(r.status === 201)
    result = r.data
    assert(result.id === createIssue.id)
    assert(result.body === 'Dotpay: /pay 0.0001 DOT')
  })

  it('Task:pay() should be ok', async function () {
    await sleep(2000) // sleep 3 seconds wait github create issue
    const url = `https://api.github.com/repos/${test_user_login}/${test_repo_name}/issues/3/comments`
    const r = await axios({
      url,
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${token}`,
      },
      data: {
        body: 'Dotpay: /pay 0.0001 DOT',
      },
    })
    assert(r.status === 201)
    result = r.data
    assert(result.id === createIssue.id)
    assert(result.body === 'Dotpay: /pay 0.0001 DOT')
  })
})
