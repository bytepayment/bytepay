<script lang="ts" setup>
import { GithubRepo, GithubUser, BindedGithubRepo } from "@/entity";
import { get_github_repos, get_binded_repos, bind_repo } from "@/api/user";
import { computed, onBeforeMount, ref, Ref } from "vue";
import { Link } from "@element-plus/icons-vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { useStore } from "vuex";
const store = useStore();
const user: GithubUser = store.state.user;
const repos: Ref<GithubRepo[]> = ref([]);
const binded_repos: Ref<BindedGithubRepo[]> = ref([]);

onBeforeMount(async () => {
  const r = await get_github_repos();
  // Filter repos that not owns to current login user
  repos.value = r.filter((item: GithubRepo) => item.owner.id === user.id);
  binded_repos.value = await get_binded_repos();
});
async function bind_a_repo(repo: GithubRepo) {
  const r = await bind_repo(repo);
  if (r.error !== 0) {
    return ElMessageBox({
      type: "error",
      message: r.error_msg,
    });
  }
  return ElMessage({ type: "success", message: "Bind success" });
}
function if_binded(repo: GithubRepo) {
  console.log(binded_repos.value);
  for (let index = 0; index < binded_repos.value.length; index++) {
    const element = binded_repos.value[index];
    console.log(element.repo_id, repo.id);
    if (repo.id === element.repo_id) {
      return true;
    }
  }
  return false;
}
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
        <div v-if="if_binded(item)" class="button-group">
          <el-icon size="25" color="gray"><Link /></el-icon>
          <el-button type="text" style="margin-left: 5px" disabled>Binded</el-button>
        </div>
        <div v-else class="button-group">
          <el-icon size="25" color="green"><Link /></el-icon>
          <el-button type="text" style="margin-left: 5px" @click="bind_a_repo(item)"
            >Bind</el-button
          >
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
