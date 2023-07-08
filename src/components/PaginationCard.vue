<template>
  <n-pagination
    v-if="counter.pageSize === 'pc'"
    :page="props.nowPage"
    @update:page="($event) => emit('update:nowPage', $event)"
    :page-size="props.pageSize"
    @update:page-size="($event) => emit('update:pageSize', $event)"
    :page-count="props.pageCount"
    :page-sizes="[10, 20, 30, 40]"
    show-size-picker
  >
    <template #prefix>共有 {{ props.dynamicLength }} 条动态</template>
  </n-pagination>
  <div v-else style="width: 100%">
    <n-space align="center">
      <span
        >共有 {{ props.dynamicLength }} 条动态 | {{ props.nowPage }} /
        {{ props.pageCount }} 页</span
      >
      <n-select
        size="small"
        :value="props.pageSize"
        @update:value="(value) => emit('update:pageSize', value)"
        :options="selectOptions"
        style="width: 85px"
      />
    </n-space>
    <div style="margin-top: 5px; display: flex; justify-content: space-between; gap: 5px">
      <n-button
        size="small"
        type="primary"
        block
        strong
        secondary
        style="flex: 1"
        :disabled="props.nowPage <= 1"
        @click="emit('update:nowPage', props.nowPage - 1)"
      >
        上一页
      </n-button>
      <n-button
        size="small"
        type="primary"
        block
        strong
        secondary
        style="flex: 1"
        :disabled="props.nowPage >= props.pageCount"
        @click="emit('update:nowPage', props.nowPage + 1)"
      >
        下一页
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type PropType } from "vue";
import { NButton, NSpace, NPagination, NSelect } from "naive-ui";

import { useCounterStore } from "@/stores/counter";

const props = defineProps({
  size: {
    type: String as PropType<"small" | "medium">,
    default: "medium",
  }, // 样式
  nowPage: {
    type: Number,
    required: true,
  }, // 当前页
  pageSize: {
    type: Number,
    default: 20,
  }, // 每页条数
  pageCount: {
    type: Number,
    required: true,
  }, // 总页数
  dynamicLength: {
    type: Number,
  }, // 动态总数
});
const emit = defineEmits(["update:nowPage", "update:pageSize"]);
const counter = useCounterStore();

const selectOptions = ref<
  {
    label: string;
    value: number;
  }[]
>([
  {
    label: "10/页",
    value: 10,
  },
  {
    label: "20/页",
    value: 20,
  },
  {
    label: "30/页",
    value: 30,
  },
  {
    label: "40/页",
    value: 40,
  },
]);
</script>
