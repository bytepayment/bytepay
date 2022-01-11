
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
// import HelloWorld from './What-Is-Dotpay.md'
// import WhyDotpay from './Why-Dotpay.md'
import Router from '@/router'
import { useRoute } from 'vue-router'
import mdMaps from './md-maps'
const activeMD = ref('what-is-dot-pay')
onMounted(() => {
  activeMD.value = useRoute().params.name as any
})
function setActiveMDName(name: string) {
  activeMD.value = name
  Router.push({ name: 'docs', params: { name } })
}
function getComponent() {
  return mdMaps.get(activeMD.value)
}
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}


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
        >
          <el-sub-menu index="1">
            <template #title>
              <span>Overview</span>
            </template>
            <el-menu-item index="1-1" @click="setActiveMDName('what-is-dot-pay')">What is Dot Pay</el-menu-item>
            <el-menu-item index="1-2" @click="setActiveMDName('why-dot-pay')">Why Dot Pay</el-menu-item>
            <el-menu-item index="1-3">How Dot Pay works</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="2">
            <template #title>
              <span>Work Flow</span>
            </template>
            <el-menu-item index="2-1">What is Dot Pay</el-menu-item>
            <el-menu-item index="2-2">Why Dot Pay</el-menu-item>
            <el-menu-item index="2-3">How Dot Pay works</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="3">
            <template #title>
              <span>F&Q</span>
            </template>
            <el-menu-item index="3-1">What is Dot Pay</el-menu-item>
            <el-menu-item index="3-2">Why Dot Pay</el-menu-item>
            <el-menu-item index="3-3">How Dot Pay works</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-col>
      <el-col :span="2"></el-col>
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

