<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { cloud } from "@/api/cloud";
import Router from "@/router";

// =============== Datas ===============
let tabIndex = ref(0);
const arr = ["诺克萨斯", "艾欧尼亚", "巨神峰", "祖安", "班德尔城", "夏尔"];
const list = ref([]);

// =============== Functions ===============

onMounted(() => {
  getList();
});

async function getList() {
  const r = await cloud.invokeFunction("nft_get_list", {});
  if (0 === r.code) list.value = r.data;
  console.log(r, "000");
}

function switchTab(index) {
  tabIndex.value = index;
}
function gotoPage(url: string) {
  Router.replace(url);
}
</script>

<template>
  <div>
    <div class="classify">
      <div
        v-for="(item, index) in arr"
        @click="switchTab(index)"
        :key="index"
        :class="[tabIndex == index ? 'optioned' : 'className']"
      >
        {{ item }}
      </div>
    </div>
    <div class="content">
      <div @click="gotoPage('/detail')" v-for="(item, index) in list" class="item">
        <img src="../../assets/bacc.jpeg" alt="" />
        <div class="name">{{ item.title }}</div>
        <div class="name">{{item.total_supply}} left</div>
        <div class="name">{{item.price}} DOT</div>
      </div>
    </div>
    <div @click="gotoPage('/publish')" class="button">publish</div>
  </div>
</template>

<style lang="scss" scoped>
.classify {
  display: flex;
  justify-content: space-around;
  width: 100%;
  height: 80px;
  margin: 80px 0 0 0;
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
  justify-content: space-around;
  .item {
    width: 200px;
    height: 150px;
    margin: 10px 0 0 0px;
    border-radius: 8px;
    box-shadow: 4px 6px 10px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    .name {
      width:200px;
      height:20px;
      text-align: center;
      margin: 0px 0 5px 0;
    }
    img {
      width: 200px;
      height: 75px;
      object-fit: cover;
      border-radius: 5px 5px 0 0;
      background-color: #b7b8b7;
    }
  }
}
.button {
  position: absolute;
  top: 20px;
  right: 20%;
  width: 80px;
  height: 30px;
  text-align: center;
  line-height: 30px;
  color: #ffffff;
  background-color: #6667ab;
  border-radius: 5px;
  cursor: pointer;
}
</style>
