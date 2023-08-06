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

import API from "@/assets/API";
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

      const resp_json = await API<undefined>("批量删除动态", "/api/dynamic", "DELETE", {
        param: { scope: scope },
      });
      if (resp_json) {
        showModal.value = false;
        emit("update");
      }
    },
  });
};
</script>
