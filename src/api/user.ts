import { GithubRepo } from "@/entity"
import { getToken, getUser } from "@/utils/auth"
import { cloud } from "./cloud"

/**
 * code 换 token
 */
export async function get_access_token(code: string) {
  return await cloud.invokeFunction("get_github_token", { code })
}

/**
 * get userinfo
 */
export async function get_user_info(token: string) {
  return await cloud.invokeFunction("get_github_user_info", { token })
}
/**
 * get repo info
 */
export async function get_github_repos() {
  return await cloud.invokeFunction("get_github_repos", { token: getToken() })
}

/**
 * get binded repo info
 */
export async function get_binded_repos() {
  return await cloud.invokeFunction("get_binded_repos", { id: getUser().id })
}

/**
 * bind a repo
 */
export async function bind_repo(repo: GithubRepo) {
  const user = getUser()
  return await cloud.invokeFunction("bind_github_repo", {
    token: getToken(),
    owner_name: user.login,
    owner_id: user.id,
    repo_name: repo.name,
    repo_id: repo.id,
  })
}

/**
 * Get polkdot keyring
 */
export async function get_polkadot_keyring() {
  const user = getUser()
  return await cloud.invokeFunction("get_polkdot_keyring", {
    id: user.id,
  })
}
