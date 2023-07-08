<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN" :theme="darkTheme">
    <n-layout position="absolute">
      <n-layout-header bordered class="navigation">
        <span class="siteName" @click="() => router.push('/')">Qiao's Dash</span>
        <n-menu mode="horizontal" v-model:value="menuValue" :options="menuOptions" />
      </n-layout-header>
      <n-layout-content
        :native-scrollbar="false"
        style="top: 3.6rem; bottom: 0"
        position="absolute"
      >
        <n-back-top />
        <div
          class="container"
          :style="{ padding: counter.pageSize === 'pc' ? '20px 16px' : '20px 0 104px 0' }"
        >
          <router-view />
        </div>
      </n-layout-content>
    </n-layout>
    <n-global-style />
  </n-config-provider>
</template>

<script setup lang="ts">
import { h, ref } from "vue";
import { RouterLink } from "vue-router";
import { NLayout, NBackTop, NLayoutHeader, NLayoutContent, NMenu, type MenuOption } from "naive-ui";
import { zhCN, dateZhCN, darkTheme, NGlobalStyle, NConfigProvider } from "naive-ui"; // NaiveUI Config

import router from "@/router";
import { useCounterStore } from "@/stores/counter";

const counter = useCounterStore();

const menuValue = ref<string>(
  (() => {
    if (location.pathname === "/") return "Home";
    else if (location.pathname === "/anime") return "Anime";
    else return "";
  })()
);
const menuOptions: MenuOption[] = [
  {
    label: () => h(RouterLink, { to: "/" }, { default: () => "Home" }),
    key: "Home",
  },
  {
    label: () => h(RouterLink, { to: "/anime" }, { default: () => "Anime" }),
    key: "Anime",
  },
];

// 平台
const resizeEvent = () => {
  const pageWidth = window.innerWidth;

  if (pageWidth < 700) {
    counter.pageSize = "phone";
  } else {
    counter.pageSize = "pc";
  }
};
window.addEventListener("resize", () => {
  resizeEvent();
});
resizeEvent();
</script>

<style>
.siteName {
  /* display: flex; */
  /* flex-grow: 1; */
  /* align-items: center; */

  font-weight: bold;
  font-size: 18px;
  letter-spacing: 2px;
  white-space: nowrap;
  cursor: default;

  /* margin-left: 0; */
  /* justify-content: flex-start; */
}

.navigation {
  padding: 0 32px;
  height: calc(3.6rem - 1px);
  user-select: none;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.container {
  max-width: 1120px;
  /* padding: 20px 16px 104px 16px; */
  margin: 0 auto;
}
</style>
