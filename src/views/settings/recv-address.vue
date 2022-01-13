<script lang="ts" setup>
import { reactive, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { bind_own_polka_address } from '@/api/user'
import { CPIUser } from '@/entity'
const user: CPIUser = useStore().state.user
// =============== Datas ===============
// =============== Functions ===============
// =============== Hooks ===============
const addressForm = reactive({
  address: ''
})

async function bindAddress() {
  const r = await bind_own_polka_address(addressForm.address)
  if (r.error != 0) {
    return ElMessage({ type: 'error', message: r.error_msg, center: true, showClose: true })
  }
  ElMessage({ type: 'success', message: 'Bind Success', center: true, showClose: true })
}
</script>

<template>
  <div>
    <h1>Polka Account</h1>
    <el-divider></el-divider>
    <div>
      <span>
        <strong>Notice: Just For Developer</strong>
      </span>
      <p>When you authorized your github account to Crypto Pay Lab, we will generate an Polka Account by default, you can withdraw the dot you eraned anytime.</p>
      <p>Also We support bind your own account here, after you finished task, author will pay into your own account directly.</p>
    </div>
    <el-divider></el-divider>

    <div class="form-container">
      <el-form :inline="true" :model="addressForm" class="demo-form-inline">
        <el-form-item label="Polka Account:">
          <el-input v-model="addressForm.address" clearable style="width: 500px;"></el-input>
        </el-form-item>
      </el-form>
      <el-button type="primary" class="bind-btn" @click="bindAddress">Bind</el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.form-container {
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 200px;
  .bind-btn {
    width: 300px;
  }
}
</style>