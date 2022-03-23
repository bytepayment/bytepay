<script lang="ts" setup>
import { ref, reactive } from "vue";

// =============== Datas ===============
let value = ref("");
let tabIndex = ref(0);

const options = [
  {
    value: "选项1",
    label: "黄金糕",
  },
  {
    value: "选项2",
    label: "双皮奶",
  },
  {
    value: "选项3",
    label: "蚵仔煎",
  },
  {
    value: "选项4",
    label: "龙须面",
  },
  {
    value: "选项5",
    label: "北京烤鸭",
  },
];
// =============== Functions ===============
function switchTab(index) {
  tabIndex.value = index;
}
</script>

<template>
  <div class="box">
    <div class="right">
      <div class="title">This is title</div>
      <div class="middle">
        <div class="button">1DOT click to buy</div>
        <div class="quantity">left:882</div>
        <div class="owner">owner:</div>
        <el-select style="width: 100px" v-model="value" placeholder="请选择">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </div>
      <div class="detail">
        君不见黄河之水天上来，奔流到海不复回。 君不见高堂明镜悲白发，朝如青丝暮成雪。
        人生得意须尽欢，莫使金樽空对月。 天生我材必有用，千金散尽还复来。
        烹羊宰牛且为乐，会须一饮三百杯。 岑夫子，丹丘生，将进酒，杯莫停。
        与君歌一曲，请君为我倾耳听。(倾耳听 一作：侧耳听)
        钟鼓馔玉不足贵，但愿长醉不愿醒。(不足贵 一作：何足贵；不愿醒 一作：不复醒)
        古来圣贤皆寂寞，惟有饮者留其名。(古来 一作：自古；惟 通：唯)
        陈王昔时宴平乐，斗酒十千恣欢谑。 主人何为言少钱，径须沽取对君酌。
        五花马、千金裘，呼儿将出换美酒，与尔同销万古愁。
      </div>
    </div>
    <div class="left">
      <div
        v-for="(item, index) in 5"
        :key="index"
        :class="[tabIndex == index ? 'optioned' : 'version']"
        @click="switchTab(index)"
      >
        v1.08
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
        width: 150px;
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
