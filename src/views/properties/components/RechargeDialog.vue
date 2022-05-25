<script lang="ts" setup>
import QrcodeVue from 'qrcode.vue'
import { ref } from 'vue'

/**
 * RechargeDialog
 * @date 2022-05-19 下午 01:07
 * @@author DNN
 **/
defineProps<{
    list: Array<{
        address: string,
        unit: string
    }>
}>()

const isShow = ref(false)

</script>

<template>
<el-button color="#6667AB" style="color: white; margin-right: 15px" @click="isShow = true">Recharge</el-button>

<el-dialog v-model="isShow" center title="Recharge" width="60%">
    <div class="recharge-dialog">
        <div v-for="item in list">
            <div class="recharge-title">{{ item.unit }}</div>
            <qrcode-vue :size="300" :value="item.address" level="H" />
        </div>
    </div>
    <template #footer>
        <span class="dialog-footer">
            <el-button @click="isShow = false">Cancel</el-button>
            <el-button type="primary" @click="isShow = false">Confirm</el-button>
        </span>
    </template>
</el-dialog>
</template>
