<script lang="ts" setup>
import { DocPage, pageConfig, AllDocItemId } from '@/views/docs/docConfig'

const page = new DocPage()
const {component, language} = page
</script>

<template>
<el-row>
    <el-col :span="5" class="menu-bar">
        <el-menu :default-openeds="AllDocItemId" class="el-menu-vertical-demo" default-active="2">
            <el-sub-menu v-for="item in pageConfig" :index="item.id" :key="item.id">
                <template #title>
                    {{ item.title }}
                </template>
                <el-menu-item :key="childItem.id" v-for="childItem in item.children" :index="childItem.id" @click="(page.setActiveName(childItem.page))">
                    {{ childItem.title }}
                </el-menu-item>
            </el-sub-menu>
        </el-menu>
    </el-col>
    <el-col :span="2" />
    <el-col :span="17" class="content-container">
        <component :is="component"></component>
    </el-col>
</el-row>
<!--仅测试-->
<!--<el-switch v-model="language" active-text="中文" active-value="_zh" class="language-fixed" inactive-text="English" inactive-value="" />-->
</template>

<style lang="scss" scoped>
.language-fixed {
  position: fixed;
  bottom: 20px;
  right: 20px;
}

// Override element-plus default style
.el-menu {
  border-right: 0 solid black;
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
