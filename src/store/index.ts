import { createStore } from 'vuex'

const store = createStore({
  state: {
    user: undefined
  },
  mutations: {
    update_user(state, payload) {
      state.user = payload
    }
  },
  actions: {

  },
  modules: {

  }
})

export default store
