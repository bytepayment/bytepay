<template>
  <div class="main">
    <el-card class="card-container" shadow="always">
      <div class="welcome-text">Welcome to Bytepay</div>
      <div class="auth-container">
        <div class="auth-area">
          <div class="login-text">Login</div>
          <el-divider direction="vertical"></el-divider>
          <el-avatar :size="35" :src="logoUrl"></el-avatar>
          <div class="github-text" @click="authGithub">GitHub</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { ElLoading, ElMessage } from "element-plus"
import logoUrl from '@/assets/GitHub.png'
const client_id = import.meta.env.VITE_GITHUB_OAUTH_CLIENT_ID
const Router = useRouter()
const store = useStore()
// check if redirect back
onMounted(async () => {
  const code = (useRoute().query?.code as any) || ''
  if (!code) return
  console.log('Github Redirect Back, request access_token by temp code from github...')
  const loadingInstance = ElLoading.service({ fullscreen: true })
  try {
    await store.dispatch('login', code)
    await store.dispatch('get_user_info')
    nextTick(() => {
      loadingInstance.close()
    })
    Router.push("/")
  } catch (error) {
    console.log(error)
    ElMessage.error("Oops, get github token failed, please retry...")
    nextTick(() => {
      loadingInstance.close()
    })
  }
})

// oauth github
const authUrl =
  `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=read:user,admin:repo_hook`
function authGithub() {
  window.location.href = authUrl
}
</script>

<style lang="scss" scoped>
.main {
  background: url("@/assets/login-background.jpg");
  background-size: cover;
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  .card-container {
    opacity: 0.7;
    margin-top: 20vh;
    width: 500px;
    height: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 40px;
    .welcome-text {
      font-size: 32px;
      font-weight: 800;
      color: #6667ab;
    }
    .auth-container {
      margin: 50px 0 0 0;
      height: 10vh;
      display: flex;
      align-items: center;
      justify-content: center;
      .auth-area {
        display: flex;
        align-items: center;
        .login-text {
          font-size: 20px;
        }
        .github-text {
          margin-left: 10px;
          font-size: 20px;
          font-weight: 800;
        }
      }
    }
  }
}
</style>
