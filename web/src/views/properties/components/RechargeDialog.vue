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
const current = ref<'ACA' | 'DOT' | 'Near' | string>('ACA')

</script>

<template>
<el-button color="#6667AB" style="color: white; margin-right: 15px" @click="isShow = true">Recharge</el-button>

<el-dialog v-model="isShow" center title="Recharge" width="352px">
    <div class="icon">
        <div style="cursor:pointer;" @click="current = 'ACA' ">
            <img alt="" class="img" src="@/assets/acalaImg.png">
        </div>
        <div style="cursor:pointer;;margin-left: 20px;" @click="current = 'DOT' ">
            <img alt="" class="img" src="@/assets/jiaoyishuju.png">
        </div>
        <div style="cursor:pointer;;margin-left: 20px;" @click="current = 'Near' ">
            <img alt="" class="img" src="@/assets/nearimg.png">
        </div>
    </div>
    <div class="recharge-dialog">
        <div v-for="item in list" v-show="current === item.unit" class="code">
            <div style="margin-bottom: 10px;">{{ item.unit }}</div>
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

<style lang="scss">
.icon{
    display: flex;
    justify-content: center;
    margin-bottom: 30px;
    .img{
        width: 40px;
        height: 40px;
    }
}
.code{
    width: 330px;
    height: 330px;
    text-align: center;
    color: #000;
    font-size: 25px;
}

</style>
