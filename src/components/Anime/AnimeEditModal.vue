<template>
  <n-modal
    :show="props.show"
    @update:show="(value) => emit('update:show', value)"
    preset="card"
    :title="`${props.isEdit ? 'Edit' : 'Add'} Anime Info`"
    style="width: 600px"
    size="small"
  >
    <n-image
      v-if="animeData.cover !== ''"
      width="200"
      style="border-radius: 3px; border: 1px solid rgba(255, 255, 255, 0.09)"
      :src="getAssetsUrl(animeData.cover)"
    />
    <br v-if="animeData.cover !== ''" />
    <n-button type="primary" size="small" @click="updateImageButtonClick">上传</n-button>
    <n-divider />
    <n-form size="small">
      <n-form-item label="标题">
        <n-input v-model:value="animeData.title" clearable />
      </n-form-item>
      <div style="display: flex; gap: 5px">
        <n-form-item label="状态" style="flex: 1">
          <n-select v-model:value="animeData.type" clearable :options="statusOptions" />
        </n-form-item>
        <n-form-item label="开播时间" style="flex: 1">
          <n-date-picker
            v-model:formatted-value="animeData.startTime"
            clearable
            type="date"
            value-format="yyyy.MM.dd"
            style="width: 100%"
          />
        </n-form-item>
      </div>
      <n-grid :cols="counter.pageSize === 'pc' ? 2 : 1" x-gap="5px">
        <n-gi>
          <n-form-item label="更新时间" style="flex: 1">
            <div style="width: 100%; display: flex; gap: 5px">
              <n-select
                v-model:value="animeData.updateTime.week"
                clearable
                :options="updateTimeOptions"
                style="flex: 1"
              />
              <n-time-picker
                v-model:formatted-value="animeData.updateTime.time"
                value-format="HH:mm"
                format="HH:mm"
                clearable
                style="flex: 1"
              />
            </div>
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="总话数" style="flex: 1">
            <n-input-number v-model:value="animeData.ep" clearable style="width: 100%" />
          </n-form-item>
        </n-gi>
      </n-grid>
    </n-form>
    <div style="display: flex; justify-content: flex-end; gap: 5px">
      <n-button
        v-if="props.isEdit"
        secondary
        type="error"
        size="small"
        :loading="deleteButtonLoading"
        @click="deleteButtonClick"
      >
        删除
      </n-button>
      <n-button
        secondary
        type="primary"
        size="small"
        :loading="updateDataButtonLoading"
        @click="updateDataButtonClick"
      >
        提交
      </n-button>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, watch, type PropType } from "vue";
import {
  NGi,
  NForm,
  NGrid,
  NImage,
  NInput,
  NModal,
  NButton,
  NSelect,
  NDivider,
  NFormItem,
  NDatePicker,
  NTimePicker,
  NInputNumber,
} from "naive-ui";

import API from "@/assets/API";
import { getAssetsUrl } from "@/assets/utils";
import type { AnimeData } from "@/types/anime";
import { useCounterStore } from "@/stores/counter";
import NaiveUIDiscreteAPI from "@/assets/NaiveUIDiscreteAPI";

const props = defineProps({
  isEdit: {
    type: Boolean,
    required: true,
  },
  show: {
    type: Boolean,
    required: true,
  },
  data: {
    type: Object as PropType<AnimeData>,
  },
});
const emit = defineEmits(["update:show", "refresh", "delete"]);
const counter = useCounterStore();

const statusOptions = [
  {
    label: "追番",
    value: "follow",
  },
  {
    label: "补番",
    value: "repair",
  },
  {
    label: "想看",
    value: "want",
  },
  {
    label: "完结",
    value: "end",
  },
];
const updateTimeOptions = [
  {
    label: "周一",
    value: "一",
  },
  {
    label: "周二",
    value: "二",
  },
  {
    label: "周三",
    value: "三",
  },
  {
    label: "周四",
    value: "四",
  },
  {
    label: "周五",
    value: "五",
  },
  {
    label: "周六",
    value: "六",
  },
  {
    label: "周日",
    value: "日",
  },
];

const animeData = ref<AnimeData>(
  props.data ?? {
    id: -1,
    cover: "",
    title: "",
    type: "follow",
    startTime: null,
    updateTime: {
      week: null,
      time: null,
    },
    ep: 12,
  },
);
watch(props, (value) => {
  if (value.data === undefined)
    animeData.value = {
      id: -1,
      cover: "",
      title: "",
      type: "follow",
      startTime: null,
      updateTime: {
        week: null,
        time: null,
      },
      ep: 12,
    };
  else animeData.value = value.data;
});

const updateImageButtonClick = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) {
      NaiveUIDiscreteAPI.message.warning("未选择图片");
      return;
    }
    if (animeData.value.cover.startsWith("blob:")) {
      URL.revokeObjectURL(animeData.value.cover);
    }
    animeData.value.cover = URL.createObjectURL(file);
  };
  input.click();
};

const updateDataButtonLoading = ref<boolean>(false);
const updateDataButtonClick = async () => {
  updateDataButtonLoading.value = true;

  const coverData = await (async () => {
    const coverUrl = animeData.value.cover;
    if (coverUrl.startsWith("blob:")) {
      return await fetch(coverUrl).then((resp) => resp.blob());
    } else return coverUrl;
  })();
  const formData = new FormData();
  formData.append("cover", coverData);
  formData.append(
    "data",
    JSON.stringify({
      id: animeData.value.id,
      title: animeData.value.title,
      type: animeData.value.type,
      startTime: animeData.value.startTime,
      updateTime: animeData.value.updateTime,
      ep: animeData.value.ep,
    }),
  );

  const resp_json = await API("更新Anime", "/api/anime", "POST", {
    body: formData,
  });
  if (resp_json) {
    if (animeData.value.cover.startsWith("blob:")) {
      URL.revokeObjectURL(animeData.value.cover);
    }
    emit("refresh");
  }
  updateDataButtonLoading.value = false;
};

const deleteButtonLoading = ref<boolean>(false);
const deleteButtonClick = async () => {
  deleteButtonLoading.value = true;
  NaiveUIDiscreteAPI.dialog.warning({
    title: "警告",
    content: "你确定要删除？",
    positiveText: "确定",
    negativeText: "不确定",
    onNegativeClick: () => {
      deleteButtonLoading.value = false;
    },
    onPositiveClick: async () => {
      const resp_json = await API("删除Anime", "/api/anime", "DELETE", {
        param: { id: animeData.value.id },
      });
      if (resp_json) {
        emit("delete");
      }
      deleteButtonLoading.value = false;
    },
  });
};

// 销毁 Blob URL
watch(props, (value) => {
  if (value.show === false) {
    if (animeData.value.cover.startsWith("blob:")) {
      URL.revokeObjectURL(animeData.value.cover);
    }
  }
});
</script>
