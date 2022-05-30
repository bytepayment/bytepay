<script lang="ts" setup>
import QrcodeVue from 'qrcode.vue'
import { ref } from 'vue'
import { SUBSCAN_BASE_URL, useProperties } from '@/views/properties/useProperties'
import acalaImgUrl from '@/assets/acalaImg.png'
import remainUrl from '@/assets/jiaoyishuju.png'
import nearImgUrl from '@/assets/nearimg.png'

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
const{
    acalaAddress,
    polkaAddress,
    nearaAddress
    
}= useProperties()

const currentIndex = ref(0);

</script>

<template>
<el-button color="#6667AB" style="color: white; margin-right: 15px" @click="isShow = true">Recharge</el-button>

<el-dialog v-model="isShow" center title="Recharge" width="352px">
    <div class="icon">
    <div @click="currentIndex=0" style="cursor:pointer;" ><img class="img" src="@/assets/acalaImg.png" alt=""></div>
    <div @click="currentIndex=1" style="cursor:pointer;;margin-left: 20px;"><img class="img" src="@/assets/jiaoyishuju.png" alt=""></div>
    <div @click="currentIndex=2" style="cursor:pointer;;margin-left: 20px;"><img class="img" src="@/assets/nearimg.png" alt=""></div>
    </div>
 

    <div class="recharge-dialog" >
        <div class="code" v-show="currentIndex==0" >
            <div style="margin-bottom: 10px;" >ACA</div>
            <qrcode-vue  :size="300" :value="acalaAddress" level="H" />
        </div>
         <div class="code" v-show="currentIndex==1">
            <div style="margin-bottom: 10px;" >DOT</div>
            <qrcode-vue :size="300" :value="polkaAddress" level="H" />
        </div>
         <div class="code" v-show="currentIndex==2">
            <div style="margin-bottom: 10px;" >Near</div>
            <qrcode-vue :size="300" :value="nearaAddress" level="H" />
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
