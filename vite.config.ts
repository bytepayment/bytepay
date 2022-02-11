import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import Markdown from "vite-plugin-md"
import path from "path"
function resolve(dir: string): string {
  return path.join(__dirname, dir)
}
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/], // <--
    }),
    Markdown(),
  ],
  resolve: {
    alias: {
      "@": resolve("src"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "./src/assets/styles/global.scss";',
      },
    },
  },
  server: {
    port: 10086
  }
})
