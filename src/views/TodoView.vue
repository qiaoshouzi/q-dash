<template>
  <n-card
    title="Todo List"
    size="small"
    content-style="padding: 0"
    :bordered="counter.pageSize === 'pc'"
  >
    <template #header-extra>
      <n-button
        size="small"
        @click="
          () => {
            viewModalData = undefined;
            viewModalCreateValue = true;
            showViewModal = true;
          }
        "
      >
        新建待办
      </n-button>
    </template>
    <DataCard
      :data="todoData"
      @select="
        (data) => {
          viewModalData = data;
          viewModalCreateValue = undefined;
          showViewModal = true;
        }
      "
    />
  </n-card>
  <ViewModal
    v-if="viewModalData !== null"
    :data="viewModalData"
    v-model:show="showViewModal"
    :create="viewModalCreateValue"
    @click:delete="
      (v) => {
        todoData.forEach((d, index) => {
          console.log(index, d);
          if (d.id === v.id) {
            todoData.splice(index, 1);
            return;
          }
        });
      }
    "
    @update:data="(v) => {
      let t: boolean = true;
      todoData.forEach((d, index) => {
        if (d.id === v.id) {
          todoData[index] = v;
          t = false;
          viewModalData = v;
          return;
        }
      })
      if (t) main();
    }"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { NCard, NButton } from "naive-ui";

import type { TodoData } from "@/types/todo";
import { useCounterStore } from "@/stores/counter";
import DataCard from "@/components/Todo/DataCard.vue";
import ViewModal from "@/components/Todo/ViewModal.vue";
import NaiveUIDiscreteAPI from "@/assets/NaiveUIDiscreteAPI";

const counter = useCounterStore();

const showViewModal = ref<boolean>(false);
const viewModalData = ref<TodoData | undefined>(undefined);
const viewModalCreateValue = ref<boolean | undefined>(undefined);

const todoData = ref<TodoData[]>([]);

const main = async () => {
  NaiveUIDiscreteAPI.loadingBar.start();
  try {
    const resp = await fetch(
      `https://${import.meta.env.Q_API_HostName}/api/todo?token=${import.meta.env.Q_TOKEN}`
    );
    if (resp.status !== 200) throw `status error: ${resp.status}`;
    const resp_json = (await resp.json()) as {
      code: number;
      message: string;
      data: TodoData[];
    };
    if (resp_json.code !== 200) throw `code error(${resp_json.code}): ${resp_json.message}`;
    todoData.value = resp_json.data;
    NaiveUIDiscreteAPI.loadingBar.finish();
  } catch (e) {
    NaiveUIDiscreteAPI.loadingBar.error();
    NaiveUIDiscreteAPI.message.error(`获取 todo 失败, ${e}`);
  }
};
main();
</script>
