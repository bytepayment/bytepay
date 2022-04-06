<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { cloud } from "@/api/cloud";
import { ElMessage } from "element-plus";
import Router from "@/router";
import { getToken, getUser } from "@/utils/auth";
import { get_polkadot_keyring, getClasses } from "@/api/user";
import { TINYMCE_API_KEY } from '@/config/index'
import Editor from '@tinymce/tinymce-vue';


// =============== Datas ===============
const title = ref("");
const price = ref(null);
const version = ref("");
const project = ref("");
const total_supply = ref(null);
const description = ref("");
const address = ref("");
const owner = ref("");
const classid = ref("");
const file_path = ref("");
const uploadUrl = ref(`${cloud.fileBaseUrl}/public?auto=1`);
// selectData
const options: any = ref([]);
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
  if (!total_supply.value)
    return ElMessage.warning("total_supply can not be null");
  if (!classid) return ElMessage.warning("classid can not be null");
  if (!description.value)
    return ElMessage.warning("description can not be null");
  if (!file_path.value) return ElMessage.warning("Must upload a file");

  const data = {
    id: getUser().id,
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
    file_path: file_path.value,
  };

  console.log(data, "上传数据");

  const r = await cloud.invokeFunction("nft_mint", data);
  if (0 !== r.code) ElMessage.warning(r.message);
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

function onFileUploadSuccess(res: any, uploadFile: any, uploadFiles: any) {
  file_path.value = res.data.filename;
}
</script>

<template>
  <el-card style="margin-top: 50px;">
    <div class="form-title">Mint a NFT</div>
    <el-form label-width="120px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="Title:">
            <el-input v-model="title" placeholder="title"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Price:">
            <el-input
              oninput="if(value>100)value=100;if(value.length>2)value=value.slice(0,3);if(value<0)value=0"
              v-model="price"
              placeholder="price"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="Version:">
            <el-input v-model="version" placeholder="version"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Project:">
            <el-input v-model="project" placeholder="project"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="Total_supply:">
            <el-input
              oninput="if(value>100)value=100;if(value.length>2)value=value.slice(0,3);if(value<1)value=1"
              v-model="total_supply"
              placeholder="total_supply"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Class:">
            <el-select @change="selectChange" v-model="value" placeholder="class">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="Describe:">
       <editor :api-key='TINYMCE_API_KEY' :init="{
          plugins: 'image',
          toolbar:
          'undo redo | formatselect | bold italic | \
          alignleft aligncenter alignright | \
          bullist numlist outdent indent | help | image'
        }" v-model="description" />
      </el-form-item>

      <el-form-item label="File:">
        <el-upload :action="uploadUrl" multiple :limit="1" :on-success="onFileUploadSuccess">
          <el-button class="upload" size="small" type="primary">Select Your File</el-button>
        </el-upload>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" size="normal" @click="ok">submit</el-button>
      </el-form-item>
    </el-form>
  </el-card>
 
</template>

<style lang="scss" scoped>
.form-title {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
}
</style>
