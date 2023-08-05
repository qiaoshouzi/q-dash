<template>
  <n-button
    block
    strong
    secondary
    type="error"
    :size="counter.pageSize === 'pc' ? 'medium' : 'small'"
    @click="showModal = true"
  >
    批量删除
  </n-button>
  <n-modal v-model:show="showModal" preset="card" style="width: 300px" title="批量删除">
    <n-radio-group
      v-model:value="radioValue"
      size="large"
      style="display: flex; flex-direction: column"
    >
      <n-radio v-for="(value, index) in radioData" :key="index" :value="value.key">
        {{ value.label }}
      </n-radio>
    </n-radio-group>
    <div style="margin-top: 5px; display: flex; justify-content: flex-end">
      <n-button
        type="error"
        :size="counter.pageSize === 'pc' ? 'medium' : 'small'"
        @click="deleteButtonClick"
      >
        确定
      </n-button>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { NButton, NModal, NRadioGroup, NRadio } from "naive-ui";

import { useCounterStore } from "@/stores/counter";
import NaiveUIDiscreteAPI from "@/assets/NaiveUIDiscreteAPI";

const counter = useCounterStore();
const emit = defineEmits<{
  update: [];
}>();

const showModal = ref<boolean>(false);
const radioValue = ref<string | undefined>("1w");
const radioData = [
  {
    key: "1w",
    label: "A Week",
  },
  {
    key: "1m",
    label: "A Mouth",
  },
  {
    key: "3m",
    label: "A Quarter",
  },
  {
    key: "all",
    label: "All",
  },
];

const deleteButtonClick = () => {
  NaiveUIDiscreteAPI.dialog.warning({
    title: "警告",
    content: "你确定要删除？",
    positiveText: "确定",
    negativeText: "不确定",
    onPositiveClick: async () => {
      const scope = ((): number => {
        const nowTime = Math.floor(Date.now() / 1000);
        switch (radioValue.value) {
          case "1w":
            return nowTime - 7 * 24 * 60 * 60;
          case "1m":
            return nowTime - 31 * 24 * 60 * 60;
          case "3m":
            return nowTime - 3 * 31 * 24 * 60 * 60;
          default:
            return 0;
        }
      })();

      try {
        const resp = await fetch(
          `https://${import.meta.env.Q_API_HostName}/api/deleteDynamic?token=${
            import.meta.env.Q_TOKEN
          }&scope=${scope}`
        );
        if (resp.status !== 200) throw `status error: ${resp.status}`;
        const resp_json = (await resp.json()) as {
          code: number;
          message: string;
        };
        if (resp_json.code !== 200) throw `code error(${resp_json.code}): ${resp_json.message}`;
        NaiveUIDiscreteAPI.message.success(resp_json.message);
        NaiveUIDiscreteAPI.loadingBar.finish();
        showModal.value = false;
        emit("update");
      } catch (e) {
        NaiveUIDiscreteAPI.message.error(`删除失败, ${e}`);
        NaiveUIDiscreteAPI.loadingBar.error();
      }
    },
  });
};
</script>
