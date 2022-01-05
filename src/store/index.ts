import { createStore } from 'vuex'
import { getToken, setToken, removeToken } from '../utils/auth'
import { get_access_token } from '../api/user'
import { useRouter } from 'vue-router'

const store = createStore({
  state: {
    token: getToken(),
    user: undefined
  },
  mutations: {
    SET_TOKEN(state, payload) {
      state.token = payload
    },
    UPDATE_USER_INFO(state, payload) {
      state.user = payload
    }
  },
  actions: {
    async login(ctx, payload) {
      console.log('Request access_token by temp code from github...')
      const r = await get_access_token(payload)
      if (r.access_token) {
        ctx.commit('SET_TOKEN', r.access_token)
        setToken(r.access_token)
        useRouter().push({name: 'home'})
      }
      console.log('Request complete', r)
    },
    async get_user_info(ctx, payload) {

    }
  },
  modules: {

  }
})

export default store
