
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Router from '@/router'
import mdMaps from './md-maps'
// =============== Datas ===============
const activeMD = ref('what-is-dotpay')
const defaultOpens = ref(['1', '2', '3', '4', '5'])
// =============== Functions ===============
function setActiveMDName(name: string) {
  activeMD.value = name
  Router.push({ name: 'docs', params: { name } })
}
function getComponent() {
  return mdMaps.get(activeMD.value)
}
const handleOpen = (key: string, keyPath: string[]) => {
  // console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  // console.log(key, keyPath)
}
// =============== Hooks ===============
onMounted(() => {
  activeMD.value = useRoute().params.name as any
})
</script>

<template>
  <div>
    <el-row>
      <el-col :span="5" class="menu-bar">
        <el-menu
          default-active="2"
          class="el-menu-vertical-demo"
          @open="handleOpen"
          @close="handleClose"
          :default-openeds="defaultOpens"
        >
          <el-sub-menu index="1">
            <template #title>
              <span>Overview</span>
            </template>
            <el-menu-item index="1-1" @click="setActiveMDName('bytepay-overview')">Overview</el-menu-item>
            <!-- <el-menu-item index="1-2" @click="setActiveMDName('why-dotpay')">Why Dot Pay</el-menu-item>
            <el-menu-item index="1-3" @click="setActiveMDName('how-dotpay-works')">How Dot Pay works</el-menu-item>-->
          </el-sub-menu>
          <el-sub-menu index="2">
            <template #title>
              <span>Work Flow</span>
            </template>
            <el-menu-item index="2-1" @click="setActiveMDName('bytepay-userguide')">User Guide</el-menu-item>
            <el-menu-item index="2-2" @click="setActiveMDName('bytepay-contract')">Ink! Contract</el-menu-item>
            <!-- <el-menu-item index="2-2" @click="setActiveMDName('issue')">Interact With Issue</el-menu-item>
            <el-menu-item index="2-3" @click="setActiveMDName('why-dotpay')">How Dot Pay works</el-menu-item>-->
          </el-sub-menu>
          <!-- <el-sub-menu index="3">
            <template #title>
              <span>F&Q</span>
            </template>
            <el-menu-item index="3-1" @click="setActiveMDName('what-is-dotpay')">What is Dot Pay</el-menu-item>
            <el-menu-item index="3-2" @click="setActiveMDName('why-dotpay')">Why Dot Pay</el-menu-item>
            <el-menu-item index="3-3" @click="setActiveMDName('why-dotpay')">How Dot Pay works</el-menu-item>
          </el-sub-menu>-->
        </el-menu>
      </el-col>
      <el-col :span="2" />
      <el-col :span="17" class="content-container">
        <component :is="getComponent()"></component>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
// Override element-plus default style
.el-menu {
  border-right: 0px solid black;
}
// Custom
.menu-bar {
  border-right: 1px solid #e6e6e6;
  padding-top: 10px;
}
.content-container {
  margin-top: 30px;
}
</style>

