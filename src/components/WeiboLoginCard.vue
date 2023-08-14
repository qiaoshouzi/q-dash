<template>
  <n-button
    block
    strong
    secondary
    :type="
      counter.latestUpdateWeiboLoginTS === undefined ||
      Date.now() - counter.latestUpdateWeiboLoginTS >= 7 * 24 * 60 * 60 * 1000
        ? 'error'
        : 'info'
    "
    :size="counter.pageSize === 'pc' ? 'medium' : 'small'"
    :style="props.style"
    @click="openModalButtonClick"
  >
    Weibo登录信息
    <span v-if="counter.latestUpdateWeiboLoginTS !== undefined" style="margin-left: 3px">
      上次登录为
      <n-time
        :to="counter.latestUpdateWeiboLoginTS"
        :time="Date.now()"
        type="relative"
        style="margin-left: 3px"
      />
    </span>
  </n-button>
  <n-modal v-model:show="showModal" preset="card" title="登录Weibo" style="width: 348px">
    <div
      style="width: 100%; display: flex; flex-direction: column; align-items: flex-start; gap: 3px"
    >
      <n-skeleton
        v-if="QRCodeImage === undefined"
        :sharp="false"
        style="width: 100%"
        :style="{ height: QRCodeHeight }"
      />
      <img
        v-else
        :src="QRCodeImage"
        style="width: 100%; border-radius: 3px"
        :style="{ height: QRCodeHeight }"
      />
      <span v-if="QRCodeKey !== ''">{{ QRCodeKey }}</span>
      <span>状态: {{ loginMessage }}</span>
      <div style="width: 100%; display: flex; justify-content: flex-end; gap: 5px">
        <n-button
          strong
          secondary
          :loading="refreshButtonLoading"
          type="info"
          @click="openModalButtonClick"
        >
          刷新
        </n-button>
        <n-button
          strong
          secondary
          :loading="loginButtonLoading"
          type="primary"
          @click="loginButtonClick"
        >
          登录
        </n-button>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { NButton, NTime, NModal, NSkeleton } from "naive-ui";

import API from "@/assets/API";
import { useCounterStore } from "@/stores/counter";
import NaiveUIDiscreteAPI from "@/assets/NaiveUIDiscreteAPI";

const props = defineProps({
  style: {
    type: Object,
  }, // 样式
});
const counter = useCounterStore();

const showModal = ref<boolean>(false);
const QRCodeImage = ref<string | undefined>(undefined);
const QRCodeKey = ref<string>("");
const QRCodeHeight = ref<string>("300px");
const resizeEvent = () => {
  const pageWidth = window.innerWidth;
  const t = pageWidth - 48;

  if (t >= 300) {
    QRCodeHeight.value = "300px";
  } else {
    QRCodeHeight.value = `${t}px`;
  }
};
window.addEventListener("resize", () => resizeEvent());
resizeEvent();

const loginMessage = ref<string>("未扫码");
const refreshButtonLoading = ref<boolean>(false);
const loginButtonLoading = ref<boolean>(false);

const openModalButtonClick = async () => {
  QRCodeImage.value = undefined;
  loginMessage.value = "未扫码";
  showModal.value = true;
  refreshButtonLoading.value = true;

  const resp_json = await API<{
    qrid: string;
    image: string;
  }>("获取登录Weibo二维码", "/api/login-weibo", "GET");
  if (resp_json) {
    QRCodeKey.value = resp_json.data.qrid;
    QRCodeImage.value = resp_json.data.image;
  }
  refreshButtonLoading.value = false;
};

const loginButtonClick = async () => {
  loginButtonLoading.value = true;
  const resp_json = await API<
    | {
        // checkQRCode 阶段返回错误
        type: "checkQRCode";
        data: {
          code: number;
          message: string;
        };
      }
    | {
        // 登录成功
        type: "success";
        ts: number;
      }
  >("登录Weibo", "/api/login-weibo", "POST", {
    body: { qrid: QRCodeKey.value },
  });
  if (resp_json) {
    if (resp_json.data.type === "checkQRCode") {
      loginMessage.value = `${resp_json.data.data.message}(${resp_json.data.data.code})`;
      NaiveUIDiscreteAPI.message.warning(
        `${resp_json.data.data.message}(${resp_json.data.data.code})`
      );
      if (resp_json.data.data.code === 50114003) {
        // 二维码过期, 重新获取
        await openModalButtonClick();
      }
    } else if (resp_json.data.type === "success") {
      showModal.value = false;
      counter.latestUpdateWeiboLoginTS = resp_json.data.ts;
    }
  }
  loginButtonLoading.value = false;
};
</script>
