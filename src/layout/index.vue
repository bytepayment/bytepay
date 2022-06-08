<script lang="ts" setup>
import LogoUrl from '@/assets/logo.png'
import Router from '@/router'
import { ArrowDownBold, CircleClose, Setting } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
// =============== Datas ===============
const store = useStore()
store.dispatch('get_user_info')
const user = computed(() => {
    return store.state.user
})
const key = computed(() => {
    return useRoute().path
})

// =============== Functions ===============
function gotoPage(url: string) {
    Router.replace(url)
}

function logout() {
    store.dispatch('logout')
}
</script>

<template>
<!-- head bar-->
<div>
    <el-row class="head-bar">
        <el-col :span="3"></el-col>
        <el-col :span="3" class="logo" @click="gotoPage('property')">
            <el-image :src="LogoUrl" fit="fill" style="width:50px;height:50px;"></el-image>
            <span class="text">Bytepay</span>
        </el-col>
        <!-- Menu -->
        <el-col :span="6" class="menu">
            <div class="menu-item" @click="gotoPage('/property')">My property</div>
            <div class="menu-item" @click="gotoPage('/task')">Task</div>
            <div class="menu-item" @click="gotoPage('/market')">NFT Market</div>
            <div class="menu-item" @click="gotoPage('/docs')">Docs</div>
        </el-col>
        <!-- Empty -->
        <el-col :span="5"></el-col>
        <!-- Avata -->
        <el-col :span="4" class="avatar-container">
            <el-avatar :size="40" :src="user?.avatar_url"></el-avatar>
            <span class="username">{{ user?.name || user?.login || '' }}</span>
            <el-dropdown trigger="click">
                <el-icon color="white" size="16" style="margin-left: 5px">
                    <arrow-down-bold />
                </el-icon>
                <template #dropdown>
                    <el-dropdown-menu style="width: 100px">
                        <el-dropdown-item :icon="Setting" @click="gotoPage('/settings/password')">Settings</el-dropdown-item>
                        <el-dropdown-item :icon="CircleClose" @click="logout()">Logout</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </el-col>
        <el-col :span="3"></el-col>
    </el-row>
    <el-row>
        <el-col :span="3"></el-col>
        <el-col :span="18">
            <router-view />
        </el-col>
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

  .logo {
    display: flex;
    justify-content: flex-start;
    align-content: center;

    .text {
      color: white;
      display: flex;
      align-items: center;
    }
  }

  .menu {
    display: flex;
    justify-content: space-around;
    align-items: center;

    .menu-item:hover {
      cursor: pointer;
    }
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
