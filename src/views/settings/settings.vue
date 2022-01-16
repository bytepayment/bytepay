<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import Router from '@/router'
const activeSetting = ref('password')
import Password from './password.vue'
import Address from './recv-address.vue'
import Withdraw from './withdraw.vue'
const user = useStore().state.user
onMounted(() => {
  activeSetting.value = useRoute().params.setting as any
})
function getComponent() {
  if (activeSetting.value === 'password') {
    return Password
  } else if (activeSetting.value === 'address') {
    return Address
  } else if (activeSetting.value === 'withdraw') {
    return Withdraw
  } else {
    console.log('not found')
  }
}
function setActiveSetting(settingName: string) {
  activeSetting.value = settingName
  Router.replace(`/settings/${settingName}`)
}
</script>

<template>
  <el-row>
    <el-col :span="6" class="sidebar">
      <div class="user-info">
        <el-avatar :size="50" :src="user?.avatar_url"></el-avatar>
        <div class="text-area">
          <span class="name">{{ user?.name || user?.login || '' }}</span>
          <span>Your personal account</span>
        </div>
      </div>
      <div class="setting-list">
        <div class="setting-item" style="font-weight: 600;">Account Settings</div>
        <div class="setting-item" @click="setActiveSetting('password')">Password</div>
        <div class="setting-item" @click="setActiveSetting('withdraw')">Withdraw</div>
        <div class="setting-item last-item" @click="setActiveSetting('address')">Polka Address</div>
      </div>
    </el-col>
    <el-col :span="17" class="content-area">
      <component :is="getComponent()"></component>
    </el-col>
  </el-row>
</template>


<style lang="scss" scoped>
.sidebar {
  margin-top: 30px;
  padding: 0;

  .user-info {
    @include flex-row-start;
    height: 70px;
    .text-area {
      @include flex-column-start;
      margin-left: 10px;
      .name {
        font-weight: 600;
        font-size: 24px;
      }
    }
  }
  .setting-list {
    margin-top: 20px;
    border-top: 1px solid #d0d7de;
    border-left: 1px solid #d0d7de;
    border-right: 1px solid #d0d7de;
    border-radius: 8px;
    .setting-item {
      @include flex-row-start;
      height: 45px;
      padding: 0 0 0 8px;
      border-bottom: 1px solid #d0d7de;
    }
    .setting-item:hover {
      cursor: pointer;
    }
    .last-item {
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }
  }
}
.content-area {
  margin: 98px 0 0 20px;
  padding: 0;
}
</style>