<template>
  <div
    style="display: flex; justify-content: space-between; flex-direction: column; gap: 5px"
    :style="{
      margin: counter.pageSize === 'pc' ? '0 0 10px 0' : '0 16px 10px 16px',
    }"
  >
    <PaginationCard
      v-model:now-page="nowPage"
      v-model:page-size="pageSize"
      :page-count="pageCount"
      :dynamic-length="dynamicList?.length"
    />
    <div style="display: flex; gap: 5px">
      <!-- 抓取管理 -->
      <n-button
        v-if="updateSwitch !== undefined"
        block
        strong
        secondary
        :type="updateSwitch ? 'warning' : 'success'"
        :size="counter.pageSize === 'pc' ? 'medium' : 'small'"
        @click="updateSwitchButtonClick"
        style="flex: 1"
      >
        {{ updateSwitch ? "停止抓取" : "继续抓取" }}
      </n-button>
      <!-- 前往固定动态 -->
      <n-button
        block
        strong
        secondary
        type="success"
        :disabled="counter.pinDynamicID === undefined"
        :size="counter.pageSize === 'pc' ? 'medium' : 'small'"
        @click="goPinDynamicButtonClick"
        style="flex: 1"
      >
        前往固定动态
      </n-button>
    </div>
    <!-- 登录管理 -->
    <LoginCard />
  </div>
  <!-- 显示动态 -->
  <div v-for="value in nowDynamicList" :key="value[0]" style="margin-bottom: 10px">
    <DynamicCard
      :dynamicID="value[0]"
      :raw="value[1]"
      :style="{
        'border-color': value[0] === counter.pinDynamicID ? '#63e2b7' : undefined,
      }"
    />
  </div>
  <!-- 获取失败 -->
  <n-card v-if="showErrorCard" style="margin-bottom: 10px">
    <n-result status="error" title="获取所有动态失败" :description="errorMessages" />
  </n-card>
  <!-- 底部分页 -->
  <div
    :style="{
      margin: counter.pageSize === 'pc' ? '10px 0 0 0' : '10px 16px 0 16px',
    }"
  >
    <PaginationCard
      v-model:now-page="nowPage"
      v-model:page-size="pageSize"
      :page-count="pageCount"
      :dynamic-length="dynamicList?.length"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { NCard, NResult, NButton } from "naive-ui";
import { useUrlSearchParams } from "@vueuse/core";

import { useCounterStore } from "@/stores/counter";

import LoginCard from "@/components/LoginCard.vue";
import NaiveUIDiscreteAPI from "@/assets/NaiveUIDiscreteAPI";
import PaginationCard from "@/components/PaginationCard.vue";
import DynamicCard from "@/components/Dynamic/DynamicCard.vue";

const counter = useCounterStore();

// error
const showErrorCard = ref<boolean>(false);
const errorMessages = ref<string>("");

// dynamicList
type DynamicList = [string, string?][]; // [id, raw?]
const dynamicList = ref<DynamicList | undefined>(undefined); // 所有动态
const dynamicListPages = computed<DynamicList[]>(() => {
  if (dynamicList.value === undefined) return [];
  return groupArray(dynamicList.value, pageSize.value);
}); // 动态分页列表
const nowDynamicList = computed<DynamicList>(() => {
  if (dynamicListPages.value.length === 0) return [];
  return dynamicListPages.value[nowPage.value - 1];
}); // 本页动态列表

// 分页
const nowPage = ref<number>(
  (() => {
    const params = useUrlSearchParams();
    if (params.page === undefined) {
      return 1;
    }
    return Number(params.page);
  })()
); // 当前页
watch(nowPage, (value) => {
  const params = useUrlSearchParams();
  params.page = String(value);
});
const pageCount = computed<number>(() => {
  if (dynamicListPages.value.length === 0) {
    return 0;
  }
  return dynamicListPages.value.length;
}); // 总页数
const pageSize = ref<number>(
  (() => {
    const pageSize = Number(window.localStorage.getItem("pageSize"));
    if (![10, 20, 30, 40].includes(pageSize)) {
      localStorage.setItem("pageSize", "20");
      return 20;
    } else return pageSize;
  })()
); // 每页数量
watch(pageSize, (value) => {
  window.localStorage.setItem("pageSize", String(value));
});

// 分页
const groupArray = (arr: any[], groupSize: number): any[][] => {
  return arr.reduce((result, current, index) => {
    if (index % groupSize === 0) {
      result.push(arr.slice(index, index + groupSize));
    }
    return result;
  }, []);
};

// updateSwitch
const updateSwitch = ref<boolean | undefined>(undefined); // 是否抓取开关
const updateSwitchButtonClick = () => {
  NaiveUIDiscreteAPI.dialog.warning({
    title: "警告",
    content: `确定要${updateSwitch.value ? "停止" : "继续"}抓取?`,
    positiveText: "确定",
    negativeText: "不确定",
    onPositiveClick: async () => {
      try {
        const resp = await fetch(
          `https://${import.meta.env.Q_API_HostName}/api/setUpdateSwitch?token=${
            import.meta.env.Q_TOKEN
          }`,
          {
            method: "POST",
            body: JSON.stringify({
              status: !updateSwitch.value,
            }),
          }
        );
        if (resp.status !== 200) {
          throw `Status Error: ${resp.status}`;
        } else {
          const resp_json = await resp.json();
          if (resp_json.code !== 200) {
            throw `resp code Error(${resp_json.code}): ${resp_json.code}`;
          } else {
            NaiveUIDiscreteAPI.message.success("修改成功");
            updateSwitch.value = !updateSwitch.value;
          }
        }
      } catch (e) {
        console.error(e);
        NaiveUIDiscreteAPI.message.error(`修改失败, ${e}`);
      }
    },
  });
};

// pinDynamic
const goPinDynamicButtonClick = () => {
  dynamicListPages.value.forEach((pages, index) => {
    pages.forEach((page) => {
      if (counter.pinDynamicID === page[0]) {
        nowPage.value = index + 1;
      }
    });
  });
};

// 获取data
const main = async () => {
  try {
    const resp = await fetch(
      `https://${import.meta.env.Q_API_HostName}/api/getAllDynamicData?token=${
        import.meta.env.Q_TOKEN
      }`
    );
    const resp_json = (await resp.json()) as {
      code: number;
      message: string;
      data: DynamicList;
    };
    if (resp_json.code !== 200) {
      showErrorCard.value = true;
      errorMessages.value = `${resp_json.code}: ${resp_json.message}`;
    } else {
      dynamicList.value = resp_json.data;
    }
  } catch (e) {
    showErrorCard.value = true;
    errorMessages.value = String(e);
  }

  try {
    const resp = await fetch(
      `https://${import.meta.env.Q_API_HostName}/api/getConfig?token=${import.meta.env.Q_TOKEN}`
    );
    const resp_json = (await resp.json()) as {
      code: number;
      message: string;
      data: { [key: string]: any };
    };
    if (resp_json.code !== 200) throw `code error(${resp_json.code}): ${resp_json.message}`;
    updateSwitch.value = (() => {
      const t = resp_json.data.updateSwitch;
      if (t === "true") return true;
      else if (t === "false") return false;
    })();
    counter.pinDynamicID = (() => {
      const t = resp_json.data.pin;
      if (/^\d+$/.test(t)) return t;
    })();
    counter.latestUpdateBiliBiliLoginTS = (() => {
      const t = JSON.parse(resp_json.data["bilibili-login"]);
      return t.ts;
    })();
  } catch (e) {
    NaiveUIDiscreteAPI.message.error(`获取config失败, ${e}`);
  }
};
main();
</script>
