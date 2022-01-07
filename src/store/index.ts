import { createStore } from "vuex"
import {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
} from "../utils/auth"
import { get_access_token, get_user_info } from "../api/user"
import { useRouter } from "vue-router"
import { ElLoading, ElMessage } from "element-plus"
import { nextTick } from "vue"
import Router from "../router/"
const store = createStore({
  state: {
    token: getToken(),
    user: getUser(),
  },
  mutations: {
    SET_TOKEN(state, payload) {
      state.token = payload
    },
    UPDATE_USER_INFO(state, payload) {
      state.user = payload
    },
  },
  actions: {
    async login(ctx, payload) {
      console.log("Request access_token by temp code from github...")
      const loadingInstance = ElLoading.service({ fullscreen: true })
      try {
        const r = await get_access_token(payload)
        if (r.access_token) {
          ctx.commit("SET_TOKEN", r.access_token)
          setToken(r.access_token)
        }
        nextTick(() => {
          // Loading should be closed asynchronously
          loadingInstance.close()
        })
        Router.push("/")
        console.log("Request complete", r)
      } catch (error) {
        ElMessage.error("Oops, get github token failed, please retry...")
        nextTick(() => {
          // Loading should be closed asynchronously
          loadingInstance.close()
        })
      }
    },
    async get_user_info(ctx, payload) {
      console.log("Get github user information")
      const r = await get_user_info(getToken() as any)
      if (!r.login) {
        console.log("Get github user info failed")
      }
      ctx.commit("UPDATE_USER_INFO", r)
      setUser(JSON.stringify(r))
      console.log("Get github user info complete:", r)
    },
    async logout(ctx) {
      removeToken()
      Router.push({ name: "login" })
    },
  },
  modules: {},
})

export default store
