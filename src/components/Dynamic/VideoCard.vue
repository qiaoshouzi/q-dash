<template>
  <a
    :href="props.archive.jump_url"
    target="_blank"
    class="bili-dyn-card-video"
    :style="{ 'flex-direction': counter.pageSize === 'pc' ? 'row' : 'column' }"
  >
    <div class="bili-dyn-card-video__header">
      <!-- 视频时长 -->
      <div
        v-if="'duration_text' in props.archive && props.archive.duration_text !== ''"
        class="bili-dyn-card-video__tag"
        style="background-color: rgb(0 0 0 / 65%); color: #fff; left: 8px; bottom: 8px"
      >
        {{ props.archive.duration_text }}
      </div>
      <!-- 标签 -->
      <div
        v-if="'badge' in props.archive"
        class="bili-dyn-card-video__tag"
        :style="{
          'background-color': props.archive.badge.bg_color,
          color: props.archive.badge.color,
        }"
        style="right: 8px; top: 8px"
      >
        {{ props.archive.badge.text }}
      </div>
      <!-- 背景图片 -->
      <div class="bili-dyn-card-video__cover">
        <div class="b-img">
          <picture class="b-img__inner">
            <img :src="getAssetsUrl(props.archive.cover)" loading="lazy" />
          </picture>
        </div>
      </div>
    </div>
    <div class="bili-dyn-card-video__body">
      <!-- 标题 -->
      <div class="bili-dyn-card-video__title bili-ellipsis">{{ props.archive.title }}</div>
      <!-- 简介 -->
      <div
        v-if="'desc' in props.archive && props.archive.desc !== ''"
        class="bili-dyn-card-video__desc bili-ellipsis"
      >
        {{ props.archive.desc }}
      </div>
      <!-- ex.70个内容 -->
      <div
        v-if="'sub_title' in props.archive && props.archive.sub_title !== ''"
        class="bili-dyn-card-video__desc bili-ellipsis"
      >
        {{ props.archive.sub_title }}
      </div>
    </div>
  </a>
</template>

<script setup lang="ts">
import { computed, type PropType } from "vue";

import { useCounterStore } from "@/stores/counter";

import type { DynamicItem } from "@/types/dynamics";
import { getAssetsUrl } from "@/assets/utils";

type Archive = DynamicItem["modules"]["module_dynamic"]["major"]["archive"];
type PGC = DynamicItem["modules"]["module_dynamic"]["major"]["pgc"];
type UGC = {
  jump_url: string;
  cover: string;
  title: string;
  duration_text: string;
};
type Common = DynamicItem["modules"]["module_dynamic"]["major"]["common"];
type Medialist = DynamicItem["modules"]["module_dynamic"]["major"]["medialist"];
type Courses = DynamicItem["modules"]["module_dynamic"]["major"]["courses"];
type UgcSeason = DynamicItem["modules"]["module_dynamic"]["major"]["ugc_season"];

const props = defineProps({
  archive: {
    type: Object as PropType<Archive | PGC | UGC | Common | Medialist | Courses | UgcSeason>,
    required: true,
  },
  width: {
    type: String,
  },
  height: {
    type: String,
  },
});
const counter = useCounterStore();

const rWidth = computed(() =>
  counter.pageSize === "pc" ? (props.width ? `${props.width}px` : "203px") : "auto"
);
const rHeight = computed(() =>
  counter.pageSize === "pc" ? (props.height ? `${props.height}px` : "129px") : "auto"
);
</script>

<style scoped>
.bili-dyn-card-video {
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 4px;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  /* height: 129px; */
  height: v-bind(rHeight);
  overflow: hidden;

  background-color: rgb(24, 24, 28);

  text-decoration: none;

  color: inherit;
}
.bili-dyn-card-video div {
  box-sizing: border-box;
}
.bili-dyn-card-video__header {
  flex-shrink: 0;
  height: 100%;
  position: relative;
  /* width: 203px; */
  width: v-bind(rWidth);
}
.bili-dyn-card-video__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  padding: 9px 12px 6px 16px;
  background-color: #1f1f1f !important;
}
.bili-dyn-card-video__title {
  -webkit-line-clamp: 2;
  /* color: #99a2aa; */
  color: rgba(255, 255, 255, 0.82);
  font-size: 14px;
  transition: color 0.2s;
}
.bili-dyn-card-video__desc {
  box-sizing: border-box;
  -webkit-line-clamp: 2;
  color: #666;
  font-size: 12px;
  max-height: 38px;
  line-height: 19px;
}
.bili-ellipsis {
  -webkit-box-orient: vertical;
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}
.bili-dyn-card-video__tag {
  border-radius: 2px;
  font-size: 12px;
  text-align: center;
  pointer-events: none;

  height: 18px;
  min-width: 32px;
  padding: 0 5px;

  display: flex;
  align-items: center;

  position: absolute;
  z-index: 1;
}
.bili-dyn-card-video__duration {
  position: absolute;
  left: 8px;
  bottom: 8px;
}
.bili-dyn-card-video__badge {
  right: 8px;
  top: 8px;
}
.bili-dyn-card-video__cover {
  height: 100%;
  position: relative;
  width: 100%;
}
.b-img {
  background-color: #f1f2f3;
  position: relative;
  height: 100%;
}
.b-img__inner {
  width: 100%;
  height: 100%;
  display: inline-block;
  vertical-align: middle;
}
.b-img__inner img {
  height: 100%;
  width: 100%;

  border-radius: inherit;

  display: block;
  object-fit: inherit;
}
</style>
