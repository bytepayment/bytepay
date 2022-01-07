import { cloud } from "./cloud"
import { getToken } from "@/utils/auth"

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
