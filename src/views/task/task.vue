<script lang="ts" setup>
import { onBeforeMount, ref, Ref } from 'vue'
import { ElMessage } from 'element-plus'
import { GithubRepo, GithubUser, BindedGithubRepo } from '@/entity'
import { get_github_repos, get_binded_repos } from '@/api/user'
import Router from '@/router'
// =============== Datas ===============
const binded_repos: Ref<BindedGithubRepo[]> = ref([])
const activeTabIndex = ref('0')
const activeRepoIndex = ref('0')
const taskStatus = ref('')
const statusOptions = ref([
  { label: 'online', value: 'online' },
  { label: 'offline', value: 'offline' },
  { label: 'complete', value: 'complete' },
])
// =============== Functions ===============
function gotoBindPage() {
  Router.push({ name: 'bind' })
}
const handleClick = (tab: string, event: Event) => {
  console.log(activeTabIndex.value)
}
// =============== Hooks ===============
onBeforeMount(async () => {
  const r = await get_binded_repos()
  if (r.length === 0) {
    ElMessage({
      message: "You've bind nothing, please bind a repo first",
      type: 'warning',
    })
    gotoBindPage()
  }
  binded_repos.value = r
})
</script>

<template>
  <el-row style="margin-top: 20px">
    <el-col :span="8">
      <div class="side-bar">
        <div class="line-one">
          <h2 class="text-brief">Repos</h2>
          <el-button
            v-if="activeTabIndex === '0'"
            round
            color="#6667AB"
            style="color: white"
            @click="gotoBindPage"
          >Bind Repositories</el-button>
        </div>

        <el-tabs
          class="tabs"
          v-model="activeTabIndex"
          :stretch="true"
          type="border-card"
          @tab-click="handleClick"
        >
          <el-tab-pane label="My Repo" class="repo-list">
            <el-collapse v-model="activeRepoIndex" accordion>
              <el-collapse-item
                v-for="(item, index) in binded_repos"
                :title="item.repo_name"
                :name="index"
              >
                <div>{{ item?.meta?.description || '' }}</div>
              </el-collapse-item>
            </el-collapse>
          </el-tab-pane>
          <el-tab-pane label="My Task">My Task</el-tab-pane>
        </el-tabs>
      </div>
    </el-col>
    <el-col :span="16">
      <div class="main-card-author" v-if="activeTabIndex === '0'">
        <div class="menu-bar">
          <div style="font-weight: 600;">Tasks</div>
          <div style="margin-left: 20px;color:darkgray">Status</div>
          <el-select
            v-model="taskStatus"
            placeholder="All"
            size="small"
            style="width: 150px;margin-left: 15px;"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </div>
      </div>
      <div class="main-card-dev" v-else></div>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
.side-bar {
  .line-one {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .tabs {
    margin-top: 15px;
  }
  .repo-list {
    .repo-list-item {
      height: 30px;
      @include flex-row-center;
    }
  }
}
.main-card-author {
  margin: 85px 0 0 25px;
  .menu-bar {
    display: flex;
    align-items: flex-end;
    width: 100%;
  }
}
.main-card-dev {
  margin-left: 20px;
}
</style>
