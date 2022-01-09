<script lang="ts" setup>
import { ref } from "vue";
import { DocumentCopy } from "@element-plus/icons-vue";
const value2 = ref("");
import { shortcuts } from "./constants";
import remainUrl from "../../assets/jiaoyishuju.png";
// import router from "../router";
const remain = ref(10.5);
const address = ref("asdfasdf");
const freezeAmount = ref(10.5);
const availableAmount = ref(0.0);
</script>

<template>
  <div class="main">
    <!-- Line 1 -->
    <el-row class="accounts-brief">
      <el-col :span="3"> My Accounts </el-col>
      <el-col :span="15"></el-col>
      <el-col :span="6" class="buttons">
        <el-button color="#6667AB" style="color: white">Charge</el-button>
        <el-button>Withdraw</el-button>
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
          <span>Remains</span>
          <span> {{ remain }} DOT</span>
        </div>
        <div class="column-two">
          <div class="address">
            {{ address }}
            <el-icon><document-copy /></el-icon>
          </div>
          <div class="detail">
            <span>Freeze:</span>
            <span> {{ freezeAmount }} DOT </span>
            <span> Available: </span>
            <span> {{ availableAmount }} DOT </span>
          </div>
        </div>
      </div>
    </el-card>
    <!-- Line 3 txs text-->
    <el-row class="txs-text">
      <el-col :span="4">Transaction Records</el-col>
      <el-col :span="4"
        ><el-date-picker
          v-model="value2"
          type="datetimerange"
          :shortcuts="shortcuts"
          range-separator="To"
          start-placeholder="Start date"
          end-placeholder="End date"
      /></el-col>
      <el-col :span="16"></el-col>
    </el-row>
    <!-- Line 4 txs -->
    <el-card class="txs"></el-card>
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
  }
  .txs {
    margin-top: 15px;
    height: 40vh;
  }
}
</style>
