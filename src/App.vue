<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN" :theme="darkTheme">
    <n-layout position="absolute">
      <n-layout-header
        bordered
        class="navigation"
        :style="{ 'justify-content': counter.pageSize === 'pc' ? 'space-between' : 'center' }"
      >
        <n-h1 class="siteName">
          <a style="color: #ffffffe6" href="/">Qiao's Dash</a>
        </n-h1>
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
          <router-view v-if="showContent" />
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
  NButton,
  NLayout,
  NBackTop,
  NLayoutFooter,
  NLayoutHeader,
  NLayoutContent,
  type MenuOption,
} from "naive-ui";
import { zhCN, dateZhCN, darkTheme, NGlobalStyle, NConfigProvider } from "naive-ui"; // NaiveUI Config

import router from "@/router";
import API from "@/assets/API";
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

// PWA 更新
const detectSWUpdate = async () => {
  const registration = await navigator.serviceWorker.ready;

  registration.addEventListener("updatefound", () => {
    const newSW = registration.installing;
    newSW?.addEventListener("statechange", () => {
      if (newSW.state == "activated") {
        // 准备好更新
        NaiveUIDiscreteAPI.notification.info({
          title: "有新的更新",
          content: () => {
            return h(
              "div",
              {
                style: {
                  display: "flex",
                  "justify-content": "flex-end",
                },
              },
              h(
                NButton,
                {
                  type: "success",
                  onClick: () => location.reload(),
                },
                {
                  default: () => "刷新",
                }
              )
            );
          },
        });
      }
    });
  });
};
detectSWUpdate();

// getConfig
let isInit: boolean = false;
const showContent = ref<boolean>(false);
const initConfig = async () => {
  const resp_json = await API<{
    "api-token": string;
    "bilibili-login": string;
    latestUpdateTime: string | null;
    pin: string | null;
    updateSwitch: string;
  }>("获取Config", "/api/getConfig", "GET");
  if (!resp_json) return;
  counter.catchDynamicStatus = (() => {
    const t = resp_json.data.updateSwitch;
    if (t === "true") return true;
    else if (t === "false") return false;
  })();
  counter.pinDynamicID = (() => {
    const t = String(resp_json.data.pin);
    if (/^\d+$/.test(t)) return t;
  })();
  counter.latestUpdateBiliBiliLoginTS = (() => {
    const t = JSON.parse(resp_json.data["bilibili-login"]);
    return t.ts;
  })();
  counter.apiToken = resp_json.data["api-token"];
  isInit = true;
  showContent.value = true;
};
router.afterEach((to) => {
  showContent.value = isInit;
  if (to.name !== "Login" && !isInit) {
    initConfig();
  } else {
    showContent.value = true;
  }
});
</script>

<style>
a {
  text-decoration: none;
}

body {
  overscroll-behavior-y: contain;
}

.siteName {
  font-weight: bold;
  font-size: 18px;
  letter-spacing: 2px;
  white-space: nowrap;
  cursor: default;

  margin-bottom: 0;
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
  height: calc(calc(3.6rem - 1px) + 5px);
  user-select: none;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 5px;
}
</style>
