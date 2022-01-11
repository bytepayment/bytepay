import { createStore } from "vuex"
import { getToken, getUser } from "@/utils/auth"
import { actions } from "./actions"

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
  actions,
  modules: {},
})

export default store
