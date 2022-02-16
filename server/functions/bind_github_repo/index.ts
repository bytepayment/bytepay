

import cloud from '@/cloud-sdk'
import axios from 'axios'

const Config = cloud.shared.get('config')
const BindRepoWebhooksUrl = Config.BindRepoWebhooksUrl

// Bind a repo, means add a webhook
exports.main = async function (ctx: FunctionContext) {
  // body, query 为请求参数, auth 是授权对象
  const { body } = ctx
  const { token, owner_name, repo_name, owner_id, repo_id, meta } = body
  const headers = { 'Accept': 'application/vnd.github.v3+json', 'Authorization': `Bearer ${token}` }
  // Construct Add Webhook Body
  const data = {
    config: {
      url: BindRepoWebhooksUrl,
      content_type: 'json'
    },
    events: ['issues', 'issue_comment']
  }
  // Check if binded before
  const col = cloud.database().collection('repos')
  const finded = await col.where({ owner_id, repo_id }).getOne()
  if (finded.data) {
    return { error: 1, error_msg: 'The repo has binded already.' }
  }
  // Request Github to add
  try {
    const r = await axios({
      url: `https://api.github.com/repos/${owner_name}/${repo_name}/hooks`,
      method: 'POST',
      headers,
      data
    })
    if (r.status != 201) {
      return { error: 2, error_msg: r.data }
    }
    // Add into our own database
    const addData = {
      owner_id, repo_id, owner_name, repo_name, meta, hook_id: r.data.id
    }
    await col.add(addData)
    return { error: 0, data: r.data }
  } catch (error) {
    let error_msg_r = error?.response?.data?.errors || ''
    if (error_msg_r) {
      const error_msg = error_msg_r.map(i => i.message).join(';')
      return { error: 3, error_msg}
    }
    return { error: 3, error_msg: 'request github caught error...'}
  }

}
