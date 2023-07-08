<template>
  <n-button
    block
    strong
    secondary
    :type="
      counter.latestUpdateBiliBiliLoginTS === undefined ||
      Date.now() - counter.latestUpdateBiliBiliLoginTS >= 7 * 24 * 60 * 60 * 1000
        ? 'error'
        : 'info'
    "
    :size="counter.pageSize === 'pc' ? 'medium' : 'small'"
    @click="openModalButtonClick"
  >
    BiliBili登录信息
    <span v-if="counter.latestUpdateBiliBiliLoginTS !== undefined" style="margin-left: 3px">
      上次登录为
      <n-time
        :to="counter.latestUpdateBiliBiliLoginTS"
        :time="Date.now()"
        type="relative"
        style="margin-left: 3px"
      />
    </span>
  </n-button>
  <n-modal v-model:show="showModal" preset="card" title="登录BiliBili" style="width: 348px">
    <div
      style="width: 100%; display: flex; flex-direction: column; align-items: flex-start; gap: 3px"
    >
      <n-skeleton
        v-if="QRCodeImage === undefined"
        :sharp="false"
        style="width: 100%; height: 0; padding-top: 100%"
      />
      <img v-else :src="QRCodeImage" style="width: 100%; border-radius: 3px" />
      <span v-if="QRCodeKey !== ''">{{ QRCodeKey }}</span>
      <span>状态: {{ loginMessage }}</span>
      <div style="width: 100%; display: flex; justify-content: flex-end; gap: 5px">
        <n-button strong secondary type="info" @click="openModalButtonClick">刷新</n-button>
        <n-button strong secondary type="primary" @click="loginButtonClick">登录</n-button>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { NButton, NTime, NModal, NSkeleton } from "naive-ui";
import QRCode from "qrcode";

import { useCounterStore } from "@/stores/counter";
import NaiveUIDiscreteAPI from "@/assets/NaiveUIDiscreteAPI";

const counter = useCounterStore();

const showModal = ref<boolean>(false);
const QRCodeImage = ref<string | undefined>(undefined);
const QRCodeKey = ref<string>("");

const loginMessage = ref<string>("未扫码");

const openModalButtonClick = async () => {
  QRCodeImage.value = undefined;
  loginMessage.value = "未扫码";
  showModal.value = true;

  const resp = await fetch(
    `https://${import.meta.env.Q_API_HostName}/api/login-bilibili/get-qrcode?token=${
      import.meta.env.Q_TOKEN
    }`
  );
  if (resp.status !== 200) {
    console.error(`获取二维码失败, resp.status error: ${resp.status}`);
    NaiveUIDiscreteAPI.message.error(`获取二维码失败, resp.status error: ${resp.status}`);
    return;
  }
  const resp_json = (await resp.json()) as {
    code: number;
    message: string;
    data: {
      url: string; // qr url
      qrcode_key: string;
    };
  };
  if (resp_json.code !== 200) {
    console.error(`获取二维码失败, resp_json.code error: (${resp_json.code})${resp_json.message}`);
    NaiveUIDiscreteAPI.message.error(
      `获取二维码失败, resp_json.code error: (${resp_json.code})${resp_json.message}`
    );
    return;
  }
  QRCodeKey.value = resp_json.data.qrcode_key;
  QRCodeImage.value = await QRCode.toDataURL(resp_json.data.url);
};

const loginButtonClick = async () => {
  const resp = await fetch(
    `https://${import.meta.env.Q_API_HostName}/api/login-bilibili/login?qrcode_key=${
      QRCodeKey.value
    }&token=${import.meta.env.Q_TOKEN}`
  );
  if (resp.status !== 200) {
    console.error(`登录失败, resp.status error: ${resp.status}`);
    NaiveUIDiscreteAPI.message.error(`登录失败, resp.status error: ${resp.status}`);
  }
  const resp_json = (await resp.json()) as {
    code: number;
    message: string;
    data:
      | {
          code: 86038;
          message: string;
          data: {
            url: string; // qr url
            qrcode_key: string;
          };
        }
      | {
          code: 0 | 86090 | 86101;
          message: string;
          timestamp: number;
        };
  };
  if (resp_json.code !== 200) {
    console.error(`登录失败, resp_json.code error: (${resp_json.code})${resp_json.message}`);
    NaiveUIDiscreteAPI.message.error(
      `登录失败, resp_json.code error: (${resp_json.code})${resp_json.message}`
    );
  }
  loginMessage.value = resp_json.data.message;
  if (resp_json.data.code === 0) {
    showModal.value = false;
    counter.latestUpdateBiliBiliLoginTS = resp_json.data.timestamp;
    NaiveUIDiscreteAPI.message.success("登录成功");
  } else {
    NaiveUIDiscreteAPI.message.warning(loginMessage.value);
    if (resp_json.data.code === 86038) {
      QRCodeImage.value = undefined;
      QRCodeKey.value = resp_json.data.data.qrcode_key;
      QRCodeImage.value = await QRCode.toDataURL(resp_json.data.data.url);
      loginMessage.value = "未扫码";
    }
  }
};
</script>
