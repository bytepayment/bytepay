<script lang="ts" setup>
import { Blockchain } from '@/api/Api'
import { rules, Withdraw } from '@/views/settings/Withdraw'

const {formData, formRef, availableBalance, formIsLoading, formSubmit, fillInWithOneClick} = new Withdraw()
</script>

<template>
<div>
    <h1>Withdraw</h1>
    <el-divider></el-divider>
    <div class="form-container">
        <el-form :ref="el => formRef = el as any " v-loading="formIsLoading" :model="formData" :rules="rules" label-suffix=":">
            <el-form-item label="Address" label-width="180px" prop="address">
                <el-input v-model="formData.address" clearable style="width: 500px;" />
            </el-form-item>
            <el-form-item label="Token" label-width="180px" prop="cm">
                <el-select v-model="formData.cm" placeholder="">
                    <el-option :value="Blockchain.POLKA" label="DOT" />
                    <el-option :value="Blockchain.ACALA" label="ACA" />
                    <el-option :value="Blockchain.NEAR" label="Near" />
                </el-select>
            </el-form-item>
            <el-form-item label="Amount" label-width="180px" prop="amount">
                <el-input v-model="formData.amount" type="number" />
                <div class="balance-reminder">
                    <span>Balance: {{ availableBalance }}</span>
                    <el-button @click="fillInWithOneClick">fill in with one click</el-button>
                </div>
            </el-form-item>
            <el-form-item label="Password" label-width="180px" prop="password">
                <el-input v-model="formData.password" clearable style="width: 500px;" type="password" />
            </el-form-item>
        </el-form>
        <el-button class="bind-btn" type="primary" @click="formSubmit">Withdraw</el-button>
    </div>
</div>
</template>

<style lang="sass" scoped>
.form-container
  margin-top: 50px
  display: flex
  flex-direction: column
  justify-content: space-between
  align-items: center
  height: 200px

  .bind-btn
    width: 300px

  .balance-reminder
    padding-top: 15px

  .balance-reminder > span
    margin-right: 15px
</style>
