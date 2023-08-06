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

import API from "@/assets/API";
import type { TodoData } from "@/types/todo";
import { useCounterStore } from "@/stores/counter";
import DataCard from "@/components/Todo/DataCard.vue";
import ViewModal from "@/components/Todo/ViewModal.vue";

const counter = useCounterStore();

const showViewModal = ref<boolean>(false);
const viewModalData = ref<TodoData | undefined>(undefined);
const viewModalCreateValue = ref<boolean | undefined>(undefined);

const todoData = ref<TodoData[]>([]);

const main = async () => {
  const resp_json = await API<TodoData[]>("获取 Todo", "/api/todo", "GET");
  if (resp_json) {
    todoData.value = resp_json.data;
  }
};
main();
</script>
