import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
const history = createWebHistory()

const routes : Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/index.vue')
  },
  {
    path: '/auth-github',
    name: 'auth-github',
    component: () => import('@/views/auth-github/auth-github.vue')
  }
]

const router = createRouter({
  history,
  routes
})

export default router