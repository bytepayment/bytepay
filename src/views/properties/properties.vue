<script lang="ts" setup>
import { onBeforeMount, ref, reactive } from 'vue'
import { DocumentCopy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import Clipboard from 'clipboard'
import QrcodeVue from 'qrcode.vue'
import remainUrl from '@/assets/jiaoyishuju.png'
import acalaImgUrl from '@/assets/acalaImg.png'
import { get_polkadot_keyring, get_polka_account_info, get_polkadot_tx_record, get_acala_tx_record} from '@/api/user'
import Router from '@/router'
import TransactionRecords from './components/TransactionRecords.vue'
const subscanBaseUrl = import.meta.env.VITE_SUBSCAN_BASE_URL
const address = ref('')
const centerDialogVisible = ref(false)
const txs = ref([])
const txsCount = ref(0)
const acalaTxs = ref([])
const AUSDaddress = ref('')
const account = ref();
onBeforeMount(async () => {
  // Get Polka Address
  const r = await get_polkadot_keyring();
  if (r.error !== 0) return;
  address.value = r.data.polka.address;
  AUSDaddress.value = r.data.acala.address;
  console.log(r.data, "啥地址");

  // Get Polka Account Balance
  const ar = await get_polka_account_info();
  if (ar.error !== 0) return;
  account.value = ar.data;

  console.log('账户',ar.data)
  // Get Polka Account Transfers
  const transferResult = await get_polkadot_tx_record();
  if (transferResult.error !== 0) {
    ElMessage({ type: "error", message: transferResult.error_msg });
  }
  txs.value = transferResult.data.transfers
  txsCount.value = transferResult.data.count

  const acalaTransferResult = await get_acala_tx_record() 
  console.log('交易记录-acala',acalaTransferResult);
  
  acalaTxs.value = acalaTransferResult.data.transfers
})
function copy_address(className: string) {
  const clipboard = new Clipboard("." + className);
  clipboard.on("success", (e) => {
    ElMessage({
      type: "success",
      message: "Copied!",
    });
    clipboard.destroy();
  });
  clipboard.on("error", (e) => {
    console.log(e);
  });
}
function gotoWithdraw() {
  Router.push("/settings/withdraw");
}
function dotFormat(dot: number) {
  return dot.toFixed(2);
}
</script>

<template>
  <div class="main">
    <!-- Line 1 -->
    <el-row class="accounts-brief">
      <el-col :span="6">My Accounts</el-col>
      <el-col :span="12"></el-col>
      <el-col :span="6" class="buttons">
        <el-button
          color="#6667AB"
          style="color: white"
          @click="centerDialogVisible = true"
          >Recharge</el-button
        >
        <el-button @click="gotoWithdraw">Withdraw</el-button>
      </el-col>
    </el-row>
    <!-- Line 2 remain card -->
    <el-card style="margin-top: 15px">
      <div class="remain-card">
        <!-- logo -->
        <div style="width: 100px; height: 100px; margin-left: 20px">
          <el-image :src="remainUrl" fit="fill"></el-image>
        </div>
        <div class="column-one">
          <span>Free</span>
          <span>{{ account?.polka.free?.toFixed(2) }} DOT</span>
        </div>
        <div class="column-two">
          <div class="address" :data-clipboard-text="address">
            {{ address }}
            <el-icon @click="copy_address('address')">
              <document-copy />
            </el-icon>
          </div>
          <div class="detail">
            <span>Reserved:</span>
            <span>{{ account?.polka.reserved ?? 0 }} DOT</span>
            <span style="margin-left: 25px">MiscFrozen:</span>
            <span>{{ account?.polka.miscFrozen ?? 0 }} DOT</span>
            <span style="margin-left: 25px">FeeFrozen:</span>
            <span>{{ account?.polka.feeFrozen ?? 0 }} DOT</span>
          </div>
        </div>
      </div>
    </el-card>

    <el-card style="margin-top: 15px">
      <div class="remain-card">
        <!-- logo -->
        <div style="width: 100px; height: 100px; margin-left: 20px">
          <el-image :src="acalaImgUrl" fit="fill" ></el-image>
        </div>
        <div class="column-one">
          <span>Free</span>
          <span>{{ account?.acala.free?.toFixed(2) }} AUSD</span>
        </div>
        <div class="column-two">
          <div class="AUSDaddress" :data-clipboard-text="AUSDaddress">
            {{ AUSDaddress }}
            <el-icon @click="copy_address('AUSDaddress')">
              <document-copy />
            </el-icon>
          </div>
          <div class="detail">
            <span>Reserved:</span>
            <span>{{ account?.acala.reserved ?? 0 }} AUSD</span>
            <!-- <span style="margin-left: 25px">MiscFrozen:</span>
            <span>{{ account?.acala.miscFrozen ?? 0 }} AUSD</span> -->
            <span style="margin-left: 25px">Frozen:</span>
            <span>{{ account?.acala.feeFrozen ?? 0 }} AUSD</span>
          </div>
        </div>
      </div>
    </el-card>
    <!-- Line 3 txs text-->
    <el-row class="txs-text">
      <el-col :span="6" class="title">Transaction Records</el-col>
      <el-col :span="6" class="info">
        <span>
          List 10 recent transfers,
          <a :href="`${subscanBaseUrl}/account/${address}`" target="_blank"
            >more</a
          >
        </span>
      </el-col>
      <el-col :span="12"></el-col>
    </el-row>
    <!-- Line 4 txs -->
    <el-tabs type="border-card" class="demo-tabs" style="margin-top:20px">
    <el-tab-pane label="Dot Transaction Records">
      <TransactionRecords :txs="txs" :address="address" :platform="'DOT'"/>
    </el-tab-pane>
    <el-tab-pane label="AUSD Transaction Records">
      <TransactionRecords :txs="acalaTxs" :address="AUSDaddress" :platform="'AUSD'"/>
    </el-tab-pane>
  </el-tabs>
    
    <!-- QR Code -->
    <el-dialog
      v-model="centerDialogVisible"
      title="Recharge"
      width="40%"
      center
    >
      <div class="recharge-dialog">
        <div>
          <div class="recharge-title">DOT</div>
          <qrcode-vue :value="address" :size="300" level="H" />
        </div>
        <div>
          <div class="recharge-title">AUSD</div>
          <qrcode-vue :value="AUSDaddress" :size="300" level="H" />
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="centerDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="centerDialogVisible = false"
            >Confirm</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
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
