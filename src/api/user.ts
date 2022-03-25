import { GithubRepo } from '@/entity'
import { getToken, getUser } from '@/utils/auth'
import { cloud } from "./cloud"
// ========================================================================================
// ======================================== Github ========================================
// ========================================================================================
/**
 * code exchange token
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
    meta: repo,
  })
}

/**
 * unbind a repo
 * @returns
 */
export async function unbind_repo(repo: GithubRepo) {
  return await cloud.invokeFunction("unbind_github_repo", {
    token: getToken(),
    repo_id: repo.id
  })
}

// ========================================================================================
// ======================================== Bytepay =======================================
// ========================================================================================
/**
 * get binded repo info
 */
 export async function get_binded_repos() {
  return await cloud.invokeFunction("get_binded_repos", { id: getUser().id })
}

/**
 * Get Author Tasks By Repo
 * @param repo_id repo id
 * @returns taska
 */
 export async function get_tasks(repo_id: number) {
  return await cloud.invokeFunction("get_tasks", {
    repo_id,
  })
}

/**
 * Get Developer Tasks
 * @param dev_id developer id
 * @returns developer tasks
 */
export async function get_dev_tasks(dev_id: number) {
  return await cloud.invokeFunction("get_dev_tasks", {
    dev_id,
  })
}

export async function set_password(password_form: object) {
  const user = getUser()
  return await cloud.invokeFunction('set_password', {
    password_form,
    id: user.id
  })
}

export async function goto_task_page() {
  const user = getUser()
  return await cloud.invokeFunction('goto_task_page', {
    id: user.id
  })
}

// ========================================================================================
// ======================================== Polkadot ======================================
// ========================================================================================

/**
 * Get polkdot keyring
 */
 export async function get_polkadot_keyring() {
  const user = getUser()
  return await cloud.invokeFunction("get_polkdot_keyring", {
    id: user.id,
  })
}

/**
 * Developer Bind His Own Polka Account
 * @param address polka address
 * @returns
 */
export async function bind_own_polka_address(address: string) {
  const user = getUser()
  return await cloud.invokeFunction("bind_polka_address", {
    id: user.id,
    address,
  })
}

/**
 * Get Polka Account Info
 * @returns polka account balance
 */
export async function get_polka_account_info() {
  const user = getUser()
  return await cloud.invokeFunction('get_polkadot_account_info', {
    id: user.id
  })
}

/**
 * Get Polka Transfer Record
 * @returns polka account transfer record
 */
 export async function get_polkadot_tx_record() {
  const user = getUser()
  return await cloud.invokeFunction('get_polkadot_tx_record', {
    id: user.id
  })
 }

 /**
  * Withdraw polka account, transfer dot actually
  */
export async function polkadot_withdraw(address: string, password: string, amount: number) {
  const user = getUser()
  return await cloud.invokeFunction('withdraw_polkadot', {
    id: user.id,
    address,
    password,
    amount
  })
}

export async function getClasses() {
  return await cloud.invokeFunction('nft_get_classes', {})
 }