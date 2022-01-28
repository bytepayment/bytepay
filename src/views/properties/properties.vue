<script lang="ts" setup>
import { onBeforeMount, ref, reactive } from 'vue'
import { DocumentCopy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import Clipboard from 'clipboard'
import moment from 'moment'
import QrcodeVue from 'qrcode.vue'
import remainUrl from '@/assets/jiaoyishuju.png'
import { get_polkadot_keyring, get_polka_account_info, get_polkadot_tx_record } from '@/api/user'
import Router from '@/router'
const subscanBaseUrl = import.meta.env.VITE_SUBSCAN_BASE_URL
const address = ref('')
const centerDialogVisible = ref(false)
const txs = ref([])
const txsCount = ref(0)
const account = reactive({
  data: {
    free: 0.0,
    reserved: 0.0,
    miscFrozen: 0.0,
    feeFrozen: 0.0
  }
})
onBeforeMount(async () => {
  // Get Polka Address
  const r = await get_polkadot_keyring()
  if (r.error !== 0) return
  address.value = r.data.address
  // Get Polka Account Balance
  const ar = await get_polka_account_info()
  if (ar.error !== 0) return
  account.data = ar.data
  // Get Polka Account Transfers
  const transferResult = await get_polkadot_tx_record()
  if (transferResult.error !== 0) {
    ElMessage({ type: 'error', message: transferResult.error_msg })
  }
  txs.value = transferResult.data.transfers
  txsCount.value = transferResult.data.count
})
function copy_address(className: string) {
  console.log('copy', address.value)
  const clipboard = new Clipboard('.' + className)
  clipboard.on('success', (e) => {
    ElMessage({
      type: 'success',
      message: 'Copied!',
    })
    clipboard.destroy()
  })
  clipboard.on('error', (e) => {
    console.log(e)
  })
}
function gotoWithdraw() {
  Router.push('/settings/withdraw')
}
function addressFormat(address: string) {
  return address.substring(0, 7) + '...' + address.substring(address.length - 5, address.length)
}
function dotFormat(dot: number) {
  return dot.toFixed(2)
}
</script>

<template>
  <div class="main">
    <!-- Line 1 -->
    <el-row class="accounts-brief">
      <el-col :span="6">My Accounts</el-col>
      <el-col :span="12"></el-col>
      <el-col :span="6" class="buttons">
        <el-button color="#6667AB" style="color: white" @click="centerDialogVisible = true">Recharge</el-button>
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
          <span>{{ account.data.free?.toFixed(2) }} DOT</span>
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
            <span>{{ account.data.reserved }} DOT</span>
            <span style="margin-left: 25px;">MiscFrozen:</span>
            <span>{{ account.data.miscFrozen }} DOT</span>
            <span style="margin-left: 25px;">FeeFrozen:</span>
            <span>{{ account.data.feeFrozen }} DOT</span>
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
          <a
            :href="`${subscanBaseUrl}/account/${address}`"
            target="_blank"
          >more</a>
        </span>
      </el-col>
      <el-col :span="12"></el-col>
    </el-row>
    <!-- Line 4 txs -->
    <el-card class="txs">
      <el-table :data="txs" stripe style="width: 100%" height="450">
        <el-table-column prop="extrinsic_index" label="Extrinsic Index" width="150" />
        <el-table-column prop="block_num" label="Block" width="120" />
        <el-table-column prop="block_timestamp" label="Time" width="140">
          <template #default="scope">{{ moment.unix(scope.row.block_timestamp).fromNow() }}</template>
        </el-table-column>
        <el-table-column label="From">
          <template #default="scope">
            <a
              v-if="scope.row.from !== address"
              :href="`${subscanBaseUrl}/account/${scope.row.from}`"
              target="_blank"
            >{{ addressFormat(scope.row.from) }}</a>
            <span v-else>{{ addressFormat(scope.row.from) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="To">
          <template #default="scope">
            <a
              v-if="scope.row.to !== address"
              :href="`${subscanBaseUrl}/account/${scope.row.to}`"
              target="_blank"
            >{{ addressFormat(scope.row.to) }}</a>
            <span v-else>{{ addressFormat(scope.row.to) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Status" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.success" type="success">Success</el-tag>
            <el-tag v-else type="danger">Failed</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Amount" width="120">
          <template #default="scope">{{ scope.row.amount }} DOT</template>
        </el-table-column>
        <el-table-column label="Hash">
          <template #default="scope">
            <a
              :href="`${subscanBaseUrl}/extrinsic/${scope.row.hash}`"
              target="_blank"
            >{{ addressFormat(scope.row.hash) }}</a>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- QR Code -->
    <el-dialog v-model="centerDialogVisible" title="Recharge" width="40%" center>
      <div class="recharge-dialog">
        <qrcode-vue :value="address" :size="300" level="H" />
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="centerDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="centerDialogVisible = false">Confirm</el-button>
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
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .address {
      margin-top: 20px;
    }
  }
}
</style>
