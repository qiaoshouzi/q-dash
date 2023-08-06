<template>
  <n-modal
    :show="props.show"
    @update:show="(v) => emit('update:show', v)"
    preset="card"
    style="width: 450px"
  >
    <template #header>
      <div style="display: flex; align-items: center; height: 28px">
        <n-tag
          v-if="!props.template"
          :type="
            todoData.list.filter((d) => d[1]).length === todoData.list.length &&
            todoData.list.length !== 0
              ? 'success'
              : 'warning'
          "
          :bordered="false"
          size="small"
          style="margin-right: 5px"
        >
          {{
            todoData.list.filter((d) => d[1]).length === todoData.list.length
              ? todoData.list.length !== 0
                ? "完成"
                : "无任务"
              : `${todoData.list.filter((d) => d[1]).length} / ${todoData.list.length}`
          }}
        </n-tag>
        <SwitchableEditText
          :value="todoData.title"
          @update:value="(v) => (todoData.title = v)"
          :edit="editMode"
          input-size="small"
        />
      </div>
    </template>
    <div style="display: flex; justify-content: flex-end; gap: 5px; margin-bottom: 5px">
      <n-button
        v-if="editMode"
        strong
        secondary
        size="small"
        type="primary"
        @click="
          () => {
            todoData.list.push(['新任务', false]);
          }
        "
      >
        新增
      </n-button>
      <n-button
        v-if="editMode"
        strong
        secondary
        size="small"
        type="error"
        :disabled="selectEditIndex === -1"
        @click="
          () => {
            todoData.list.splice(selectEditIndex, 1);
            selectEditIndex = -1;
          }
        "
      >
        删除
      </n-button>
      <n-button
        v-if="editMode"
        strong
        secondary
        size="small"
        :disabled="selectEditIndex <= 0"
        @click="
          () => {
            todoData.list = moveArrValue(todoData.list, selectEditIndex, -1);
            selectEditIndex--;
          }
        "
      >
        Up
      </n-button>
      <n-button
        v-if="editMode"
        strong
        secondary
        size="small"
        :disabled="selectEditIndex + 1 === todoData.list.length || selectEditIndex == -1"
        @click="
          () => {
            todoData.list = moveArrValue(todoData.list, selectEditIndex, 1);
            selectEditIndex++;
          }
        "
      >
        Down
      </n-button>
      <n-button v-if="!editMode" type="warning" size="small" @click="editMode = true">
        编辑
      </n-button>
      <n-button v-if="editMode" type="success" size="small" @click="editSaveButtonClick()">
        保存
      </n-button>
      <n-button
        v-if="!props.template"
        type="error"
        size="small"
        @click="
          () => {
            NaiveUIDiscreteAPI.dialog.warning({
              title: '警告',
              content: `你确定要删除这个${props.template ? '模板' : '待办'}?`,
              positiveText: '确定',
              negativeText: '不确定',
              onPositiveClick: () => deleteButtonClick(),
            });
          }
        "
      >
        删除
      </n-button>
    </div>
    <div v-if="!props.template" style="margin-bottom: 5px">
      <TemplateModal
        :todo-data="todoData"
        @select="
          (d) => {
            todoData = {
              id: todoData.id,
              title: d.title,
              list: d.list.map((v) => [v, false]),
            };
            editSaveButtonClick();
          }
        "
      />
    </div>
    <div
      v-for="([name, status], index) in todoData.list"
      :key="`${index}${editMode}`"
      style="width: 100%; display: flex; align-items: center; justify-content: flex-start"
    >
      <n-checkbox
        v-if="!editMode"
        :checked="status"
        @update:checked="(v) => checkboxValueUpdate(v, index)"
        size="large"
      />
      <n-radio
        v-else
        :checked="selectEditIndex === index"
        @update:checked="() => (selectEditIndex = index)"
        size="large"
      />
      <SwitchableEditText
        style="margin-left: 5px; width: 100%"
        :value="name"
        @update:value="(v) => (todoData.list[index][0] = v)"
        :edit="editMode"
        @click="() => (todoData.list[index][1] = !todoData.list[index][1])"
      />
    </div>
    <n-empty v-if="todoData.list.length === 0" description="无任务" />
  </n-modal>
</template>

<script setup lang="ts">
import { ref, watch, type PropType } from "vue";
import { NButton, NModal, NCheckbox, NRadio, NTag, NEmpty } from "naive-ui";

import API from "@/assets/API";
import type { TodoData } from "@/types/todo";
import { moveArrValue } from "@/assets/utils";
import NaiveUIDiscreteAPI from "@/assets/NaiveUIDiscreteAPI";
import TemplateModal from "@/components/Todo/TemplateModal.vue";
import SwitchableEditText from "@/components/SwitchableEditText.vue";

const props = defineProps({
  data: {
    type: Object as PropType<TodoData>,
    // required: true,
    default: () => ({
      id: -1,
      title: "新待办",
      list: [],
    }),
  },
  show: {
    type: Boolean,
    required: true,
  },
  create: {
    type: Boolean,
    default: false,
  },
  template: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits<{
  "update:show": [value: boolean];
  "update:data": [value: TodoData];
  "click:delete": [value: TodoData];
}>();

const editMode = ref<boolean>(false); // 编辑模式
const selectEditIndex = ref<number>(-1); // 编辑模式下选择数据的index

const todoData = ref<TodoData>(JSON.parse(JSON.stringify(props.data)));
watch(props, (props) => {
  todoData.value = JSON.parse(JSON.stringify(props.data));
  editMode.value = props.create || props.template;
  selectEditIndex.value = -1;
});

const checkboxValueUpdate = async (v: boolean, index: number) => {
  todoData.value.list[index][1] = v;
  const resp_json = await API<TodoData[]>("更新 Todo", "/api/todo", "POST", {
    body: todoData.value,
  });
  if (resp_json) {
    editMode.value = false; // 更新成功, 关闭 editMode
    emit("update:data", JSON.parse(JSON.stringify(todoData.value)));
  } else {
    todoData.value.list[index][1] = !v;
  }
};
const deleteButtonClick = async () => {
  // 删除 Todo
  const resp_json = await API<TodoData[]>("删除 Todo", "/api/todo", "DELETE", {
    param: { id: todoData.value.id },
  });
  if (resp_json) {
    emit("update:show", false); // 删除成功, 关闭窗口
    emit("click:delete", todoData.value);
  }
};
const editSaveButtonClick = async () => {
  if (props.template) {
    // 更新 Todo模板
    if (JSON.stringify(props.data) === JSON.stringify(todoData.value)) {
      NaiveUIDiscreteAPI.message.warning("无修改");
      editMode.value = false;
      return;
    }
    const resp_json = await API<TodoData[]>("更新 Todo模板", "/api/todo/template", "POST", {
      body: {
        ...todoData.value,
        list: todoData.value.list.map((v) => v[0]),
      },
    });
    if (resp_json) {
      emit("update:show", false);
    }
  } else {
    // 更新 Todo
    if (JSON.stringify(props.data) === JSON.stringify(todoData.value)) {
      NaiveUIDiscreteAPI.message.warning("无修改");
      editMode.value = false;
      return;
    }
    const resp_json = await API<TodoData[]>("更新 Todo", "/api/todo", "POST", {
      body: todoData.value,
    });
    if (resp_json) {
      if (todoData.value.id === -1) emit("update:show", false); // 创建成功, 关闭 Modal, 获取 id
      else editMode.value = false; // 更新成功, 关闭 editMode
    }
  }

  emit("update:data", JSON.parse(JSON.stringify(todoData.value)));
};
</script>
