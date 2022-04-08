<script lang="ts" setup>
import { ref, onMounted, Ref, reactive } from "vue";
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { useRoute } from "vue-router";
import { nft_get_detail, nft_buy } from "@/api/nft"
import { NFT } from '@/entity'

// =============== Datas ===============
const tabIndex = ref(0);
const list : Ref<NFT[]>= ref([]);
const curNFT: Ref<NFT> = ref({} as NFT)
const centerDialogVisible = ref(false)
// =============== Functions ===============

onMounted(async () => {
  const route = useRoute();
  const [name, classid] = [route.query.name, route.query.classid]
  const r = await nft_get_detail(name as string, classid as string)
  console.log(r)
  if (r.error !== 0) return console.log(r.error_msg)
  list.value = r.data.map((_: NFT) => ({
    ..._,
    created_time: dayjs(_.created_time).format('YYYY-MM-DD HH:mm:ss')
  }))
  curNFT.value = list.value[0]
});


async function buy() {
  const nft_id = curNFT.value._id
  const r = await nft_buy(nft_id)
  console.log('Buy result:', r)
  if (r.error !== 0) {
     return ElMessage({
      message: `Buy error: ${r.error_msg}`,
      type: 'error',
    })
  }
  ElMessage({ message: 'Buy success', type: 'success' })
  centerDialogVisible.value = false
}

function switchTab(index: number) {
  tabIndex.value = index;
  curNFT.value = list.value[index]
  console.log(curNFT.value)
}
</script>

<template>
  <el-card style="margin-top: 50px;">
    <div class="box" >
      <div class="right" v-if="list.length">
        <div class="release">Published Time: {{curNFT.created_time}}</div>
        <div class="title">
          {{ curNFT.title }}
        </div>
        <!-- <el-descriptions column="2">
          <el-descriptions-item label="Owner:">{{curNFT.owner}}</el-descriptions-item>
          <el-descriptions-item label="Project Name:">{{curNFT.project}}</el-descriptions-item>
          <el-descriptions-item label="Left:">
            <el-tag color="#6667ab" :hit="false" style="color: #fff;font-size: 16px;" size="normal">{{ curNFT.left_amount }}</el-tag>
          </el-descriptions-item>
        </el-descriptions> -->
        <div class="desc-items">
          <div style="display: flex;align-items: center;">
            <div class="desc-item">
              <div class="desc-item-label">Owner:</div>
              <div class="desc-item-value">{{curNFT.owner}}</div>
            </div>
            <div class="desc-item">
              <div class="desc-item-label">Project Name:</div>
              <div class="desc-item-value">{{curNFT.project}}</div>
            </div>
          </div>
          </div>
        <div class="middle">
          <el-button @click="centerDialogVisible = true" class="button">{{ curNFT.price }} BNX click to buy</el-button>
          <div class="desc-item">
            <div class="desc-item-label">Left:</div>
            <div class="desc-item-value">
              <el-tag color="#6667ab" :hit="false" style="color: #fff;font-size: 16px;" size="normal">{{ curNFT.left_amount }}</el-tag>
            </div>
          </div>
        </div>
        <div class="detail" v-html="curNFT.description"></div>
      </div>
      <div class="left">
        <div class="version-title">Version List</div>
        <div
          v-for="(item, index) in list"
          :key="index"
          class="version"
          :class="[tabIndex == index ? 'optioned' : '']"
          @click="switchTab(index)"
        >
          {{ item.version }}
        </div>
      </div>
      <el-dialog v-model="centerDialogVisible" title="Confirm Buy" width="30%" center>
        <span
          >Confirm paid {{ curNFT.price }} BNX to buy this NFT</span
        >
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="centerDialogVisible = false">Cancel</el-button>
            <el-button type="primary" @click="buy"
              >Confirm</el-button
            >
          </span>
        </template>
      </el-dialog>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.box {
  display: flex;
  padding: 10px;
  .right {
    width: 70%;
    margin-top: 30px;
    .release {
      font-size: 12px;
      letter-spacing: 2px;
      color: #6667ab;
      display: block;
      margin-bottom: 5px;
    }
    .title {
      width: 100%;
      font-weight: 600;
      font-size: 42px;
      line-height: 1.2;
      font-weight: 500;
      // text-align: center;
      margin: 10px 0 30px 0;
    }
    .desc-items {
      display: flex;
      flex-direction: column;
      .desc-item {
        display: flex;
        margin-bottom: 10px;
        margin-right: 30px;
        height: 30px;
        .desc-item-label {
          font-size: 14px;
          font-weight: bold;
          line-height: 30px;
          color: #6667ab;
          margin-right: 10px;
          vertical-align: center;
        }
        .desc-item-value {
          line-height: 30px;
          font-size: 16px;
          color: #333;
        }
      }
    }
    .quantity {
      margin: 10px 0;
      height: 30px;
      line-height: 30px;
    }
    .middle {
      display: flex;
      margin-top: 20px;
      .button {
        background-color: #e5e6f8;
        border: 1px solid #6667ab;
        color: #6667ab;
        height: 38px;
        text-align: center;
        font-size: 16px;
        border-radius: 0;
        padding: 0 25px;
        margin-right: 40px;
      }
      .desc-item {
        display: flex;
        margin-bottom: 10px;
        margin-right: 30px;
        height: 30px;
        .desc-item-label {
          font-size: 14px;
          font-weight: bold;
          line-height: 30px;
          color: #6667ab;
          margin-right: 10px;
          vertical-align: center;
        }
        .desc-item-value {
          line-height: 30px;
          font-size: 16px;
          color: #333;
        }
      }
      
      .owner {
        height: 30px;
        line-height: 30px;
      }
    }
    .detail {
      margin: 30px 0 0 0;
      width: 100%;
      border: 1px solid #d1d7dd;
      padding: 20px;
      min-height: 500px;
    }
  }
  .left {
    margin: 30px 0 0 80px;
    // border: 1px solid #6667ab;
    // padding: 10px;
    .version-title {
      font-size: 16px;
      font-weight: 600;
      text-transform: uppercase;
      margin-top: 0;
    }
    .version {
      margin: 20px 0;
      max-width: 80px;
      color: black;
      text-align: center;
      font-weight: bold;
      cursor: pointer;
    }
    .optioned {
      color: #6667ab;
      position: relative;
    }
    .optioned::after {
      content: '';
      display: block;
      position: absolute;
      background-color: #6667ab;
      width: 4px;
      height: 12px;
      left: 6px;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>
