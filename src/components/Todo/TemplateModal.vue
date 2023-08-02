<template>
  <div style="display: flex; justify-content: flex-end; gap: 5px">
    <n-button size="small" @click="saveTemplate">保存模板</n-button>
    <n-button
      size="small"
      @click="
        () => {
          showModal = true;
          getTemplate();
        }
      "
    >
      使用模板
    </n-button>
  </div>
  <n-modal v-model:show="showModal" preset="card" title="选择模板" style="width: 450px">
    <div style="display: flex; justify-content: flex-end; gap: 5px">
      <n-button
        strong
        secondary
        size="small"
        type="primary"
        @click="
          () => {
            viewModalData = {
              id: -1,
              title: '新模板',
              list: [],
            };
            showViewModal = true;
          }
        "
      >
        新增
      </n-button>
      <n-button
        strong
        secondary
        size="small"
        type="warning"
        :disabled="selectValueIndex === -1"
        @click="
          () => {
            showViewModal = true;
            viewModalData = {
              id: templateData[selectValueIndex].id,
              title: templateData[selectValueIndex].title,
              list: templateData[selectValueIndex].list.map((v) => [v, false]),
            };
          }
        "
      >
        编辑
      </n-button>
      <n-button
        strong
        secondary
        size="small"
        type="error"
        :disabled="selectValueIndex === -1"
        @click="deleteTemplate"
      >
        删除
      </n-button>
      <n-button
        size="small"
        type="primary"
        :disabled="selectValueIndex === -1"
        @click="
          () => {
            showModal = false;
            emit('select', templateData[selectValueIndex]);
          }
        "
      >
        应用
      </n-button>
      <n-button size="small" type="error" @click="() => (showModal = false)">取消</n-button>
    </div>
    <div
      v-for="(value, index) in templateData"
      :key="index"
      style="width: 100%; display: flex; align-items: center; justify-content: flex-start"
    >
      <n-radio
        :checked="selectValueIndex === index"
        @update:checked="() => (selectValueIndex = index)"
        size="large"
      />
      <span style="margin-left: 5px; width: 100%" @click="() => (selectValueIndex = index)">
        {{ value.title }}
      </span>
    </div>
  </n-modal>
  <ViewModal
    :data="viewModalData"
    @update:data="
      (d) => {
        if (d.id === -1) {
          getTemplate();
        } else {
          templateData.forEach((v, index) => {
            if (v.id === d.id) {
              templateData[index] = {
                ...d,
                list: d.list.map((v) => v[0]),
              };
              return;
            }
          });
        }
      }
    "
    v-model:show="showViewModal"
    :template="true"
  />
</template>

<script setup lang="ts">
import { ref, type PropType } from "vue";
import { NModal, NRadio, NButton } from "naive-ui";

import ViewModal from "./ViewModal.vue";
import type { TemplateData, TodoData } from "@/types/todo";
import NaiveUIDiscreteAPI from "@/assets/NaiveUIDiscreteAPI";

const props = defineProps({
  todoData: {
    type: Object as PropType<TodoData>,
    required: true,
  },
});
const emit = defineEmits<{
  select: [data: TemplateData];
}>();

const showModal = ref<boolean>(false);
const selectValueIndex = ref<number>(-1);

const showViewModal = ref<boolean>(false);
const viewModalData = ref<TodoData | undefined>(undefined);

const templateData = ref<TemplateData[]>([]);

const saveTemplate = async () => {
  try {
    const resp = await fetch(
      `https://${import.meta.env.Q_API_HostName}/api/todo/template?token=${
        import.meta.env.Q_TOKEN
      }`,
      {
        method: "POST",
        body: JSON.stringify({
          id: -1,
          title: props.todoData.title,
          list: props.todoData.list.map((v) => v[0]),
        }),
      }
    );
    if (resp.status !== 200) throw `status error: ${resp.status}`;
    const resp_json = (await resp.json()) as {
      code: number;
      message: string;
      data: TodoData[];
    };
    if (resp_json.code !== 200) throw `code error(${resp_json.code}): ${resp_json.message}`;
    NaiveUIDiscreteAPI.message.success(resp_json.message);
    NaiveUIDiscreteAPI.loadingBar.finish();
  } catch (e) {
    NaiveUIDiscreteAPI.loadingBar.error();
    NaiveUIDiscreteAPI.message.error(`更新 Todo模板 失败, ${e}`);
  }
};
const deleteTemplate = async () => {
  try {
    const resp = await fetch(
      `https://${import.meta.env.Q_API_HostName}/api/todo/template?token=${
        import.meta.env.Q_TOKEN
      }&id=${templateData.value[selectValueIndex.value].id}`,
      {
        method: "DELETE",
      }
    );
    if (resp.status !== 200) throw `status error: ${resp.status}`;
    const resp_json = (await resp.json()) as {
      code: number;
      message: string;
      data: TodoData[];
    };
    if (resp_json.code !== 200) throw `code error(${resp_json.code}): ${resp_json.message}`;
    NaiveUIDiscreteAPI.message.success(resp_json.message);
    NaiveUIDiscreteAPI.loadingBar.finish();
  } catch (e) {
    NaiveUIDiscreteAPI.loadingBar.error();
    NaiveUIDiscreteAPI.message.error(`删除 Todo模板 失败, ${e}`);
    return;
  }
  // 更新删除本地数据
  templateData.value.splice(selectValueIndex.value, 1);
  selectValueIndex.value = -1;
};
const getTemplate = async () => {
  NaiveUIDiscreteAPI.loadingBar.start();
  try {
    const resp = await fetch(
      `https://${import.meta.env.Q_API_HostName}/api/todo/template?token=${import.meta.env.Q_TOKEN}`
    );
    if (resp.status !== 200) throw `status error: ${resp.status}`;
    const resp_json = (await resp.json()) as {
      code: number;
      message: string;
      data: TemplateData[];
    };
    if (resp_json.code !== 200) throw `code error(${resp_json.code}): ${resp_json.message}`;
    templateData.value = resp_json.data;
    NaiveUIDiscreteAPI.loadingBar.finish();
  } catch (e) {
    NaiveUIDiscreteAPI.loadingBar.error();
    NaiveUIDiscreteAPI.message.error(`获取 Todo模板 失败, ${e}`);
  }
};
</script>
