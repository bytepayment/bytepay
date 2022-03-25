import { RouteRecordRaw } from "vue-router"
import Layout from "@/layout/index.vue"

export const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    meta: {
      title: "Bytepay",
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
        component: () => import("@/views/task/task.vue"),
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
        path: "docs/:name",
        name: "docs",
        meta: {
          title: "Docs",
        },
        component: () => import("@/views/docs/docs.vue"),
      },
      {
        path: "settings/:setting",
        name: "settings",
        meta: {
          title: "Settings",
        },
        component: () => import("@/views/settings/settings.vue"),
      },
      {
        path: "market",
        name: "market",
        meta: {
          title: "market",
        },
        component: () => import("@/views/nft-market/index.vue"),
      },
      {
        path: "detail",
        name: "detail",
        meta: {
          title: "detail",
        },
        component: () => import("@/views/nft-market/detail.vue"),
      },
      {
        path: "publish",
        name: "publish",
        meta: {
          title: "publish",
        },
        component: () => import("@/views/nft-market/publish.vue"),
      }
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

export const whiteList = ["/login", "/sign-up", "/docs/bytepay-overview", "/docs/bytepay-userguide"] // no redirect whitelist
