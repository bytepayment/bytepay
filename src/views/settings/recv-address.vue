<script lang="ts" setup>
import { reactive, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { bind_own_polka_address, get_user_info } from '@/api/user'
import { getToken } from '@/utils/auth'
// =============== Datas ===============
const addressForm = reactive({
  address: ''
})
const own_address = ref('')
// =============== Functions ===============
async function bindAddress() {
  const r = await bind_own_polka_address(addressForm.address)
  if (r.error !== 0) {
    return ElMessage({ type: 'error', message: r.error_msg, center: true, showClose: true })
  }
  ElMessage({ type: 'success', message: 'Bind Success', center: true, showClose: true })
}
// =============== Hooks ===============
onMounted(async () => {
  const userInfo = await get_user_info(getToken() as any)
  own_address.value = userInfo.own_polka_address
})
</script>

<template>
  <div>
    <h1>Polka Account</h1>
    <el-divider />
    <div>
      <span>
        <strong>Notice: Just For Developer</strong>
      </span>
      <p>When you authorized your github account to Crypto Pay Lab, we will generate an Polka Account by default, you can withdraw the dot you eraned anytime.</p>
      <p>Also We support bind your own account here, after you finished task, author will pay into your own account directly.</p>
    </div>
    <el-divider />
    <div v-if="own_address" class="own-address-container">
      <span>
        <strong>Your own address have alreay binded</strong>
      </span>
      <span class="address-text">{{ own_address }}</span>
    </div>
    <div class="form-container">
      <el-form :inline="true" :model="addressForm" class="demo-form-inline">
        <el-form-item label="Polka Account:">
          <el-input v-model="addressForm.address" clearable style="width: 500px;" />
        </el-form-item>
      </el-form>
      <el-button type="primary" class="bind-btn" @click="bindAddress">Bind</el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.own-address-container {
  @include flex-column-center;
  .address-text {
    margin-top: 20px;
  }
}
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