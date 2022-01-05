<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
</script>

<template>
  <!-- head bar-->
  <el-row class="head-bar">
    <el-col :span="3"></el-col>
    <el-col :span="3" class="logo"> 这里是logo </el-col>
    <el-col :span="12"></el-col>
    <el-col :span="3"></el-col>
  </el-row>

  <router-view />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.head-bar {
  height: 50px;
  background: purple;
  color: white;
}
</style>
