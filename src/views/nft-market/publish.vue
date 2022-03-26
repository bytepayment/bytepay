<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { cloud } from "@/api/cloud";
import { ElMessage } from "element-plus";
import Router from "@/router";
import { getToken, getUser } from "@/utils/auth";
import {
  get_polkadot_keyring,
  get_polka_account_info,
  get_polkadot_tx_record,
  getClasses,
} from "@/api/user";

// =============== Datas ===============
const title = ref("");
const price = ref(null);
const version = ref("");
const project = ref("");
const total_supply = ref(null);
const description = ref("");
const fileList = ref([]);
const address = ref("");
const owner = ref("");
const classid = ref("");
const uploadUrl = ref(`${cloud.fileBaseUrl}/public?auto=1`)
// selectData
const options = ref([]);
const value = ref("");
// =============== Functions ===============

onMounted(() => {
  owner.value = getUser().name;

  getClass();
  getAddress();
});

async function ok() {
  if (!title.value) return ElMessage.warning("title can not be null");
  if (!price.value) return ElMessage.warning("price can not be null");
  if (!version.value) return ElMessage.warning("version can not be null");
  if (!project.value) return ElMessage.warning("project can not be null");
  if (!total_supply.value) return ElMessage.warning("total_supply can not be null");
  if (!classid) return ElMessage.warning("classid can not be null");
  if (!description.value) return ElMessage.warning("description can not be null");
  if (!fileList.value.length) return ElMessage.warning("Must upload a file")

  const data = {
    title: title.value,
    price: Number(price.value),
    version: version.value,
    project: project.value,
    total_supply: total_supply.value,
    description: description.value,
    chanin_id: "",
    owner: owner.value,
    owner_address: address.value,
    classid: classid.value,
    file_path: fileList.value[0],
  };

  const r = await cloud.invokeFunction("nft_mint", data);
  if (1 === r.code) ElMessage.warning(r.message);
  if (0 === r.code) {
    ElMessage.success(r.message);
    gotoPage("/market");
  }
}

async function getAddress() {
  const r = await get_polkadot_keyring();
  if (r.error !== 0) return;
  address.value = r.data.address;
}

async function getClass() {
  const res = await getClasses();

  res.forEach((element: any) => {
    let obj: any = {};
    obj.value = element.class_id;
    obj.label = element.meta.name;
    options.value.push(obj);
  });
}

function selectChange(e: any) {
  classid.value = e;
}

function gotoPage(url: string) {
  Router.replace(url);
}
</script>

<template>
  <div class="box">
    <div class="form-title">Mint a NFT</div>
    <div class="input">
      <el-input v-model="title" placeholder="title"></el-input>
    </div>

    <div class="input">
      <el-input type="number" v-model="price" placeholder="price"></el-input>
    </div>

    <div class="input">
      <el-input v-model="version" placeholder="version"></el-input>
    </div>

    <div class="input">
      <el-input v-model="project" placeholder="project"></el-input>
    </div>

    <div class="input">
      <el-input type="number" v-model="total_supply" placeholder="total_supply"></el-input>
    </div>

    <el-select @change="selectChange" class="input" v-model="value" placeholder="class">
      <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
    </el-select>

    <div class="input">
      <el-input type="textarea" :rows="5" placeholder="describe" v-model="description"></el-input>
    </div>

    <div class="uploadBox">
      <el-upload :action="uploadUrl" multiple :limit="5" :file-list="fileList">
        <el-button class="upload" size="small" type="primary">Select Your File</el-button>
      </el-upload>
    </div>

    <div @click="ok" class="ok">submit</div>
  </div>
</template>

<style lang="scss" scoped>
.box {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0 0 0;
  .input {
    width: 40%;
    margin: 15px 0 0 0;
  }
  .uploadBox {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    .upload {
      // width: 80px;
      height: 30px;
      font-size: 15px;
      margin: 15px 0 0 0;
      background-color: #6667ab;
      border-color: #6667ab;
    }
  }
  .ok {
    width: 80px;
    height: 30px;
    margin: 10px 0 0 0;
    text-align: center;
    line-height: 30px;
    color: #ffffff;
    background-color: #6667ab;
    border-radius: 5px;
    cursor: pointer;
  }
}
</style>
