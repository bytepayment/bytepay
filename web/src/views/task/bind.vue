<script lang="ts" setup>
import { onBeforeMount, ref, Ref, nextTick } from "vue";
import { useStore } from "vuex";
import { ElMessageBox, ElMessage, ElLoading } from "element-plus";
import { Link } from "@element-plus/icons-vue";
import { GithubRepo, GithubUser, BindedGithubRepo } from "@/entity";
import { get_github_repos, get_binded_repos, bind_repo, unbind_repo } from "@/api/user";
import router from "@/router";
import { cloud } from "@/api/cloud";
// =============== Datas ===============
const store = useStore();
const user: GithubUser = store.state.user;
const repos: Ref<GithubRepo[]> = ref([]);
const binded_repos: Ref<BindedGithubRepo[]> = ref([]);

// =============== Functions ===============
async function bind_a_repo(repo: GithubRepo) {
  const r = await bind_repo(repo);
  if (r.error !== 0) {
    return ElMessageBox({
      type: "error",
      message: r.error_msg,
    });
  }
  ElMessage({ type: "success", message: "Bind success" });
}

async function unbind_a_repo(repo: GithubRepo) {
  const r = await unbind_repo(repo);
  if (r.error !== 0) {
    return ElMessageBox({
      type: "error",
      message: r.error_msg,
    });
  }
  ElMessage({ type: "success", message: "Unbind success" });
}

function if_binded(repo: GithubRepo) {
  for (let index = 0; index < binded_repos.value.length; index++) {
    const element = binded_repos.value[index];
    if (repo.id === element.repo_id) {
      return true;
    }
  }
  return false;
}

function GotoTaskPage() {
  router.push({ name: "task" });
}

async function onChangeBindStatus(item: GithubRepo) {
  item.loading = true;

  await cloud.invokeFunction("bind_repo", {
    _id: item._id,
    bind: item.isBinded,
  });

  if (item.isBinded) {
    await bind_a_repo(item);
    return (item.loading = false);
  }
  await unbind_a_repo(item);
  item.loading = false;
}

async function initData() {
  const user = JSON.parse(localStorage.getItem("user") as any);
  const access_token = localStorage.getItem("access_token");
  const res = await cloud.invokeFunction("get_user_repositories", {
    access_token: access_token,
    owner_id: user.id,
  });

  const r = await cloud.invokeFunction("get_repo_list", { owner_id: user.id });
  repos.value = r;
}

// =============== Hooks ===============
onBeforeMount(async () => {
  await initData();
  await store.dispatch("get_user_info");
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
      <div class="repo-card" v-if="repos">
        <h2>{{ item.full_name }}</h2>
        <!-- <div v-if="if_binded(item)" class="button-group"> -->
        <el-switch
          active-text="Active Only"
          v-model="item.isBinded"
          @change="onChangeBindStatus(item)"
          :loading="item.loading"
        ></el-switch>
      </div>
    </el-card>
    <el-button
      class="skip-button"
      color="#626aef"
      size="large"
      :round="true"
      @click="GotoTaskPage"
      >Go Ahead</el-button
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
