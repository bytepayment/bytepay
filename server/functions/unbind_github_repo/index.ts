

import cloud from '@/cloud-sdk'
import axios from 'axios'

// Bind a repo, means add a webhook
exports.main = async function (ctx: FunctionContext) {
  // body, query 为请求参数, auth 是授权对象
  const { body } = ctx
  const { token, repo_id } = body
  // Check if binded before
  const coll = cloud.database().collection('repos')
  const finded = await coll.where({ repo_id }).getOne()
  if (!finded.data) {
    return { error: 1, error_msg: 'The repo has not binded.' }
  }
  // Delete webhook
  const headers = { 'Accept': 'application/vnd.github.v3+json', 'Authorization': `Bearer ${token}` }
  // Construct Add Webhook Body
  const owner = finded.data.owner_name
  const repo = finded.data.repo_name
  const hook_id = finded.data.hook_id
  // Request Github to add
  try {
    const r = await axios({
      url: `https://api.github.com/repos/${owner}/${repo}/hooks/${hook_id}`,
      method: 'DELETE',
      headers,
    })
    console.log(r)
    if (r.status != 204) {
      return { error: 2, error_msg: r.data }
    }
    // Delete from our database
    await coll.where({ repo_id }).remove()
    return { error: 0, data: r.data }
  } catch (error) {
    if (error?.response?.status === 404) {
      await coll.where({ repo_id }).remove()
      return { error: 0, data: 'success' }
    }
    let error_msg_r = error?.response?.data?.errors || ''
    if (error_msg_r) {
      const error_msg = error_msg_r.map(i => i.message).join(';')
      return { error: 3, error_msg}
    }
    return { error: 3, error_msg: 'request github caught error...'}
  }

}
