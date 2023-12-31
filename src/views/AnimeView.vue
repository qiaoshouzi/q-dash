<template>
  <n-card title="Anime" size="small" id="anime-card" :bordered="counter.pageSize === 'pc'">
    <template #header-extra>
      <div style="display: flex; gap: 5px">
        <RadioButton v-model:value="radioButtonValue" :options="radioButtonOptions" size="small" />
        <!-- 添加按钮 -->
        <n-button
          size="small"
          type="primary"
          @click="
            () => {
              animeEditIsEdit = false;
              animeEditData = undefined;
              animeEditDataIndex = undefined;
              animeEditModalShow = true;
            }
          "
        >
          添加
        </n-button>
      </div>
    </template>
    <n-collapse-transition :show="radioButtonValue === 'follow'">
      <n-scrollbar x-scrollable trigger="none">
        <n-timeline
          horizontal
          style="white-space: nowrap; margin-bottom: 10px; justify-content: center"
        >
          <n-timeline-item
            v-for="(value, key) in daysOfWeek"
            :key="key"
            :type="value === today ? 'success' : value === selectDay ? 'warning' : 'default'"
          >
            <n-button
              quaternary
              size="tiny"
              :type="value === today ? 'success' : value === selectDay ? 'warning' : 'default'"
              @click="selectDay = value"
            >
              星期{{ value }}
            </n-button>
          </n-timeline-item>
        </n-timeline>
      </n-scrollbar>
    </n-collapse-transition>
    <!-- AnimeCard -->
    <n-scrollbar
      v-if="animeDataType.length > 0"
      :style="{ 'max-height': counter.pageSize === 'pc' ? '700px' : undefined }"
    >
      <div style="display: flex; flex-wrap: wrap; gap: 5px; padding-right: 12px">
        <AnimeCard
          v-for="value in animeDataType"
          :key="JSON.stringify(value)"
          :width="animeCardWidth"
          :data="value"
          :select-day="selectDay"
          @edit-button-click="
            () => {
              animeEditIsEdit = true;
              animeEditData = Object.create(value);
              animeEditDataIndex = value.index;
              animeEditModalShow = true;
            }
          "
        />
      </div>
    </n-scrollbar>
    <n-empty v-else description="无数据" />
  </n-card>
  <AnimeEditModal
    v-model:show="animeEditModalShow"
    :is-edit="animeEditIsEdit"
    :data="animeEditData"
    @refresh="
      () => {
        animeEditModalShow = false;
        main();
      }
    "
    @delete="
      () => {
        animeEditModalShow = false;
        if (animeEditDataIndex !== undefined) animeData.splice(animeEditDataIndex, 1);
      }
    "
  />
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import {
  NCard,
  NEmpty,
  NButton,
  NTimeline,
  NScrollbar,
  NTimelineItem,
  NCollapseTransition,
} from "naive-ui";

import API from "@/assets/API";
import type { AnimeData } from "@/types/anime";
import { useCounterStore } from "@/stores/counter";
import AnimeCard from "@/components/Anime/AnimeCard.vue";
import RadioButton from "@/components/RadioButtonComponent.vue";
import AnimeEditModal from "@/components/Anime/AnimeEditModal.vue";

const counter = useCounterStore();

// Timeline
const today = new Date().toLocaleString("zh-CN", { weekday: "short" }).replace("周", "");
const selectDay = ref<string | undefined>(today);
const daysOfWeek = ["一", "二", "三", "四", "五", "六", "日"];

const animeData = ref<AnimeData[]>([]);
const animeDataType = computed(() => {
  return animeData.value
    .map((value, index) => {
      return {
        index,
        ...value,
      };
    })
    .filter((value) => value.type === radioButtonValue.value)
    .sort((a, b) => {
      if (a.updateTime.week === selectDay.value || b.updateTime.week === null) return -1;
      else if (b.updateTime.week === selectDay.value || a.updateTime.week === null) return 1;
      else return daysOfWeek.indexOf(a.updateTime.week) - daysOfWeek.indexOf(b.updateTime.week);
    });
});

// RadioButton
const radioButtonOptions = [
  {
    label: "追番",
    key: "follow",
  },
  {
    label: "补番",
    key: "repair",
  },
  {
    label: "想看",
    key: "want",
  },
  {
    label: "完结",
    key: "end",
  },
];
const radioButtonValue = ref<string>("follow");
watch(radioButtonValue, () => (selectDay.value = today));

// Anime Edit Data
const animeEditIsEdit = ref<boolean>(false);
const animeEditData = ref<AnimeData | undefined>(undefined);
const animeEditDataIndex = ref<number | undefined>(undefined);
const animeEditModalShow = ref<boolean>(false);

// 计算宽度
const animeCardWidth = ref<number>(0);
const resizeEvent = () => {
  const width =
    document
      .getElementById("anime-card")
      ?.getElementsByClassName("n-card__content")[0]
      .getBoundingClientRect().width ?? 0;
  if (counter.pageSize === "pc") {
    animeCardWidth.value = (width - 32 - 5 - 12) / 2;
  } else {
    animeCardWidth.value = width - 32;
  }
};
window.addEventListener("resize", () => resizeEvent());
onMounted(() => resizeEvent());

const main = async () => {
  const resp_json = await API<AnimeData[]>("获取Anime", "/api/anime", "GET");
  if (resp_json) {
    animeData.value = resp_json.data;
  }
};
main();
</script>
