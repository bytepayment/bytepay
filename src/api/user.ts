import { cloud } from './cloud';
import axios from 'axios'

const client_id = '8ab7f2f0d33da575a717'
const client_secret = '5c5ab49116569b6830aa0ca80d0c1d9ceb90b83b'
const tokenUrl = `https://github.com/login/oauth/access_token`
const headers = { 'Accept': 'application/json' }


/**
 * code 换 token
 */
export async function get_access_token(code: string) {
  return await cloud.invokeFunction('get_github_token', { code })
}

/**
 * get userinfo
 */
export async function get_user_info(token: string) {
  return await cloud.invokeFunction('get_github_user_info', { token })
}
/**
 * get repo info
 */

