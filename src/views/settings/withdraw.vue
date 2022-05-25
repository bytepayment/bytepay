<script lang="ts" setup>
import { Api } from '@/api/Api'
import type { ElForm } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Md5 } from 'ts-md5/dist/md5'
import { reactive, ref } from 'vue'
import { useStore } from 'vuex'

const user = useStore().state.user
const ruleFormRef = ref<InstanceType<typeof ElForm>>()
const withdrawForm = reactive({
    address: '',
    password: '',
    amount: 0,
    cm: '',
})
const rules = {
    address: [{type: 'string', required: true, trigger: 'blur', message: 'Please input polka address you want to withdraw'}, {
        min: 40,
        max: 50,
        message: 'length should be 40 to 50',
    }],
    amount: [{trigger: 'blur', required: true}],
    cm: [{trigger: 'blur', required: true}],
    password: [{type: 'string', required: true, trigger: 'blur', message: 'Please input password you had set or set a password first'}, {
        min: 6,
        max: 16,
        message: 'length should be 6 to 16',
    }],
}

async function withdraw() {
    const {address, amount, cm} = withdrawForm
    const password = Md5.hashStr(withdrawForm.password)
    Api.withdraw({amount, address, password, cm})
        .then(res => {
            console.debug('withdraw success: ', res)
            ElMessage.success('success')
        })
        .catch(err => {
            console.debug(err)
            ElMessage.error('ERROR:' + err?.msg)
        })
}
</script>

<template>
<div>
    <h1>Withdraw</h1>
    <el-divider></el-divider>
    <div class="form-container">
        <el-form ref="ruleFormRef" :model="withdrawForm" :rules="rules" class="demo-form-inline">
            <el-form-item label="Address" label-width="180px" prop="address">
                <el-input v-model="withdrawForm.address" clearable style="width: 500px;" />
            </el-form-item>
            <el-form-item label="Amount:" label-width="180px" prop="amount">
                <el-input v-model="withdrawForm.amount" style="width: 500px;" type="number" />
            </el-form-item>
            <el-form-item label="Token:" label-width="180px" prop="cm">
                <el-select v-model="withdrawForm.cm" placeholder="">
                    <el-option :label="'DOT'" value="DOT"></el-option>
                    <el-option :label="'ACA'" value="ACA"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="Password:" label-width="180px" prop="password">
                <el-input
                        v-model="withdrawForm.password"
                        clearable
                        style="width: 500px;"
                        type="password"
                />
            </el-form-item>
        </el-form>
        <el-button class="bind-btn" type="primary" @click="withdraw">Withdraw</el-button>
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
