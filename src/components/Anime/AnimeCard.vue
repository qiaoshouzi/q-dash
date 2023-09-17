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
          <n-tag :bordered="false" :type="typeData[animeData.type].tagType" size="small">
            {{ typeData[animeData.type].text }}
          </n-tag>
          <div v-if="animeData.startTime !== null" class="bili-dyn-card-video__desc">
            {{ animeData.startTime }} 开始放送
          </div>
          <div
            v-if="animeData.updateTime !== null || animeData.ep !== null"
            class="bili-dyn-card-video__desc"
          >
            <n-text
              v-if="animeData.updateTime.week !== null || animeData.updateTime.time !== null"
              :type="
                animeData.updateTime.week === today && animeData.type === 'follow'
                  ? 'success'
                  : animeData.updateTime.week === props.selectDay && animeData.type === 'follow'
                  ? 'warning'
                  : 'default'
              "
            >
              <span v-if="animeData.updateTime.week !== null">
                每周{{ animeData.updateTime.week }}
              </span>
              <span
                v-if="animeData.updateTime.week !== null && animeData.updateTime.time !== null"
                style="margin: 0 2px"
              ></span>
              <span v-if="animeData.updateTime.time !== null">
                {{ animeData.updateTime.time }}
              </span>
              <span>更新</span>
            </n-text>
            <span
              v-if="
                (animeData.updateTime.week !== null || animeData.updateTime.time !== null) &&
                animeData.ep !== null
              "
            >
              |
            </span>
            <span v-if="animeData.ep !== null">共{{ animeData.ep }}话</span>
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
import { NTag, NButton, NImage, NText } from "naive-ui";

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
  selectDay: {
    type: String,
  },
});
const emit = defineEmits(["editButtonClick"]);
const counter = useCounterStore();

const today = new Date().toLocaleString("zh-CN", { weekday: "short" }).replace("周", "");

const animeData = ref<AnimeData>(props.data);
watch(props, (value) => (animeData.value = value.data));

const typeData: {
  [key: string]: {
    text: string;
    tagType: "info" | "success" | "warning" | "error";
  };
} = {
  follow: {
    text: "追番",
    tagType: "success",
  },
  repair: {
    text: "补番",
    tagType: "warning",
  },
  want: {
    text: "想看",
    tagType: "info",
  },
  end: {
    text: "完结",
    tagType: "error",
  },
};
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
