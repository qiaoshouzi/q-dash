<template>
  <span class="siteName" @click="() => router.push('/')">Qiao's Dash</span>
  <n-menu default-value="Home" v-model:value="menuValue" mode="horizontal" :options="menuOptions" />
</template>

<script setup lang="ts">
import { h, ref } from "vue";
import { RouterLink } from "vue-router";
import { NMenu, type MenuOption } from "naive-ui";

import router from "@/router";

const menuValue = ref<string | null>("Home");
const menuOptions: MenuOption[] = [
  {
    label: () => h(RouterLink, { to: "/" }, { default: () => "首页" }),
    key: "Home",
  },
];
</script>

<style scoped>
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
</style>
