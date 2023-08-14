<template>
  <div
    style="display: flex; justify-content: space-between; flex-direction: column; gap: 5px"
    :style="{
      margin: counter.pageSize === 'pc' ? '0 0 10px 0' : '0 16px 10px 16px',
    }"
  >
    <PaginationCard
      v-model:now-page="nowPage"
      v-model:page-size="pageSize"
      :page-count="pageCount"
      :dynamic-length="dynamicList?.length"
    />
    <div style="display: flex; gap: 5px">
      <!-- 抓取管理 -->
      <n-button
        v-if="counter.catchDynamicStatus !== undefined"
        block
        strong
        secondary
        :type="counter.catchDynamicStatus ? 'warning' : 'success'"
        :size="counter.pageSize === 'pc' ? 'medium' : 'small'"
        @click="counter.updateCatchDynamicStatus()"
        style="flex: 1"
      >
        {{ counter.catchDynamicStatus ? "停止抓取" : "继续抓取" }}
      </n-button>
      <!-- 前往固定动态 -->
      <n-button
        block
        strong
        secondary
        type="success"
        :disabled="counter.pinDynamicID === undefined"
        :size="counter.pageSize === 'pc' ? 'medium' : 'small'"
        @click="goPinDynamicButtonClick"
        style="flex: 1"
      >
        前往固定动态
      </n-button>
    </div>
    <div style="display: flex; flex-wrap: wrap; gap: 5px">
      <div
        :style="{
          'flex-basis': counter.pageSize === 'pc' ? 'calc(50% - 2.5px)' : 'calc(100%)',
        }"
      >
        <!-- 登录管理 -->
        <BiliBiliLoginCard />
      </div>
      <div
        :style="{
          'flex-basis': counter.pageSize === 'pc' ? 'calc(50% - 2.5px)' : 'calc(100%)',
        }"
      >
        <!-- 批量删除 -->
        <BatchDeleteModal @update="main" />
      </div>
    </div>
  </div>
  <!-- 显示动态 -->
  <div v-for="value in nowDynamicList" :key="value[0]" style="margin-bottom: 10px">
    <DynamicCard
      :dynamicID="value[0]"
      :raw="value[1]"
      :style="{
        'border-color': value[0] === counter.pinDynamicID ? '#63e2b7' : undefined,
      }"
    />
  </div>
  <!-- 无动态 -->
  <div v-if="dynamicList === undefined || dynamicList.length === 0">
    <n-card
      size="small"
      :bordered="counter.pageSize === 'pc'"
      :style="{
        'border-left': counter.pageSize === 'phone' ? 'none' : undefined,
        'border-right': counter.pageSize === 'phone' ? 'none' : undefined,
      }"
    >
      <n-empty description="无动态" />
    </n-card>
  </div>
  <!-- 获取失败 -->
  <n-card v-if="showErrorCard" style="margin-bottom: 10px">
    <n-result status="error" title="获取所有动态失败" :description="errorMessages" />
  </n-card>
  <!-- 底部分页 -->
  <div
    :style="{
      margin: counter.pageSize === 'pc' ? '10px 0 0 0' : '10px 16px 0 16px',
    }"
  >
    <PaginationCard
      v-model:now-page="nowPage"
      v-model:page-size="pageSize"
      :page-count="pageCount"
      :dynamic-length="dynamicList?.length"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { NCard, NResult, NButton, NEmpty } from "naive-ui";
import { useUrlSearchParams } from "@vueuse/core";

import API from "@/assets/API";
import { useCounterStore } from "@/stores/counter";
import PaginationCard from "@/components/PaginationCard.vue";
import DynamicCard from "@/components/Dynamic/DynamicCard.vue";
import BiliBiliLoginCard from "@/components/BiliBiliLoginCard.vue";
import BatchDeleteModal from "@/components/Dynamic/BatchDeleteModal.vue";

const counter = useCounterStore();

// error
const showErrorCard = ref<boolean>(false);
const errorMessages = ref<string>("");

// dynamicList
type DynamicList = [string, string?][]; // [id, raw?]
const dynamicList = ref<DynamicList | undefined>(undefined); // 所有动态
const dynamicListPages = computed<DynamicList[]>(() => {
  if (dynamicList.value === undefined) return [];
  return groupArray(dynamicList.value, pageSize.value);
}); // 动态分页列表
const nowDynamicList = computed<DynamicList>(() => {
  if (dynamicListPages.value.length === 0) return [];
  return dynamicListPages.value[nowPage.value - 1];
}); // 本页动态列表

// 分页
const nowPage = ref<number>(
  (() => {
    const params = useUrlSearchParams();
    if (params.page === undefined) {
      return 1;
    }
    return Number(params.page);
  })()
); // 当前页
watch(nowPage, (value) => {
  const params = useUrlSearchParams();
  params.page = String(value);
});
const pageCount = computed<number>(() => {
  if (dynamicListPages.value.length === 0) {
    return 0;
  }
  return dynamicListPages.value.length;
}); // 总页数
const pageSize = ref<number>(
  (() => {
    const pageSize = Number(window.localStorage.getItem("pageSize"));
    if (![10, 20, 30, 40].includes(pageSize)) {
      localStorage.setItem("pageSize", "20");
      return 20;
    } else return pageSize;
  })()
); // 每页数量
watch(pageSize, (value) => {
  window.localStorage.setItem("pageSize", String(value));
});

// 分页
const groupArray = (arr: any[], groupSize: number): any[][] => {
  return arr.reduce((result, current, index) => {
    if (index % groupSize === 0) {
      result.push(arr.slice(index, index + groupSize));
    }
    return result;
  }, []);
};

// pinDynamic
const goPinDynamicButtonClick = () => {
  dynamicListPages.value.forEach((pages, index) => {
    pages.forEach((page) => {
      if (counter.pinDynamicID === page[0]) {
        nowPage.value = index + 1;
      }
    });
  });
};

// 获取data
const main = async () => {
  const resp_json = await API<DynamicList>("获取动态", "/api/dynamic", "GET");
  if (resp_json) {
    dynamicList.value = resp_json.data;
  }
};
main();
</script>
