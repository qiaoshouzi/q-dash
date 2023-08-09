<template>
  <n-card class="container" style="max-width: 350px" title="登录" size="small">
    <template #header>
      <div style="text-align: center">登录</div>
    </template>
    <div style="display: flex; flex-direction: column; gap: 5px">
      <n-button strong secondary size="large" @click="toGithub()">
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
  <n-modal
    v-model:show="showCaptchaModal"
    preset="card"
    style="width: 332px"
    size="small"
    title="人机验证"
  >
    <div id="cf-captcha"></div>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useUrlSearchParams } from "@vueuse/core";
import { NCard, NButton, NIcon, NModal } from "naive-ui";
import { startAuthentication } from "@simplewebauthn/browser";
import type { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/typescript-types";

import API from "@/assets/API";
import { loadScript } from "@/assets/utils";
import GithubIcon from "@/icon/GithubIcon.vue";
import PasskeyIcon from "@/icon/PasskeyIcon.vue";
import NaiveUIDiscreteAPI from "@/assets/NaiveUIDiscreteAPI";

const w = window as any;
const router = useRouter();

const showCaptchaModal = ref<boolean>(false);
const getCaptchaToken = async (type: "WebAuth" | "Github"): Promise<string> => {
  if (typeof w.turnstile !== "object")
    await loadScript(
      "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback"
    );
  showCaptchaModal.value = true;
  await nextTick();
  return new Promise((reject, resolve) => {
    w.turnstile.render("#cf-captcha", {
      sitekey: "0x4AAAAAAAIgaVBcRonnVMw0",
      action: type,
      theme: "dark",
      callback: (token: string) => {
        showCaptchaModal.value = false;
        reject(token);
      },
      "error-callback": (e: any) => {
        console.error(e);
        NaiveUIDiscreteAPI.notification.error({
          title: "人机校验失败",
          content: e,
        });
        showCaptchaModal.value = false;
        resolve();
      },
    });
  });
};

const toGithub = () => {
  window.open("https://github.com/login/oauth/authorize?client_id=ce4f35536f672153f7aa");
};
const main = async () => {
  const params = useUrlSearchParams();
  if (params.from === "github" && params.code) {
    const captchaToken = await getCaptchaToken("Github");

    const resp_json = await API("Github登录", "/api/access/login/github", "POST", {
      body: {
        code: params.code,
        captchaToken,
      },
    });
    if (resp_json) {
      // 登陆成功
      await router.push("/");
    }
  }
};
main();

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

  const captchaToken = await getCaptchaToken("WebAuth");

  const verificationResp = await API("Access登陆", "/api/access/login/verification", "POST", {
    body: {
      captchaToken,
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
