<script lang="ts" setup>
import { Copy } from '@/views/properties/useProperties'
import { DocumentCopy } from '@element-plus/icons-vue'

/**
 * AccountInfo
 * @date 2022-05-19 下午 12:21
 * @@author DNN
 **/
defineProps<{
    address: string,
    balance: object,
    unit: string,
    logo: string
}>()

</script>

<template>
<el-card class="account-info">
    <div class="remain-card">
        <!-- logo -->
        <div class="logo">
            <el-image :src="logo" fit="fill"></el-image>
        </div>
        <div class="column-one">
            <span>Free</span>
            <span>{{ balance.free ?? 0 }} {{unit}}</span>
        </div>
        <div class="column-two">
            <div :data-clipboard-text="address" class="address">{{ address }}
                <el-icon @click="Copy('address')">
                    <document-copy />
                </el-icon>
            </div>
            <div class="detail">
                <span>Reserved:</span>
                <span>{{ balance.reserved ?? 0 }} {{ unit }}</span>
                <span class="label">MiscFrozen:</span>
                <span>{{ balance.miscFrozen ?? 0 }} {{ unit }}</span>
                <span class="label">FeeFrozen:</span>
                <span>{{ balance.feeFrozen ?? 0 }} {{ unit }}</span>
            </div>
        </div>
    </div>
</el-card>
</template>

<style lang="sass" scoped>
.account-info
  margin-top: 15px

  .logo
    width: 100px
    height: 100px
    margin-left: 20px

  .label
    margin-left: 25px

</style>
