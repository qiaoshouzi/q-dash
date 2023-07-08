<template>
  <div
    :style="{
      width: `${props.width}px`,
    }"
    style="display: flex; gap: 5px"
  >
    <n-image
      :src="getAssetsUrl(animeData.cover)"
      :width="counter.pageSize === 'pc' ? '150' : '100'"
      style="border-radius: 3px; border: 1px solid rgba(255, 255, 255, 0.09)"
    />
    <div style="width: 100%; display: flex; flex-direction: column; justify-content: space-between">
      <span class="bili-dyn-card-video__title bili-ellipsis">{{ animeData.title }}</span>
      <div style="display: flex; align-items: flex-end; justify-content: space-between">
        <div>
          <n-tag v-if="animeData.type === 'follow'" :bordered="false" type="success" size="small">
            追番
          </n-tag>
          <n-tag
            v-else-if="animeData.type === 'repair'"
            :bordered="false"
            type="warning"
            size="small"
          >
            补番
          </n-tag>
          <n-tag v-else-if="animeData.type === 'want'" :bordered="false" type="info" size="small">
            想看
          </n-tag>
          <div class="bili-dyn-card-video__desc">{{ animeData.startTime }} 开始放送</div>
          <div class="bili-dyn-card-video__desc">
            每周{{ animeData.updateTime }}更新 | 共{{ animeData.ep }}话
          </div>
        </div>
        <div style="display: flex; gap: 5px">
          <n-button type="info" size="small" @click="emit('editButtonClick')">编辑</n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, type PropType } from "vue";
import { NTag, NButton, NImage } from "naive-ui";

import { useCounterStore } from "@/stores/counter";

import type { AnimeData } from "@/types/anime";
import { getAssetsUrl } from "@/assets/utils";

const props = defineProps({
  width: {
    type: Number,
    required: true,
  },
  data: {
    type: Object as PropType<AnimeData>,
    required: true,
  },
});
const emit = defineEmits(["editButtonClick"]);
const counter = useCounterStore();

const animeData = ref<AnimeData>(props.data);
watch(props.data, (value) => (animeData.value = value));
</script>

<style scoped>
.bili-dyn-card-video__title {
  -webkit-line-clamp: 2;
  font-size: 18px;
}
.bili-dyn-card-video__desc {
  font-size: 12px;
  line-height: 19px;
}
.bili-ellipsis {
  -webkit-box-orient: vertical;
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}
</style>
