<script lang="ts" setup>
import { ref, reactive } from "vue";
import { cloud } from "@/api/cloud";
import { ElMessage } from "element-plus";
import Router from "@/router";


// =============== Datas ===============
let title = ref("");
let price = ref("");
let version = ref("");
let project = ref("");
let circulation = ref("");
let description = ref("");
const fileList = ref([]);
// =============== Functions ===============

async function ok() {
  if (!title.value) return ElMessage.warning("title can not be null");
  if (!price.value) return ElMessage.warning("price can not be null");
  if (!version.value) return ElMessage.warning("version can not be null");
  if (!project.value) return ElMessage.warning("project can not be null");
  if (!circulation.value) return ElMessage.warning("circulation can not be null");
  if (!description.value) return ElMessage.warning("description can not be null");

  const r = await cloud.invokeFunction("nft_mint", {
    title: title.value,
    price: price.value,
    version: version.value,
    project: project.value,
    total_supply: circulation.value,
    description: description.value,
    file_path: fileList.value,
  });
  if (1 === r.code) ElMessage.warning(r.message);
  if (0 === r.code) {
    ElMessage.success(r.message);
    gotoPage("/market");
  }
}

function gotoPage(url: string) {
  Router.replace(url);
}
</script>

<template>
  <div class="box">
    <div class="input">
      <el-input v-model="title" placeholder="title"></el-input>
    </div>
    <div class="input">
      <el-input v-model="price" placeholder="price"></el-input>
    </div>
    <div class="input">
      <el-input v-model="version" placeholder="version"></el-input>
    </div>
    <div class="input">
      <el-input v-model="project" placeholder="project"></el-input>
    </div>
    <div class="input">
      <el-input v-model="circulation" placeholder="circulation"></el-input>
    </div>
    <div class="input">
      <el-input type="textarea" :rows="5" placeholder="describe" v-model="description">
      </el-input>
    </div>
    <div class="uploadBox">
      <el-upload
        action="https://f8e01ed1-af71-41f0-bb60-6a293ecc18e8.bytepay.online:8000"
        multiple
        :limit="5"
        :file-list="fileList"
      >
        <el-button class="upload" size="small" type="primary">upload</el-button>
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
    width: 40%;
    .upload {
      width: 80px;
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
