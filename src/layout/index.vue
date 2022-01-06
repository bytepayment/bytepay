<script lang="ts" setup>
import { ArrowDownBold, CircleClose, Setting } from '@element-plus/icons-vue'
import { useStore } from 'vuex'
import { computed, reactive } from 'vue'
import Router from '../router'
function gotoPage(url: string) {
  Router.push(url)
}
function gotoProperty() {
  gotoPage('/property')
}
function gotoTask() {
  gotoPage('/task')
}
function gotoHelp() {
  gotoPage('/help')
}

const store = useStore()
store.dispatch('get_user_info')
const user = computed(() => {
  return store.state.user
})
</script>

<template>
  <!-- head bar-->
  <div>
    <el-row class="head-bar">
      <el-col :span="3"></el-col>
      <el-col :span="3" class="logo"> Here is logo </el-col>
      <!-- Menu -->
      <el-col :span="6" class="menu">
        <div @click="gotoProperty">My property</div>
        <div @click="gotoTask">Task</div>
        <div @click="gotoHelp">Docs</div>
      </el-col>
      <!-- Empty -->
      <el-col :span="5"></el-col>
      <!-- Avata -->
      <el-col :span="4" class="avatar-container">
        <el-avatar :size="40" :src="user?.avatar_url"></el-avatar>
        <span class="username">
          {{ user?.name || user?.login || '' }}
        </span>
        <el-dropdown trigger="click">
          <el-icon style="margin-left: 5px" color="white" size="16"
            ><arrow-down-bold
          /></el-icon>
          <template #dropdown>
            <el-dropdown-menu style="width: 100px">
              <el-dropdown-item :icon="Setting">Settings</el-dropdown-item>
              <el-dropdown-item :icon="CircleClose">Logout</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-col>
      <el-col :span="3"></el-col>
    </el-row>
    <el-row>
      <el-col :span="3"></el-col>
      <el-col :span="18"><router-view /></el-col>
      <el-col :span="3"></el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.head-bar {
  height: 60px;
  background: #6667ab;
  color: white;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  .menu {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
  .avatar-container {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    .username {
      display: flex;
      margin-left: 10px;
      color: white;
    }
  }
}
</style>
