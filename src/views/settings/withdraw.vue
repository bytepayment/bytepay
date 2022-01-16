<script lang="ts" setup>
import { reactive, computed, ref } from 'vue'
import { useStore } from 'vuex'
import { Md5 } from 'ts-md5/dist/md5'
import { ElMessage } from 'element-plus'
import { polkadot_withdraw } from '@/api/user'
import type { ElForm } from 'element-plus'

// =============== Datas ===============
const user = useStore().state.user
const ruleFormRef = ref<InstanceType<typeof ElForm>>()
const withdrawForm = reactive({
  address: '',
  password: '',
  amount: 0
})
const rules = reactive({
  address: [{ type: 'string', required: true, trigger: 'blur', message: 'Please input polka address you want to withdraw' }, { min: 40, max: 50, message: 'length should be 40 to 50' }],
  amount: [{ trigger: 'blur', required: true }],
  password: [{ type: 'string', required: true, trigger: 'blur', message: 'Please input password you had set or set a password first' }, { min: 6, max: 16, message: 'length should be 6 to 16' }],
})
// =============== Functions ===============
async function withdraw() {
  const r = await polkadot_withdraw(withdrawForm.address, Md5.hashStr(withdrawForm.password), withdrawForm.amount)
  if (r.error !== 0) {
    return ElMessage({ type: 'error', message: r.error_msg })
  }
  return ElMessage({ type: 'success', message: 'success' })
}
// =============== Hooks ===============
</script>

<template>
  <div>
    <h1>Withdraw</h1>
    <el-divider></el-divider>
    <div class="form-container">
      <el-form :model="withdrawForm" class="demo-form-inline" :rules="rules" ref="ruleFormRef">
        <el-form-item label="Polka Address" label-width="180px" prop="address">
          <el-input v-model="withdrawForm.address" clearable style="width: 500px;" />
        </el-form-item>
        <el-form-item label="Amount:" label-width="180px" prop="amount">
          <el-input v-model="withdrawForm.amount" style="width: 500px;" type="number" />
        </el-form-item>
        <el-form-item label="Password:" label-width="180px" prop="password">
          <el-input
            v-model="withdrawForm.password"
            clearable
            type="password"
            style="width: 500px;"
          />
        </el-form-item>
      </el-form>
      <el-button type="primary" class="bind-btn" @click="withdraw">Withdraw</el-button>
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