<script lang="ts" setup>
import { ArrowDownBold } from "@element-plus/icons-vue";
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
const avatarUrl = "https://avatars.githubusercontent.com/u/37979965?v=4";
const username = "sunlong";
</script>

<template>
  <!-- head bar-->
  <el-row class="head-bar">
    <el-col :span="3"></el-col>
    <el-col :span="3" class="logo"> Here is logo </el-col>
    <!-- Menu -->
    <el-col :span="9"> Three Menu </el-col>
    <!-- Avata -->
    <el-col :span="3" class="avatar-container">
      <el-avatar :size="50" :src="avatarUrl"></el-avatar>
      <el-dropdown>
        <span class="username">
          {{ username }}
          <el-icon style="margin-left: 5px"><arrow-down-bold /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>Action 1</el-dropdown-item>
            <el-dropdown-item>Action 2</el-dropdown-item>
            <el-dropdown-item>Action 3</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-col>
    <el-col :span="3"></el-col>
  </el-row>

  <router-view />
</template>

<style lang="scss">
body {
  margin: 0;
  padding: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.head-bar {
  height: 60px;
  background: purple;
  color: white;
  display: flex;
  /* justify-content: center; */
  align-items: center;
  .avatar-container {
    display: flex;
    align-items: center;
    .username {
      display: flex;
      margin-left: 10px;
      font-size: 24px;
      color: white;
    }
  }
}
</style>
