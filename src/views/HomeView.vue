<template>
  <div style="padding: 0 12px">
    <n-h2>👋 Hi, Qiaoshouzi</n-h2>
    <n-card title="Dynamic" size="small">
      <n-grid :cols="counter.pageSize === 'pc' ? 2 : 1" x-gap="5px" y-gap="5px">
        <n-gi>
          <n-button
            block
            strong
            secondary
            :disabled="counter.catchDynamicStatus === undefined"
            :type="counter.catchDynamicStatus ? 'warning' : 'success'"
            :size="counter.pageSize === 'pc' ? 'medium' : 'small'"
            @click="counter.updateCatchDynamicStatus()"
            style="flex: 1"
          >
            {{ counter.catchDynamicStatus ? "停止抓取" : "继续抓取" }}
          </n-button>
        </n-gi>
        <n-gi>
          <LoginCard style="flex: 1" />
        </n-gi>
      </n-grid>
    </n-card>
    <n-card title="Route" size="small" style="margin-top: 10px">
      <div style="display: flex; flex-wrap: wrap; gap: 5px">
        <n-button
          v-for="(value, key) in routes"
          :key="key"
          block
          strong
          secondary
          type="primary"
          style="flex: 1"
          @click="goTo(value.url)"
        >
          {{ value.name }}
        </n-button>
      </div>
    </n-card>
    <div style="margin-top: 10px">
      <ManageAccessCard />
    </div>
  </div>
</template>

<script setup lang="ts">
import { NH2, NCard, NButton, NGrid, NGi } from "naive-ui";

import { useCounterStore } from "@/stores/counter";
import LoginCard from "@/components/LoginCard.vue";
import ManageAccessCard from "@/components/ManageAccessCard.vue";

const counter = useCounterStore();

const routes: {
  name: string;
  url: string;
}[] = [
  {
    name: "光猫",
    url: "http://192.168.1.1/",
  },
  {
    name: "AC86U",
    url: "http://192.168.1.3/",
  },
  {
    name: "AC66U",
    url: "http://192.168.1.4/",
  },
  {
    name: "OpenWrt",
    url: "http://192.168.1.2/",
  },
  {
    name: "Switch",
    url: "http://192.168.1.5/",
  },
  {
    name: "NAS",
    url: "https://nas.h.cfm.moe:5001/",
  },
  {
    name: "Surge",
    url: "http://192.168.1.6:6166/web/index.html#/",
  },
];

const goTo = (url: string) => {
  window.open(url);
};
</script>
