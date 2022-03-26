<script lang="ts" setup>
import { ref, onMounted, Ref, reactive } from "vue";
import { ElMessage } from 'element-plus'
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
  list.value = r.data
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
  <div class="box">
    <div class="right" v-if="list.length">
      <div class="title">
        {{ curNFT.title }}
      </div>
      <div class="middle">
        <div @click="centerDialogVisible = true" class="button">{{ curNFT.price }} BNX click to buy</div>
        <div class="quantity">left:{{ curNFT.left_amount }}</div>
      </div>
      <div class="detail">
        {{ curNFT.description }}
      </div>
    </div>
    <div class="left">
      <div>Version List</div>
      <div
        v-for="(item, index) in list"
        :key="index"
        :class="[tabIndex == index ? 'optioned' : 'version']"
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
</template>

<style lang="scss" scoped>
.box {
  display: flex;
  .right {
    width: 70%;
    height: 500px;
    .title {
      width: 100%;
      font-weight: 600;
      font-size: 22px;
      text-align: center;
      margin: 30px 0 30px 0;
    }
    .middle {
      display: flex;
      .button {
        padding: 0 5px 0 5px;
        min-width: 150px;
        height: 30px;
        text-align: center;
        line-height: 30px;
        color: #ffffff;
        background-color: #6667ab;
        border-radius: 5px;
        cursor: pointer;
      }
      .quantity {
        margin: 0 30px 0 30px;
        height: 30px;
        line-height: 30px;
      }
      .owner {
        height: 30px;
        line-height: 30px;
      }
    }
    .detail {
      margin: 30px 0 0 0;
      width: 100%;
    }
  }
  .left {
    margin: 100px 0 0 80px;
    .version {
      margin: 10px 0 0 0;
      max-width: 80px;
      height: 30px;
      color: black;
      text-align: center;
      line-height: 35px;
      font-weight: bold;
      cursor: pointer;
      border-bottom: 1px solid #b7b8b7;
    }
    .optioned {
      margin: 10px 0 0 0;
      max-width: 80px;
      height: 30px;
      color: #6667ab;
      text-align: center;
      line-height: 35px;
      font-weight: bold;
      border-bottom: 2px solid #6667ab;
      cursor: pointer;
    }
  }
}
</style>
