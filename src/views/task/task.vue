<script lang="ts" setup>
import { onBeforeMount, ref, Ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { Link } from '@element-plus/icons-vue'
import { BindedGithubRepo, DotpayTask, GithubUser } from '@/entity'
import { get_binded_repos, get_tasks, get_dev_tasks, goto_task_page } from '@/api/user'
import Router from '@/router'
// =============== Datas ===============
const user: GithubUser = useStore().state.user
const binded_repos: Ref<BindedGithubRepo[]> = ref([])
const dev_repos: Ref<BindedGithubRepo[]> = ref([])
const activeTabIndex = ref('0')
const activeAuthorRepoIndex = ref(0)
const activeDevRepoIndex = ref(0)
const taskAuthorStatus = ref('')
const taskDevStatus = ref('')
const statusOptions = ref([
  { label: 'Created', value: 'created' },
  { label: 'Applied', value: 'applied' },
  { label: 'Paid', value: 'paid' },
  { label: 'Closed', value: 'closed' },
  { label: 'Closed-Without-Pay', value: 'closed-without-pay' },
])
const authorTasks: Ref<DotpayTask[]> = ref([])
const authorTasksForTabel: Ref<DotpayTask[]> = ref([])
const devTasks: Ref<DotpayTask[]> = ref([])
const devTasksForTabel: Ref<DotpayTask[]> = ref([])
// =============== Functions ===============
function gotoBindPage() {
  Router.replace('/bind')
}
function gotoTaskUrl(url: string) {
  window.open(url)
}
async function onAuthorRepoChanged() {
  if (typeof activeAuthorRepoIndex.value !== 'number') {
    return
  }
  const selectedRepo = binded_repos.value[activeAuthorRepoIndex.value]
  authorTasks.value = await get_tasks(selectedRepo.repo_id)
  authorTasksForTabel.value = authorTasks.value
}
async function onDevRepoChanged() {
  if (typeof activeDevRepoIndex.value !== 'number') {
    return
  }
  const selectedRepo = dev_repos.value[activeDevRepoIndex.value]
  devTasksForTabel.value = devTasks.value.filter(item => item.repo_id === selectedRepo.repo_id)
}
function onAuthorStatusChange(val: any) {
  if (!val) return authorTasksForTabel.value = authorTasks.value
  authorTasksForTabel.value = authorTasks.value.filter(i => i.status === val)
}
function onDevStatusChange(val: any) {
  if (!val) return devTasksForTabel.value = devTasks.value
  devTasksForTabel.value = devTasks.value.filter(i => i.status === val)
}

// =============== Hooks ===============
onBeforeMount(async () => {
  // Check if user is first time enter into this page
  if (!user.gotoTaskPageTimes || user.gotoTaskPageTimes == 0) {
    ElMessage({
      message: "Seems your are first time enter into this page, try active a repo first",
      type: 'warning',
    })
    setTimeout(() => {
      gotoBindPage()
    }, 2000)
  }
  await goto_task_page()
  const r = await get_binded_repos()
  binded_repos.value = r
  // Get Author Tasks
  await onAuthorRepoChanged()
  // Get Devloper Tasks
  devTasks.value = await get_dev_tasks(user.id)
  devTasksForTabel.value = devTasks.value
  // Dev tasks array to map
  let obj: any = {}
  devTasks.value.forEach(task => {
    if (!obj.hasOwnProperty(task.repo_id)) {
      obj[task.repo_id] = 'flag'
      dev_repos.value.push({
        owner_id: 1,
        owner_name: '',
        repo_id: task.repo_id,
        repo_name: task.repo_name,
        meta: {
          id: task.repo_id,
          name: task.repo_name,
          owner: task?.repository?.owner || '',
          full_name: task.repo_name,
          description: task.repo_description,
          isBinded: false,
          loading: false,
        },
      })
    }
  })
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
        <el-tabs class="tabs" v-model="activeTabIndex" :stretch="true" type="border-card">
          <!-- Author -->
          <el-tab-pane label="My Repo" class="repo-list">
            <el-collapse v-model="activeAuthorRepoIndex" accordion @change="onAuthorRepoChanged()">
              <el-collapse-item
                v-for="(item, index) in binded_repos"
                :key="index"
                :title="item.repo_name"
                :name="index"
              >
                <div>{{ item?.meta?.description || 'Your repo have no description 😳 ' }}</div>
              </el-collapse-item>
            </el-collapse>
          </el-tab-pane>
          <!-- Developer -->
          <el-tab-pane label="My Task" class="repo-list">
            <el-collapse v-model="activeDevRepoIndex" accordion @change="onDevRepoChanged()">
              <el-collapse-item
                v-for="(item, index) in dev_repos"
                :key="index"
                :title="item.repo_name"
                :name="index"
              >
                <div>{{ item?.meta?.description || 'Your repo have no description 😳 ' }}</div>
              </el-collapse-item>
            </el-collapse>
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
            v-model="taskAuthorStatus"
            placeholder="All"
            size="small"
            style="width: 150px;margin-left: 15px;"
            clearable
            @change="onAuthorStatusChange"
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
            v-model="taskDevStatus"
            placeholder="All"
            size="small"
            style="width: 150px;margin-left: 15px;"
            clearable
            @change="onDevStatusChange"
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
          <el-table :data="devTasksForTabel" stripe style="width: 100%">
            <el-table-column label="id" width="120">
              <template #default="scope">#{{ scope.row.issue_id }}</template>
            </el-table-column>
            <el-table-column label="Price" width="140">
              <template #default="scope">{{ scope.row.pay }} DOT</template>
            </el-table-column>
            <el-table-column prop="title" label="Title" width="140" />
            <el-table-column prop="describe" label="Description" width="140" />
            <el-table-column prop="status" label="Status" />
            <el-table-column prop="author.login" label="Author" width="120" />
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
