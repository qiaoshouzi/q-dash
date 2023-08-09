<template>
  <n-card class="container" style="max-width: 350px" title="登录" size="small">
    <template #header>
      <div style="text-align: center">登录</div>
    </template>
    <div style="display: flex; flex-direction: column; gap: 5px">
      <n-button strong secondary size="large">
        <template #icon>
          <n-icon size="18">
            <GithubIcon />
          </n-icon>
        </template>
        通过 Github 登录
      </n-button>
      <n-button strong secondary type="success" size="large" @click="loginWithWebAuth">
        <template #icon>
          <n-icon size="24">
            <PasskeyIcon />
          </n-icon>
        </template>
        通过 WebAuth 登录
      </n-button>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { NCard, NButton, NIcon } from "naive-ui";
import { startAuthentication } from "@simplewebauthn/browser";
import type { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/typescript-types";

import API from "@/assets/API";
import GithubIcon from "@/icon/GithubIcon.vue";
import PasskeyIcon from "@/icon/PasskeyIcon.vue";
import NaiveUIDiscreteAPI from "@/assets/NaiveUIDiscreteAPI";

const router = useRouter();

const loginWithWebAuth = async () => {
  const optionsResp = await API<PublicKeyCredentialRequestOptionsJSON>(
    "Access获取登录Options",
    "/api/access/login/options",
    "POST",
    {
      body: {
        userName: "qiaoshouzi",
      },
    }
  );
  if (!optionsResp) return;

  const browserResponse = await startAuthentication(optionsResp.data).catch((e) => {
    console.error(e);
    NaiveUIDiscreteAPI.notification.error({
      title: "Login: WebAuth Error",
      content: `${e.name}: ${e.message}`,
      duration: 3500,
      keepAliveOnHover: true,
    });
    return null;
  });
  if (!browserResponse) return;

  const verificationResp = await API("Access登陆", "/api/access/login/verification", "POST", {
    body: {
      userName: "qiaoshouzi",
      rpID: location.hostname,
      expectedChallenge: optionsResp.data.challenge,
      browserResponse,
    },
  });
  if (verificationResp) {
    // 登陆成功
    await router.push("/");
  }
};
</script>
