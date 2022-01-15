<script lang="ts" setup>
import { reactive, computed, ref } from 'vue'
import { useStore } from 'vuex'
import { Md5 } from 'ts-md5/dist/md5'
import { ElMessage } from 'element-plus'
import { set_password } from '@/api/user'
import type { ElForm } from 'element-plus'

// =============== Datas ===============
const user = useStore().state.user
const ruleFormRef = ref<InstanceType<typeof ElForm>>()
const ifSetPass = computed(() => {
  return user.isSetPass
})
const passwordForm = reactive({
  old_pass: '',
  new_pass: '',
  new_pass_again: ''
})
const rules = reactive({
  new_pass: [{ type: 'string', required: true, trigger: 'blur', message: 'Please input new password' }, { min: 6, max: 16, message: 'length should be 6 to 16.' }],
  new_pass_again: [{ validator: validatePass2, trigger: 'blur' }],
})
// =============== Functions ===============
async function setPassword() {
  let data = {
    old_pass: '',
    new_pass: Md5.hashStr(passwordForm.new_pass),
    new_pass_again: Md5.hashStr(passwordForm.new_pass_again),
  }
  if (passwordForm.old_pass) data['old_pass'] = Md5.hashStr(passwordForm.old_pass)
  console.log('set password: ', data)
  const r = await set_password(passwordForm)
  if (r.error !== 0) return ElMessage({ type: 'error', message: r.error_msg })
  ElMessage({ type: 'success', message: r.error_msg || 'success' })
}
function validatePass2(rule: any, value: any, callback: any) {
  if (value === '') {
    callback(new Error('Please input the password again'))
  } else if (value !== passwordForm.new_pass) {
    callback(new Error("Two inputs don't match!"))
  } else {
    callback()
  }
}
// =============== Hooks ===============
</script>

<template>
  <div>
    <h1>Password</h1>
    <el-divider></el-divider>
    <div class="form-container">
      <el-form :model="passwordForm" class="demo-form-inline" :rules="rules" ref="ruleFormRef">
        <el-form-item v-if="ifSetPass" label="Old Password:" label-width="150px" prop="old_pass">
          <el-input
            v-model="passwordForm.old_pass"
            clearable
            type="password"
            style="width: 500px;"
          />
        </el-form-item>
        <el-form-item label="New Password:" label-width="150px" prop="new_pass">
          <el-input
            v-model="passwordForm.new_pass"
            clearable
            type="password"
            style="width: 500px;"
          />
        </el-form-item>
        <el-form-item label="New Password:" label-width="150px" prop="new_pass_again">
          <el-input
            v-model="passwordForm.new_pass_again"
            clearable
            type="password"
            style="width: 500px;"
          />
        </el-form-item>
      </el-form>
      <el-button type="primary" class="bind-btn" @click="setPassword">Bind</el-button>
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