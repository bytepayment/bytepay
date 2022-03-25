<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { cloud } from "@/api/cloud";
import Router from "@/router";
import { useRoute } from "vue-router";

// =============== Datas ===============
const tabIndex = ref(0);
const list = ref([
  {
    title: "",
    price: "",
    left_amount: "",
    description: "",
  },
]);
// =============== Functions ===============

onMounted(() => {
  const route = useRoute();
  getDetail(route.query.name, route.query.classid);
});

async function getDetail(name, classid) {
  const r = await cloud.invokeFunction("nft_get_detail", {
    name: name,
    classid: classid,
  });
  if (0 === r.code) list.value = r.data;
}

async function buy() {
  const r = await cloud.invokeFunction("nft_buy", {});
}

function switchTab(index) {
  tabIndex.value = index;
}
</script>

<template>
  <div class="box">
    <div class="right">
      <div class="title">
        {{ list[tabIndex].title }}
      </div>
      <div class="middle">
        <div @click="buy" class="button">{{ list[tabIndex].price }} DOT click to buy</div>
        <div class="quantity">left:{{ list[tabIndex].left_amount }}</div>
      </div>
      <div class="detail">
        {{ list[tabIndex].description }}
      </div>
    </div>
    <div class="left">
      <div
        v-for="(item, index) in list"
        :key="index"
        :class="[tabIndex == index ? 'optioned' : 'version']"
        @click="switchTab(index)"
      >
        {{ item.version }}
      </div>
    </div>
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
