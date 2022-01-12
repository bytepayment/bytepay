<script lang="ts" setup>
import { onBeforeMount, ref, Ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Link } from '@element-plus/icons-vue'
import { BindedGithubRepo, DotpayTask } from '@/entity'
import { get_binded_repos, get_tasks } from '@/api/user'
import Router from '@/router'
// =============== Datas ===============
const binded_repos: Ref<BindedGithubRepo[]> = ref([])
const activeTabIndex = ref('0')
const activeAuthorRepoIndex = ref(1)
const taskStatus = ref('')
const statusOptions = ref([
  { label: 'Created', value: 'created' },
  { label: 'Applied', value: 'applied' },
  { label: 'Completed', value: 'completed' },
])
const authorTasks: Ref<DotpayTask[]> = ref([])
const authorTasksForTabel: Ref<DotpayTask[]> = ref([])
// =============== Functions ===============
function gotoBindPage() {
  Router.push({ name: 'bind' })
}
function gotoTaskUrl(url: string) {
  window.open(url)
}
const handleClick = (tab: string, event: Event) => {
  console.log(activeTabIndex.value)
}
async function onAuthorRepoChanged() {
  if (typeof activeAuthorRepoIndex.value !== 'number') {
    return
  }
  const selectedRepo = binded_repos.value[activeAuthorRepoIndex.value]
  authorTasks.value = await get_tasks(selectedRepo.repo_id)
  authorTasksForTabel.value = authorTasks.value
}
function onStatusChange(val: any) {
  if (!val) return authorTasksForTabel.value = authorTasks.value
  authorTasksForTabel.value = authorTasks.value.filter(i => i.status === val)
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
  await onAuthorRepoChanged()
})
onMounted(async () => {
  console.log('mounted')
})
</script>

<template>
  <el-row style="margin-top: 20px">
    <el-col :span="6">
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
            <el-collapse v-model="activeAuthorRepoIndex" accordion @change="onAuthorRepoChanged()">
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
          <el-tab-pane label="My Task" class="dev-pane">
            <div>All Your Task Would List In Right Table</div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-col>
    <!-- Content Area -->
    <el-col :span="18">
      <div class="main-card-author" v-if="activeTabIndex === '0'">
        <div class="menu-bar">
          <div style="font-weight: 600;">Tasks</div>
          <div style="margin-left: 20px;color:darkgray">Status</div>
          <el-select
            v-model="taskStatus"
            placeholder="All"
            size="small"
            style="width: 150px;margin-left: 15px;"
            clearable
            @change="onStatusChange"
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
          <el-table :data="authorTasksForTabel" stripe style="width: 100%">
            <el-table-column label="id" width="120">
              <template #default="scope">#{{ scope.row.issue_id }}</template>
            </el-table-column>
            <el-table-column label="Price" width="140">
              <template #default="scope">{{ scope.row.pay }} DOT</template>
            </el-table-column>
            <el-table-column prop="title" label="Title" width="140" />
            <el-table-column prop="describe" label="Description" width="140" />
            <el-table-column prop="status" label="Status" />
            <el-table-column prop="developer.login" label="Developer" width="120" />
            <el-table-column prop="task_url" label="Link">
              <template #default="scope">
                <el-icon size="25" color="#6667AB" @click="gotoTaskUrl(scope.row.task_url)">
                  <Link />
                </el-icon>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="main-card-dev" v-else>
        <div class="menu-bar">
          <div style="font-weight: 600;">Tasks</div>
          <div style="margin-left: 20px;color:darkgray">Status</div>
          <el-select
            v-model="taskStatus"
            placeholder="All"
            size="small"
            style="width: 150px;margin-left: 15px;"
            clearable
            @change="onStatusChange"
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
          <el-table :data="authorTasksForTabel" stripe style="width: 100%">
            <el-table-column label="id" width="120">
              <template #default="scope">#{{ scope.row.issue_id }}</template>
            </el-table-column>
            <el-table-column label="Price" width="140">
              <template #default="scope">{{ scope.row.pay }} DOT</template>
            </el-table-column>
            <el-table-column prop="title" label="Title" width="140" />
            <el-table-column prop="describe" label="Description" width="140" />
            <el-table-column prop="status" label="Status" />
            <el-table-column prop="developer.login" label="Developer" width="120" />
            <el-table-column prop="task_url" label="Link">
              <template #default="scope">
                <el-icon size="25" color="#6667AB" @click="gotoTaskUrl(scope.row.task_url)">
                  <Link />
                </el-icon>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
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
  .dev-pane {
    @include flex-row-center;
    text-align: center;
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
    margin-top: 20px;
  }
}
.main-card-dev {
  margin: 85px 0 0 25px;
  .menu-bar {
    display: flex;
    align-items: flex-end;
    width: 100%;
  }
  .task-table {
    margin-top: 20px;
  }
}
</style>
