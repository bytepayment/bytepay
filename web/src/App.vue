<script lang="ts" setup></script>

<template>
  <router-view />
</template>

<style lang="scss">
body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
  'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;

  .el-button--primary {
    background-color: #6667ab;
    border-color: #6667ab;
  }
  .el-button--primary:hover {
    background-color: #5a5c9e;
    border-color: #5a5c9e;
  }
}
</style>
