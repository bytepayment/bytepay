import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import store from "./store"
import ElementPlus from "element-plus"
import "element-plus/dist/index.css"
import "github-markdown-css/github-markdown-light.css"
const app = createApp(App)

app.use(ElementPlus).use(router).use(store).mount("#app")
