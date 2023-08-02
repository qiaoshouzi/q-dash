<template>
  <n-data-table
    :columns="tableColumns"
    :data="props.data"
    :row-props="tableProps"
    :bordered="false"
  />
</template>

<script setup lang="ts">
import { h, ref, type PropType } from "vue";
import { NText, NButton, NDataTable } from "naive-ui";
import type { DataTableColumns } from "naive-ui";

import type { TodoData } from "@/types/todo";

const props = defineProps({
  data: {
    type: Object as PropType<TodoData[]>,
  },
});
const emit = defineEmits<{
  select: [data: TodoData];
}>();

const tableColumns = ref<DataTableColumns<TodoData>>([
  {
    title: "Title",
    key: "title",
  },
  {
    title: "Status",
    key: "status",
    width: "80",
    render(row) {
      const success = row.list.filter((d) => d[1]).length;
      const total = row.list.length;
      if (success === total) {
        return h(NText, { type: "success" }, { default: () => "完成" });
      } else {
        return h(NText, { type: "warning" }, { default: () => `${success}/${total}` });
      }
    },
  },
  {
    title: "Action",
    key: "actions",
    width: "72",
    render() {
      // Click 交给 tableProps.onClick 处理
      return h(
        NButton,
        {
          strong: true,
          secondary: true,
          size: "small",
          type: "info",
        },
        { default: () => "查看" }
      );
    },
  },
]);

const tableProps = (row: TodoData) => {
  return {
    onClick: () => emit("select", row),
  };
};
</script>
