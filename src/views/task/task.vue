<script lang="ts" setup>
import { onBeforeMount, ref, Ref } from 'vue'
import { ElMessage } from 'element-plus'
import { BindedGithubRepo, DotpayTask } from '@/entity'
import { get_binded_repos, get_tasks } from '@/api/user'
import Router from '@/router'
// =============== Datas ===============
const binded_repos: Ref<BindedGithubRepo[]> = ref([])
const activeTabIndex = ref('0')
const activeRepoIndex = ref(1)
const taskStatus = ref('')
const statusOptions = ref([
  { label: 'Created', value: 'created' },
  { label: 'Applied', value: 'applied' },
  { label: 'Completed', value: 'completed' },
])
const authorTasks: Ref<DotpayTask[]> = ref([])
// =============== Functions ===============
function gotoBindPage() {
  Router.push({ name: 'bind' })
}
const handleClick = (tab: string, event: Event) => {
  console.log(activeTabIndex.value)
}
async function onRepoChanged() {
  if (typeof activeRepoIndex.value !== 'number') {
    return
  }
  const selectedRepo = binded_repos.value[activeRepoIndex.value]
  authorTasks.value = await get_tasks(selectedRepo.repo_id)
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
        <!-- Switch Author And Developer -->
        <el-tabs
          class="tabs"
          v-model="activeTabIndex"
          :stretch="true"
          type="border-card"
          @tab-click="handleClick"
        >
          <!-- Author -->
          <el-tab-pane label="My Repo" class="repo-list">
            <el-collapse v-model="activeRepoIndex" accordion @change="onRepoChanged()">
              <el-collapse-item
                v-for="(item, index) in binded_repos"
                :title="item.repo_name"
                :name="index"
              >
                <div>{{ item?.meta?.description || 'Your repo have no description 😳 ' }}</div>
              </el-collapse-item>
            </el-collapse>
          </el-tab-pane>
          <!-- Developer -->
          <el-tab-pane label="My Task">My Task</el-tab-pane>
        </el-tabs>
      </div>
    </el-col>
    <!-- Content Area -->
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
        <div class="task-table">
          <el-table :data="authorTasks" stripe style="width: 100%">
            <el-table-column prop="id" label="id" width="180" />
            <el-table-column prop="pay" label="Price" width="180" />
            <el-table-column prop="title" label="Title" />
            <el-table-column prop="describe" label="Description" />
            <el-table-column prop="task_url" label="Link" />
          </el-table>
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
    height: 80vh;
  }
  .repo-list {
    .repo-list-item {
      @include flex-row-center;
      height: 30px;
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
  .task-table {
  }
}
.main-card-dev {
  margin-left: 20px;
}
</style>
