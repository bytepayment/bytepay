<script lang="ts" setup>
import acalaImgUrl from '@/assets/acalaImg.png'
import remainUrl from '@/assets/jiaoyishuju.png'
import nearImgUrl from '@/assets/nearimg.png'
import AccountInfo from '@/views/properties/components/AccountInfo.vue'
import RechargeDialog from '@/views/properties/components/RechargeDialog.vue'
import { SUBSCAN_BASE_URL, useProperties } from '@/views/properties/useProperties'
import TransactionRecords from './components/TransactionRecords.vue'
import TransactionRecordsnear from './components/TransactionRecordsnear.vue'

const {
    acalaAddress,
    acalaBalance,
    acalaRecordIsLoading,
    accountIsLoading,
    gotoWithdraw,
    polkaAddress,
    polkaBalance,
    polkaRecordIsLoading,
    recordData,
    nearaAddress,
    nearaBalance,
    nearRecordIsLoading
 
} = useProperties()

console.log(recordData.near,'这个是什么')


</script>

<template>
<div class="main">
    <!-- Line 1 -->
    <el-row class="accounts-brief">
        <el-col :span="6">My Accounts</el-col>
        <el-col :span="12"></el-col>
        <el-col :span="6" class="buttons">
            <RechargeDialog :list="[
                { address: acalaAddress, unit: 'ACA' },
                { address: polkaAddress, unit: 'DOT' },
                { address: nearaAddress, unit: 'Near' },
            ]" />
            <el-button @click="gotoWithdraw">Withdraw</el-button>
        </el-col>
    </el-row>

    <!-- 账户信息卡片 -->
    <AccountInfo v-loading="accountIsLoading" :address="polkaAddress" :balance="polkaBalance" :logo="remainUrl" unit="DOT" />
    <AccountInfo v-loading="accountIsLoading" :address="acalaAddress" :balance="acalaBalance" :logo="acalaImgUrl" unit="ACA" />
    <AccountInfo v-loading="accountIsLoading" :address="nearaAddress" :balance="nearaBalance" :logo="nearImgUrl" unit="Near" />

    <!-- 交易记录 -->
    <el-row class="txs-text">
        <el-col :span="6" class="title">Transaction Records</el-col>
        <el-col :span="6" class="info">
            <span>List 10 recent transfers,
                <a :href="`${SUBSCAN_BASE_URL}/account/${acalaAddress}`" target="_blank">more</a>
            </span>
        </el-col>
        <el-col :span="12"></el-col>
    </el-row>

    <!-- Line 4 txs -->
    <el-tabs class="demo-tabs" style="margin-top:20px" type="border-card">
        <el-tab-pane label="Dot Transaction Records">
            <TransactionRecords v-loading="polkaRecordIsLoading" :address="polkaAddress" :list="recordData.polka?.transfers" :platform="'DOT'" />
        </el-tab-pane>
        <el-tab-pane label="ACA Transaction Records">
            <TransactionRecords v-loading="acalaRecordIsLoading" :address="acalaAddress" :list="recordData.acala?.transfers" :platform="'ACA'" />
        </el-tab-pane>
         <el-tab-pane label="Near Transaction Records">
            <TransactionRecordsnear v-loading="nearRecordIsLoading" :address="nearaAddress" :list="recordData.near?.transfers" :platform="'Near'" />
        </el-tab-pane>
    </el-tabs>

</div>
</template>

<style lang="scss">
.main {
  display: flex;
  flex-direction: column;

  .accounts-brief {
    margin-top: 20px;
    display: flex;
    align-items: center;
    font-weight: 600;
    font-size: 22px;

    .buttons {
      display: flex;
      justify-content: flex-end;
    }
  }

  .remain-card {
    margin-top: 15px;
    height: 120px;
    display: flex;
    align-items: center;

    .column-one {
      margin-left: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      font-weight: 600;
      font-size: 22px;
      height: 100px;
    }

    .column-two {
      margin-left: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      height: 100px;
      color: #b7b8b7;
    }
  }

  .txs-text {
    margin-top: 20px;
    display: flex;
    align-items: center;

    .title {
      font-weight: 600;
      font-size: 22px;
    }

    .info {
      color: #b7b8b7;
    }
  }

  .txs {
    margin-top: 15px;

    .hash {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .recharge-dialog {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .recharge-title {
      font-size: 28px;
      font-weight: 700;
      color: black;
      margin: 0 0 0 110px;
    }

    .address {
      margin-top: 20px;
    }
  }

}
</style>
