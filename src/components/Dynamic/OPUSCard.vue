<template>
  <a class="opus" :href="props.opus.jump_url" target="_blank">
    <div class="title">{{ props.opus.title }}</div>
    <RickTextNodesPlayer :rich-text-nodes="props.opus.summary.rich_text_nodes" />
    <span style="color: #63e2b7" class="bili-rich-text">全文</span>
  </a>
  <br />
  <ImageCard :pics="props.opus.pics" :forward="props.forward" />
  <!-- 94 -->
</template>

<script setup lang="ts">
import { type PropType } from "vue";

import type { DynamicItem } from "@/types/dynamics";

import ImageCard from "@/components/Dynamic/ImageCard.vue";
import RickTextNodesPlayer from "@/components/Dynamic/RickTextNodesPlayer.vue";

const props = defineProps({
  opus: {
    type: Object as PropType<DynamicItem["modules"]["module_dynamic"]["major"]["opus"]>,
    required: true,
  },
  forward: {
    type: Boolean,
    required: true,
  },
});
</script>

<style scoped>
.opus {
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}
.title {
  box-sizing: border-box;

  -webkit-line-clamp: 2;
  font-size: 15px;
  font-weight: 700;
  line-height: 25px;

  -webkit-box-orient: vertical;
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}
</style>
