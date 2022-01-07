<script lang="ts" setup>
import { get_github_repos } from '@/api/user'
import { computed } from 'vue'
const repos = await get_github_repos()
</script>

<template>
  <div class="main">
    <h1>repoistories</h1>
  </div>
</template>

<style lang="scss" scoped>
.main {
  text-align: center;
}
</style>