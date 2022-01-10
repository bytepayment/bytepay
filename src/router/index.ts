import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router"
import NProgress from "nprogress" // progress bar
import "nprogress/nprogress.css" // progress bar style
import { getToken } from "@/utils/auth"
import Layout from "@/layout/index.vue"
const history = createWebHistory()

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    meta: {
      title: "Dot Pay",
    },
    component: Layout,
    redirect: "/property",
    children: [
      {
        path: "property",
        name: "property",
        meta: {
          title: "Property",
        },
        component: () => import("@/views/properties/properties.vue"),
      },
      {
        path: "task",
        name: "task",
        meta: {
          title: "Task",
        },
        component: () => import("@/views/task/index.vue"),
      },
      {
        path: "bind",
        name: "bind",
        meta: {
          title: "Bind Repository",
        },
        component: () => import("@/views/task/bind.vue"),
      },
      {
        path: "help",
        name: "help",
        meta: {
          title: "Docs",
        },
        component: () => import("@/views/help/index.vue"),
      },
      {
        path: "password",
        name: "password",
        meta: {
          title: "Password",
        },
        component: () => import("@/views/user/password.vue"),
      },
      {
        path: "recv-address",
        name: "recvAddress",
        meta: {
          title: "Receive Address",
        },
        component: () => import("@/views/user/recv-address.vue"),
      },
    ],
  },
  {
    path: "/login",
    name: "login",
    meta: {
      title: "Login",
    },
    component: () => import("@/views/auth-github/auth-github.vue"),
  },
]

const router = createRouter({
  history,
  routes,
})

const whiteList = ["/login", "/sign-up"] // no redirect whitelist

router.beforeEach(async (to, from, next) => {
  // start progress bar
  NProgress.start()
  // determine whether the user has logged in
  const hasToken = getToken()
  if (hasToken) {
    if (to.path === "/login") {
      // if is logged in, redirect to the home page
      next({ path: "/" })
      document.title = ("Dot Pay - " + to.meta.title) as string
      NProgress.done() // hack: https://github.com/PanJiaChen/vue-element-admin/pull/2939
    } else {
      document.title = ("Dot Pay - " + to.meta.title) as string
      next()
    }
  } else {
    /* has no token*/
    if (whiteList.indexOf(to.path) !== -1) {
      // console.log('token not found', to)
      // in the free login whitelist, go directly
      document.title = ("Dot Pay - " + to.meta.title) as string
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      document.title = "Dot Pay - " + "Login"
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router
