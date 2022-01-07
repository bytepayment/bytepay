<script lang="ts">
import { cloud } from '@/api/cloud'
import Router from '@/router'
import { ElMessage } from 'element-plus'
import { onMounted, onActivated } from '@vue/runtime-core'
export default {
  methods: {
    test() {
      Router.push('/bind')
    },
  },
  data: () => {
    return {
      binded_repos: [],
    }
  },
  async created() {
    const r = await cloud.invokeFunction('get_binded_repos', {})
    if (r.length === 0) {
      ElMessage({
        message: "You've bind nothing, please bind a repo first",
        type: 'warning',
      })
      // Router.replace({ name: 'bind' })
    }
  },
}
// onMounted(async () => {
//   console.log('start get binded repos')
//   const r = await cloud.invokeFunction('get_binded_repos', {})
//   console.log(r)
//   if (r.length === 0) {
//     ElMessage({
//       message: "You've bind nothing, please bind a repo first",
//       type: 'warning',
//     })
//     Router.replace({ name: 'bind' })
//   }
// })
</script>

<template>
  <h1>Task Center</h1>
  <button @click="test">go to bind page</button>
</template>