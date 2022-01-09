<script lang="ts" setup>
import { GithubRepo } from "@/entity";
import { get_github_repos } from "@/api/user";
import { computed, onBeforeMount, ref, Ref } from "vue";
import { Link } from "@element-plus/icons-vue";
import { useStore } from "vuex";
const store = useStore();
const user = store.state.user;
const repos: Ref<GithubRepo[]> = ref([]);
onBeforeMount(async () => {
  const r = await get_github_repos();
  repos.value = r.filter((item: GithubRepo) => item.owner.id === user.id);
});
</script>

<template>
  <div class="main">
    <h1>repoistories</h1>
    <el-card
      v-for="(item, index) in repos"
      :key="index"
      shadow="always"
      style="margin-top: 20px"
    >
      <div class="repo-card">
        <h2>{{ item.full_name }}</h2>
        <div class="button-group">
          <el-icon size="25" color="green"><Link /></el-icon>
          <el-button type="text" style="margin-left: 5px">Bind</el-button>
        </div>
      </div>
    </el-card>
    <el-button class="skip-button" color="#626aef" size="large" :round="true"
      >Skip First</el-button
    >
  </div>
</template>

<style lang="scss" scoped>
.main {
  text-align: center;
  .repo-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .button-group {
      display: flex;
      align-items: center;
    }
  }
  .skip-button {
    color: white;
    margin-top: 30px;
    width: 200px;
  }
}
</style>
