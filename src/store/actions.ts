import { getToken, setToken, removeToken, setUser } from "../utils/auth"
import { get_access_token, get_user_info } from "@/api/user"
import Router from "@/router/"

export const actions = {
  async login(ctx: any, payload: any) {
    const r = await get_access_token(payload)
    if (r.access_token) {
      ctx.commit("SET_TOKEN", r.access_token)
      setToken(r.access_token)
    }
    console.log("Request complete", r)
  },
  async get_user_info(ctx: any, payload: any) {
    console.log("Get github user information")
    if (!getToken()) return
    const r = await get_user_info(getToken() as any)
    if (!r.login || r.error == 1) {
      console.log("Get github user info failed")
      removeToken()
      Router.push({ name: "login" })
    }
    ctx.commit("UPDATE_USER_INFO", r)
    setUser(JSON.stringify(r))
    console.log("Get github user info complete:", r)
  },
  async logout(ctx: any) {
    removeToken()
    Router.push({ name: "login" })
  },
}
