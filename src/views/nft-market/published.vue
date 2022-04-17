<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import dayjs from 'dayjs'
import { cloud } from '@/api/cloud';
import { useRouter } from 'vue-router';

import { get_polkadot_keyring, getClasses } from '@/api/user';

const router = useRouter();
const list: any = ref([]);

onMounted(async () => {
  await Promise.all([getAddress(), getClass()])
  getList()
});

const address = ref('');
async function getAddress() {
  const r = await get_polkadot_keyring();
  if (r.error !== 0) return;
  address.value = r.data.address;
}

const tabIndex = ref(0);
const classArr: any = ref([]);
const classId = ref('');
async function getClass() {
  const r = await getClasses();
  classArr.value = r;
  classId.value = r[0].class_id;
}

function switchTab(index: number) {
  tabIndex.value = index;
  classId.value = classArr.value[index].class_id;
  getList();
}

async function getList() {
  const r = await cloud.invokeFunction('nft_get_published', {
    address: address.value,
    classid: classId.value
  });
  if (0 === r.code) list.value = r.data.map((_: any) => ({
    ..._,
    fileUrl: getFileUrl(_.file_path),
    buyTime: dayjs(_.buy_time).format('YYYY-MM-DD HH:mm:ss')
  }));
}

function getFileUrl(filePath: string) {
  const bucketUrl = import.meta.env.VITE_BUCKET_URL
  if (typeof(filePath) === 'string' && filePath.length > 0) {
    return `${bucketUrl}${filePath}`
  }
  return ''
}

function gotoPage(url: string, name: string, classid: string) {
  router.push({
    path: url,
    query: {
      name: name,
      classid: classid
    }
  });
}
</script>

<template>
  <el-card style="margin: 30px 0;">
    <div class="header">
      <span>PUBLISHED NFT</span>
    </div>
    <div class="classify">
      <div
        v-for="(item, index) in classArr"
        :key="index"
        :class="[tabIndex == index ? 'optioned' : 'className']"
        @click="switchTab(index)"
      >
        {{ item.meta.name }}
      </div>
    </div>
    <div class="content">
      <div
        v-for="item in list" :key="item._id"
        class="item"
        @click="gotoPage('/detail', item.project, item.classid)"
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

.header{
  font-size: 36px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
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
    .name {
      height: 20px;
      margin: 10px 0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      .label {
        color: #6667ab;
        font-weight: bold;
        width: 100px;
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
