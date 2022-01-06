<script lang="ts" setup>
import { ArrowDownBold } from "@element-plus/icons-vue";
import { useStore } from 'vuex'
import { computed, reactive } from 'vue'
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
      <el-col :span="9"> Three Menu </el-col>
      <!-- Avata -->
      <el-col :span="3" class="avatar-container">
        <el-avatar :size="50" :src="user?.avatar_url"></el-avatar>
        <el-dropdown>
          <span class="username">
            {{ user?.name || user?.login || ''}}
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
  </div>
</template>

<style lang="scss" scoped>
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
