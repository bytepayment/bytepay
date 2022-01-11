
<script lang="ts" setup>
import HelloWorld from './What-Is-Dotpay.md'
import WhyDotpay from './Why-Dotpay.md'
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
function getComponent() {
  return WhyDotpay
}
const activeMD = ref('WhyDotpay')
import {
  Location,
  Document,
  Menu as IconMenu,
  Setting,
} from '@element-plus/icons-vue'
import { ref, watch } from 'vue'
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
              <el-icon>
                <location />
              </el-icon>
              <span>Overview</span>
            </template>

            <el-menu-item index="1-1">item one</el-menu-item>
            <el-menu-item index="1-2">item one</el-menu-item>

            <el-menu-item index="1-3">item three</el-menu-item>

            <el-sub-menu index="1-4">
              <template #title>item four</template>
              <el-menu-item index="1-4-1">item one</el-menu-item>
            </el-sub-menu>
          </el-sub-menu>
          <el-menu-item index="2">
            <el-icon>
              <icon-menu />
            </el-icon>
            <span>Navigator Two</span>
          </el-menu-item>
          <el-menu-item index="3" disabled>
            <el-icon>
              <document />
            </el-icon>
            <span>Navigator Three</span>
          </el-menu-item>
          <el-menu-item index="4">
            <el-icon>
              <setting />
            </el-icon>
            <span>Navigator Four</span>
          </el-menu-item>
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

