<template>
  <div class="main">
    <el-card class="card-container">
      <div class="welcome-text">Welcome to Dot pay</div>
      <div class="auth-area">
        <div class="login-text">Login</div>
        <el-divider direction="vertical"></el-divider>
        <el-avatar :size="40" :src="logoUrl"></el-avatar>
        <div class="github-text" @click="authGithub">GitHub</div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import logoUrl from '../../assets/GitHub.png'
const Router = useRouter()
// check if redirect back
const code = (useRoute().query?.code as any) || ''
if (code) {
  console.log('Github Redirect Back')
  useStore().dispatch('login', code)
}
// oauth github
const authUrl =
  'https://github.com/login/oauth/authorize?client_id=8ab7f2f0d33da575a717&scope=user,public_repo'
function authGithub() {
  window.location.href = authUrl
}
</script>

<style lang="sass" scoped>
.main
  height: 100vh
  width: 100vw
  display: flex
  justify-content: center
  .card-container
    margin-top: 20vh
    width: 35vw
    height: 40vh
    display: flex
    flex-direction: column
    align-items: center
    .welcome-text
      font-size: 32px
      font-weight: 800
      color: blue
    .auth-area
      margin: 10vh 0 0 2vw
      height: 10vh
      display: flex
      align-items: center
      .login-text
        font-size: 20px
      .github-text
        margin-left: 20px
        font-size: 20px
        font-weight: 800
</style>
