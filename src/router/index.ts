import { createRouter, createWebHistory } from "vue-router"
import NProgress from "nprogress" // progress bar
import "nprogress/nprogress.css" // progress bar style
import { getToken } from "@/utils/auth"
import { routes, whiteList } from "./routes"
const history = createWebHistory()
const SiteName = "Bytepay"
const router = createRouter({
  history,
  routes,
})

router.beforeEach(async (to, from, next) => {
  // start progress bar
  NProgress.start()
  // determine whether the user has logged in
  const hasToken = getToken()
  if (hasToken) {
    if (to.path === "/login") {
      // if is logged in, redirect to the home page
      next({ path: "/" })
      document.title = (SiteName + " - " + to.meta.title) as string
      NProgress.done() // hack: https://github.com/PanJiaChen/vue-element-admin/pull/2939
    } else {
      document.title = (SiteName + " - " + to.meta.title) as string
      next()
    }
  } else {
    /* has no token*/
    if (whiteList.indexOf(to.path) !== -1) {
      // console.log('token not found', to)
      // in the free login whitelist, go directly
      document.title = (SiteName + " - " + to.meta.title) as string
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      document.title = SiteName + " - " + "Login"
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router
