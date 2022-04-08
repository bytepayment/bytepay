<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { cloud } from "@/api/cloud";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { DocumentCopy } from "@element-plus/icons-vue";
import {
  nft_get_bytechain_keyring,
  nft_get_bytechain_accountinfo,
} from "@/api/nft";
import {
  get_polkadot_keyring,
  get_polka_account_info,
  get_polkadot_tx_record,
  getClasses,
} from "@/api/user";
import Clipboard from "clipboard";

// =============== Datas ===============
const router = useRouter();
const tabIndex = ref(0);
const classArr: any = ref([]);
const classId = ref("");
const list: any = ref([]);
const address = ref("");
const account = reactive({
  data: {
    free: 0.0,
    reserved: 0.0,
    miscFrozen: 0.0,
    feeFrozen: 0.0,
    tokenName: "BNX",
  },
});
const tokenName = ref("BNX");

// =============== Functions ===============

onMounted(() => {
  getClass();
  getAddress();
});

async function getClass() {
  const r = await getClasses();
  classArr.value = r;
  classId.value = r[0].class_id;
  getList();
}

async function getList() {
  const r = await cloud.invokeFunction("nft_get_list", {
    classid: classId.value,
  });
  if (0 === r.code) list.value = r.data;
}

async function getAddress() {
  const r = await nft_get_bytechain_keyring();
  if (r.error !== 0) return;
  address.value = r.data.address;

  account.data = await nft_get_bytechain_accountinfo(address.value);
  tokenName.value = account.data.tokenName;
}

function copy_address(className: string) {
  const clipboard = new Clipboard("." + className);
  clipboard.on("success", (e) => {
    ElMessage({
      type: "success",
      message: "Copied!",
    });
    clipboard.destroy();
  });
  clipboard.on("error", (e) => { });
}

function switchTab(index: number) {
  tabIndex.value = index;
  classId.value = classArr.value[index].class_id;
  getList();
}

function gotoPage(url: string, name: string, classid: string) {
  router.push({
    path: url,
    query: {
      name: name,
      classid: classid,
    },
  });
}
</script>

<template>
  <el-card style="margin-top: 50px;margin-bottom: 20px;">
    <div class="top">
      <div class="column-two">
        <div class="address" :data-clipboard-text="address">
          {{ address }}
          <el-icon @click="copy_address('address')">
            <document-copy />
          </el-icon>
        </div>
        <div class="detail">
          <span>Free:</span>
          <span style="color: black;"> <span style="margin-right: 10px;">{{ account.data.free }}</span>{{ tokenName }}</span>
          <span style="margin-left: 25px; margin-right: 10px;">Reserved:</span>
          <span>{{ account.data.reserved }}{{ tokenName }}</span>
          <span style="margin-left: 25px; margin-right: 10px;">MiscFrozen:</span>
          <span>{{ account.data.miscFrozen }} {{ tokenName }}</span>
          <span style="margin-left: 25px; margin-right: 10px;">FeeFrozen:</span>
          <span>{{ account.data.feeFrozen }}{{ tokenName }}</span>
        </div>
      </div>

      <div @click="gotoPage('/publish', '', '')" class="button">publish</div>
    </div>
  </el-card>
  <el-card style="margin-bottom: 20px;">
    <div class="classify">
      <div
        v-for="(item, index) in classArr"
        @click="switchTab(index)"
        :key="index"
        :class="[tabIndex == index ? 'optioned' : 'className']"
      >{{ item.meta.name }}</div>
    </div>
    <div class="content">
      <div
        @click="gotoPage('/detail', item.project, item.classid)"
        v-for="(item, index) in list"
        class="item"
      >
        <div class="name"><span class="label">Title:</span> {{ item.title }}</div>
        <div class="name"><span class="label">Project:</span> {{ item.project }}</div>
        <div class="name"><span class="label">Version:</span> {{ item.version }}</div>
        <div class="name"><span class="label">Owner:</span> {{ item.owner }}</div>
        <div class="name"><span class="label">Left:</span> {{ item.left_amount }}</div>
        <div class="name"><span class="label">Price:</span> {{ item.price }}</div>
      </div>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.top {
  display: flex;
  .column-two {
    width: 80%;
    margin: 0 0 0 3%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    height: 100px;
    color: #b7b8b7;
  }
  .button {
    width: 80px;
    height: 30px;
    text-align: center;
    line-height: 30px;
    color: #ffffff;
    background-color: #6667ab;
    border-radius: 5px;
    cursor: pointer;
    margin: 30px 0 0 0;
  }
}
.classify {
  display: flex;
  justify-content: space-around;
  width: 100%;
  height: 80px;
  margin: 0px 0 0 0;
  .className {
    max-width: 80px;
    height: 30px;
    color: black;
    text-align: center;
    line-height: 35px;
    font-weight: bold;
    cursor: pointer;
  }
  .optioned {
    max-width: 80px;
    height: 30px;
    color: #6667ab;
    text-align: center;
    line-height: 37px;
    font-weight: bold;
    border-bottom: 3px solid #6667ab;
    cursor: pointer;
  }
}
.content {
  display: flex;
  flex-wrap: wrap;
  // justify-content: space-between;
  padding-bottom: 50px;
  .item {
    position: relative;
    width: 23%;
    padding: 20px;
    box-sizing: border-box;
    margin: 15px 0;
    margin-right: 2%;
    border-radius: 8px;
    box-shadow: 4px 6px 10px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    .name {
      height: 20px;
      margin: 10px 0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      .label {
        color: #6667ab;
        font-weight: bold;
        width: 60px;
        display: inline-block;
        // font-size: 12px;
        margin-right: 5px;
      }
    }
  }
  .item::after {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
   width: 100%;
  height: 10px;
  border-radius: 5px 5px 0 0;
  background-color: #6667ab;
  }
}
</style>
