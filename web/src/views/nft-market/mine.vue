<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import dayjs from 'dayjs'
import { useStore } from 'vuex'
import { cloud } from '@/api/cloud';

const list: any = ref([]);

const store = useStore()
const user = store.state.user

onMounted(() => {
  getList();
});

async function getList() {
  const r = await cloud.invokeFunction('nft_get_mine', {
    id: user.id
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

function download(url: string, filename: string) {
  if (!url || !filename) return

  fetch(url).then(response => response.blob()).then(blob => {
    //FileSaver.saveAs(blob, filename)
    const blobUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', blobUrl)
    link.setAttribute('download', filename)
    link.setAttribute('target', '_blank')
    link.click()
    URL.revokeObjectURL(blobUrl)
  })
}
</script>

<template>
  <el-card style="margin: 40px 0 40px;">
    <div class="header">
      <span>PURCHASED NFT</span>
    </div>
    <div class="content">
      <div v-for="item in list" :key="item._id" class="item">
        <div class="name"><span class="label">Title:</span> {{ item.title }}</div>
        <div class="name"><span class="label">Project:</span> {{ item.project }}</div>
        <div class="name"><span class="label">Version:</span> {{ item.version }}</div>
        <div class="name"><span class="label">Price:</span> {{ item.price }}</div>
        <div class="name"><span class="label">Buy Time:</span> {{ item.buyTime }}</div>
        <div class="name">
          <span class="label">File:</span>
          <!-- <span style="cursor: pointer;" @click="download(item.fileUrl, item.file_path)">
            {{ typeof(item.file_path) === 'string' ? item.fileUrl : 'No file' }}
          </span> -->
          <a href="javascript:void(0);" @click="download(item.fileUrl, item.file_path)">download</a>
        </div>
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
