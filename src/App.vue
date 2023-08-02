<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN" :theme="darkTheme">
    <n-layout position="absolute">
      <n-layout-header
        bordered
        class="navigation"
        :style="{ 'justify-content': counter.pageSize === 'pc' ? 'space-between' : 'center' }"
      >
        <span class="siteName" @click="() => router.push('/')">Qiao's Dash</span>
        <n-menu
          v-if="counter.pageSize === 'pc'"
          mode="horizontal"
          v-model:value="menuValue"
          :options="menuOptions"
        />
      </n-layout-header>
      <n-layout-content
        :native-scrollbar="false"
        style="top: 3.6rem"
        :style="{ bottom: counter.pageSize === 'pc' ? '0' : '3.6rem' }"
        position="absolute"
      >
        <n-back-top bottom="65" />
        <div
          class="container"
          :style="{ padding: counter.pageSize === 'pc' ? '20px 16px' : '20px 0 104px 0' }"
        >
          <router-view />
        </div>
      </n-layout-content>
      <n-layout-footer
        v-if="counter.pageSize === 'phone'"
        position="absolute"
        bordered
        class="footer"
      >
        <n-menu mode="horizontal" v-model:value="menuValue" :options="menuOptions" />
      </n-layout-footer>
    </n-layout>
    <n-global-style />
  </n-config-provider>
</template>

<script setup lang="ts">
import { h, ref } from "vue";
import { RouterLink } from "vue-router";
import {
  NMenu,
  NLayout,
  NBackTop,
  NLayoutFooter,
  NLayoutHeader,
  NLayoutContent,
  type MenuOption,
} from "naive-ui";
import { zhCN, dateZhCN, darkTheme, NGlobalStyle, NConfigProvider } from "naive-ui"; // NaiveUI Config

import router from "@/router";
import { useCounterStore } from "@/stores/counter";

import NaiveUIDiscreteAPI from "@/assets/NaiveUIDiscreteAPI";

const counter = useCounterStore();

const menuValue = ref<string>(
  (() => {
    switch (location.pathname) {
      case "/":
        return "Home";
      case "/dynamic":
        return "Dynamic";
      case "/anime":
        return "Anime";
      case "/todo":
        return "Todo";
      default:
        return "";
    }
  })()
);
const menuOptions: MenuOption[] = [
  {
    label: () => h(RouterLink, { to: "/" }, { default: () => "Home" }),
    key: "Home",
  },
  {
    label: () => h(RouterLink, { to: "/dynamic" }, { default: () => "Dynamic" }),
    key: "Dynamic",
  },
  {
    label: () => h(RouterLink, { to: "/anime" }, { default: () => "Anime" }),
    key: "Anime",
  },
  {
    label: () => h(RouterLink, { to: "/todo" }, { default: () => "Todo" }),
    key: "Todo",
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

// getConfig
const initConfig = async () => {
  NaiveUIDiscreteAPI.loadingBar.start();
  try {
    const resp = await fetch(
      `https://${import.meta.env.Q_API_HostName}/api/getConfig?token=${import.meta.env.Q_TOKEN}`
    );
    if (resp.status !== 200) throw `status error: ${resp.status}`;
    const resp_json = (await resp.json()) as {
      code: number;
      message: string;
      data: { [key: string]: any };
    };
    if (resp_json.code !== 200) throw `code error(${resp_json.code}): ${resp_json.message}`;
    counter.catchDynamicStatus = (() => {
      const t = resp_json.data.updateSwitch;
      if (t === "true") return true;
      else if (t === "false") return false;
    })();
    counter.pinDynamicID = (() => {
      const t = resp_json.data.pin;
      if (/^\d+$/.test(t)) return t;
    })();
    counter.latestUpdateBiliBiliLoginTS = (() => {
      const t = JSON.parse(resp_json.data["bilibili-login"]);
      return t.ts;
    })();
    NaiveUIDiscreteAPI.loadingBar.finish();
  } catch (e) {
    NaiveUIDiscreteAPI.loadingBar.error();
    NaiveUIDiscreteAPI.message.error(`获取config失败, ${e}`);
  }
};
initConfig();
</script>

<style>
.siteName {
  font-weight: bold;
  font-size: 18px;
  letter-spacing: 2px;
  white-space: nowrap;
  cursor: default;
}

.navigation {
  padding: 0 32px;
  height: calc(3.6rem - 1px);
  user-select: none;
  text-align: center;
  display: flex;
  align-items: center;
}

.container {
  max-width: 1120px;
  margin: 0 auto;
}

.footer {
  height: calc(3.6rem - 1px);
  user-select: none;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
