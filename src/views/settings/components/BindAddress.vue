<script lang="ts" setup>
import { Api, Blockchain } from '@/api/Api'
import { get_user_info } from '@/api/user'
import { FormValidationRules } from '@/env'
import { getToken } from '@/utils/auth'
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'

const props = defineProps<{
    chain: Blockchain,
    bindingTips?: string
}>()

const formRef = ref({} as any)
const formData = reactive({address: ''})
const formRule: FormValidationRules<any> = {
    address: [{required: true, type: 'string'}],
}
const bindAddress = ref<string>()

const submit = () => {
    Api.accountBind({chain: props.chain, address: formData.address})
        .then(() => {
            ElMessage.success('Bind Success')
            refreshUserInfo()
        })
        .catch(err => {
            console.log(err)
            ElMessage.error(err?.message || err || 'ERROR')
        })
}

const refreshUserInfo = () => {
    get_user_info(getToken() as any)
        .then(userInfo => {
            console.debug('用户信息??', userInfo, `own_${ props.chain }_address`)
            bindAddress.value = userInfo[`own_${ props.chain }_address`]
        })
}

refreshUserInfo()
</script>

<template>
<div>
    <h1>
        <slot name="title">Account</slot>
    </h1>
    <el-divider />
    <div>
        <slot name="body">
            <span>
                <strong>Notice: Just For Developer</strong>
            </span>
            <p>When you authorized your github account to Crypto Pay Lab, we will generate an Polka Account by default, you can withdraw the dot you eraned anytime.</p>
            <p>Also We support bind your own account here, after you finished task, author will pay into your own account directly.</p>
        </slot>
    </div>
    <el-divider />
    <div v-if="bindAddress" class="own-address-container">
        <span>
            <strong>{{ bindingTips || 'Your own address have alreay binded' }}</strong>
        </span>
        <span class="address-text">{{ bindAddress }}</span>
    </div>
    <div class="form-container">
        <el-form ref="formRef" :inline="true" :model="formData" :rules="formRule" class="demo-form-inline">
            <el-form-item label="Polka Account:">
                <el-input v-model="formData.address" clearable style="width: 500px;" />
            </el-form-item>
        </el-form>
        <el-button class="bind-btn" type="primary" @click="submit">Bind</el-button>
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
