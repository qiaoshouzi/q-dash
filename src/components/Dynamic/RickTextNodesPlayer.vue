<template>
  <div
    v-for="(value, key) in props.richTextNodes"
    :key="key"
    style="display: inline"
    class="bili-rich-text"
  >
    <!-- 普通文字: RICH_TEXT_NODE_TYPE_TEXT | 邮箱: RICH_TEXT_NODE_TYPE_MAIL -->
    <span v-if="['RICH_TEXT_NODE_TYPE_TEXT', 'RICH_TEXT_NODE_TYPE_MAIL'].includes(value.type)">
      <div v-for="(t, key) in value.text.split('\n')" :key="key" style="display: inline">
        <span>{{ t }}</span>
        <br v-if="value.text.split('\n').length - 1 > key" />
      </div>
    </span>
    <!-- 超链接: RICH_TEXT_NODE_TYPE_WEB -->
    <n-a
      v-else-if="value.type === 'RICH_TEXT_NODE_TYPE_WEB'"
      :href="value.jump_url"
      target="_blank"
      class="bili-rich-text-icon link"
    >
      {{ value.text }}
    </n-a>
    <!-- 标签: RICH_TEXT_NODE_TYPE_TOPIC -->
    <n-a
      v-else-if="value.type === 'RICH_TEXT_NODE_TYPE_TOPIC'"
      :href="value.jump_url"
      target="_blank"
    >
      {{ value.text }}
    </n-a>
    <!-- 投票: RICH_TEXT_NODE_TYPE_VOTE -->
    <n-a
      v-else-if="value.type === 'RICH_TEXT_NODE_TYPE_VOTE'"
      href="#"
      class="bili-rich-text-icon vote"
    >
      {{ value.text }}
    </n-a>
    <!-- 表情包: RICH_TEXT_NODE_TYPE_EMOJI -->
    <n-popover v-else-if="value.type === 'RICH_TEXT_NODE_TYPE_EMOJI'" trigger="hover">
      <template #trigger>
        <img
          :src="getAssetsUrl(value.emoji.icon_url)"
          :alt="value.emoji.text"
          style="width: 20px; height: 20px; vertical-align: sub"
        />
      </template>
      <img :src="getAssetsUrl(value.emoji.icon_url)" />
    </n-popover>
    <!-- 视频跳转: RICH_TEXT_NODE_TYPE_BV | 剧集: RICH_TEXT_NODE_TYPE_OGV_SEASON -->
    <n-a
      v-else-if="['RICH_TEXT_NODE_TYPE_BV', 'RICH_TEXT_NODE_TYPE_OGV_SEASON'].includes(value.type)"
      :href="value.jump_url"
      target="_blank"
      class="bili-rich-text-icon video"
    >
      {{ value.text }}
    </n-a>
    <!-- AT: RICH_TEXT_NODE_TYPE_AT -->
    <n-a
      v-else-if="value.type === 'RICH_TEXT_NODE_TYPE_AT'"
      :href="`https://space.bilibili.com/${value.rid}`"
    >
      {{ value.text }}
    </n-a>
    <!-- 互动抽奖: RICH_TEXT_NODE_TYPE_LOTTERY -->
    <n-a
      v-else-if="value.type === 'RICH_TEXT_NODE_TYPE_LOTTERY'"
      href="#"
      class="bili-rich-text-icon lottery"
    >
      {{ value.text }}
    </n-a>
    <!-- 商品: RICH_TEXT_NODE_TYPE_GOODS -->
    <n-a
      v-else-if="value.type === 'RICH_TEXT_NODE_TYPE_GOODS'"
      :href="value.jump_url"
      target="_blank"
      class="bili-rich-text-icon goods"
    >
      {{ value.text }}
    </n-a>
    <n-text v-else type="error" style="margin-left: 5px">
      Error RickTextNode: type = {{ value.type }}
    </n-text>
  </div>
</template>

<script setup lang="ts">
import { type PropType } from "vue";
import { NA, NText, NPopover } from "naive-ui";

import { getAssetsUrl } from "@/assets/utils";
import type { DynamicItem } from "@/types/dynamics";

type RichTextNodes = DynamicItem["modules"]["module_dynamic"]["desc"]["rich_text_nodes"];

const props = defineProps({
  richTextNodes: {
    type: Object as PropType<RichTextNodes>,
    required: true,
  },
});
</script>

<style>
a {
  text-decoration: none;
}

.bili-rich-text {
  font-family: Helvetica Neue, Helvetica, Arial, Microsoft Yahei, Hiragino Sans GB, Heiti SC,
    WenQuanYi Micro Hei, sans-serif;
  font-size: 14px;
  letter-spacing: 0.5px;
  line-height: 22px;
  white-space: pre-wrap;
  word-break: break-word;
}

/* ICON */
.bili-rich-text-icon::before {
  display: inline-block;

  content: "";
  vertical-align: text-bottom;
}

/* 超链接ICON */
.bili-rich-text-icon.link::before {
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAFgUlEQVRoQ+1ZW2wUZRg93z9dC0SgREWNCAYEgoilewGihigoCtjubgkICSQ8YIIB29mKDyY+8KA+KHZ2GyUgD14TUSLd2VqUQLjGW3a6LVc1KoYIRKNCUQJCO/OZmd2pWtydmbVd0qTzOHO+7z/nP99/HcIAf2iA88eggGvt4KADgw78zx4YLKFiOrAm3naPAC8G81wQJoGpjImPgbFXSNK25jr/Ibd5S+pAbdOhMbretYkICwsRZGCnJHyrttdVnnISUjIB0UT6boOxi0C3OJEyvzP4Jxg0T20IHimEL4mAiNI+nUnfQ8AomwwzvgPxBmJ8YxEmTAbTOiLc2UOYcRKQpidjVZ35RPS7gOp4e0igezeBRlhEmbtBVK92BjZhPRn/IraeRbiibTWYE0RUlnNiqyqHll0TAeFE+73E+k4A12fJ4DKDq1NyaFehsojE25YD/E4PhiiYrA+0/VdMvzlQE8/MFqx/AqKhVsPMlwAsSMZC+9yMgYiS3gGi+TkXFFUONZRUQDiuHSPgrlyjF5ikR9T6qs/ckDcxkUZtHgRM90znDqtysLKkAiJxrdnkweDfDZQ91CJXpd2SN3ELNx4e5bty5WwupjMpB3smgH/m6bcSmt/0xYhyQ1psSNLHqaf8Z7yQN7EPvPHDkIrzv5llZw18NRbyldQBr4R746OvdExiqduaYsF8IhkLTRhQAiKK9iwIL2YF4K1kLLiyzwVEXz402vB1LTVrnRhTGTwURMeJoeo6trSsC/5ajBPVCW2sMPgoEQ23+BPVqvUBc0xd9RQ1BiJK+x1M+gtgXmIvOL0zM3AOulGpPj3jRy8iahXtVh38JRHdnuv9TDIWDOTL4VlAJJGZC8P4EISRzsRoRVIOvOuMyyLmN2VuKjeMTwFMzFYOLgumquZY4Ks+ERBNaPcbjN0ElNsJmXk3E70umH/JvhPTAZZBYAPls1LytJ/dCFi8WRvZdRGfgzAlR54BWqbKgfcLxbt2IBzXZgIwN2TDsgn5FFPZ414Wp3xEqjdrw6RLOAAgVyqsG4TlqfrQVifxrgRUK5pfIuzv2dMwTneDZ7fGQiecGnD6bpG/iBYQ5ljdYm72hFiSb9D2zucoINyoTSPCQbvmmXFa8on7tq/1n3Qil63rb8vL9fObGSwIZY3JWFWHXe/XGfwEgZ8BUJHL1WUwoqlYsNVNbhNTUMBCJT3eBzLrcnS2d7yRN2NqEumlguk9J0LWTpWxyAt5RwERRWsDwV8seUtAYyZIQj9IoCH5RDCwgwU/l6oLtTsJdV1C4UR6ATFZVpp1aYBmtsSCGa8NmPjqDdqNQsJKEBYReCJAN5ibPGLaa7B4PtXg14rJW9CBsKJtIcKq3JS2UZWDa4ptpD/j8o6BiKIdt+dkFDgR9Sc5N7nzC4hr5+zZobPzD9++9Q92u0nYGxNp0iYk64LfFxPrJiavgHBcO2vfIvh8Q4dvWzP1gpuENsase0niVhDNYObX1FhorZd4t9hCDpgDy1oZdUgzvJyoauJHbib8uZ9Ak3Nj6LgqB6e6JeUFV8CB9EsEMhcZc1O1SZWDT7pJ/Fhjx21l1HUAROMtPPMlg6RHU7Lf3Cr0+ZNfgLkCCxy2p1ESYla+qw2bVe2rmXF6t3GAgLG5d54P814VFlyJw0r6bSJakXPhjBBiQb6L12hTppIN/SOAxmTxxR3m+1RARGmvAPQOEMbZTgD0JhNvSMkh67xaE09PJqZ1AK/8+zYN54ilOfa+xyspL3jHzVxUaZtikLHHy6WsIDzcXB866oVIsVhHAWZi19fijFZJ8q12cy1eLOHeca4E2EFX/5gAMeFr88cEk/ggJQesQV/Kx5OAUhJz29agALc91V+4QQf6q2fd5h3wDvwFXpAiTxhfyfEAAAAASUVORK5CYII=)
    50% / contain no-repeat;
  background-size: 20px 20px;
  height: 18px;
  width: 18px;
}

/* 抽奖ICON */
.bili-rich-text-icon.vote::before {
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsBAMAAADsqkcyAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAqUExURUdwTFiX01CQzFCQzFCQzFCQzFGRzVGRzVCQzFCQzFSUzlKRzVCQzFCRzUk1fo4AAAAOdFJOUwASoujP/1eDktUjQMVn55Nb9QAAAJZJREFUeAFjGIxAyFgRm7BraAgWUbZQpdAETGH2YAbTAkxhjkiGqQ0UCHOpaGMTXhoamoBF+GiQqQEWYdOC1EAswqEXtkbRQ5hxIzZhRtXQAizCHKGhsViEWYP2RGIRXhrNGzoIhQtSo6AJYmkYO1z4qPlUA2jyYY4sjoEJbw0NvQBNbLyhodEwYe7DbvCkmWKzgWHoAgAka2ZMx98I9wAAAABJRU5ErkJggg==)
    no-repeat 50%;
  background-size: cover;
  height: 18px;
  width: 18px;
}

/* 视频ICON */
.bili-rich-text-icon.video::before {
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAMAAAApWqozAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAEsUExURUdwTBiMzxuN0BiMzxiLzxiM0Cuq1ReLzxmM1heM0BiM0BqO0iCPzxeMzxiMzxqN0xeLzxiM0CKZ3RiLzxyR1hiL0BmN0RmN0BeN0BuN0RuP0kC//xeL0BeL0RmO0SuV1SGQ0zOZ/xeLzxiN0BeMzxeM0BuPzxiO0BuN1BqN0BiMzxeM0BmM0hiM0BiM0RmMzxmM0BmN0BiLzxeL0RiM0BiM0BqQ0ReM0BeMzxmO0xyQ0xmN0BqO0BiLzx2S0xiM0BeLzxiM0BeLzxiM0BuS0RyO0hiN0ReM0BiM0BeM0BiM0BmNzxiO0hmM0B+P1hiL0BmM0BmM0BiLzySS2xiMzxeM0BmM0lWq/xiN0BiM0ReM0BeL0BeL0CCf3xeL0RiM0BiM0BiMzyed2BeLz1xUB40AAABjdFJOUwDgJuvA1wbRH/6oWhD6qzr7lw/qJe5TkUw4OQTyTT0MFwW7QfGvMDYvMbaDPpJUW2hnS5qfuCd4/DQuXEbWI6ew2fC9HC10799tyXA/UhnYXUf1B8HHMwN9X+T9uQiE3u32DYnfGEYAAAGiSURBVDjL5VRXe4JAEAQBD1CxYNfExNhN77333nuf//8fgp6AIGp4Te6FZW++u92ZuWWYf7m83t/h/D6ZcJLEEdnn7wP1KAEYK6B4ekAj4RDAJuJpUUzHEywQCke6YaMCwAfN/yAPCFFn7GgMatKaSqqIDTqeGwMR7UmRIOZwdkQAyXWmvwmEzrrDUEWnC0UV4Q7OQmjVe19/rLTvDCBkZ1ABT4OnF43hWrlti4di0y0AytlNFrd5Db65bDKIgFVLH1gaVHH9wFSKgDQ7pG+y8FnAMhI0OMVz47M0BxT2h2kuAdkCJojr7Qg0WF0DLtabYRzEAuaQosEEjlupzMk2DjONKAXO4l+gRfIk8kb2PIuRJtWQ2v3tlXTwFHaM7G7BEayVkabBCu70Mo4OwDZbTFvLMBs805uZ1vy6RaUbtzVoUHeFj8ZnULNydqF1+ZiNOkOUEr7emPIrsDjTVRRD7swn+Jqm38Z8d7lNI11KmjOKe72M1GbR6nu91Meirszf7VnlHJ+VqwfrbhS4GzLm+EqJYqrf+HI3GF2OXJfD/K+tH/XYTy/QmY4nAAAAAElFTkSuQmCC)
    no-repeat 50%;
  background-size: 18px;
  height: 17px;
  width: 17px;
}

/* 互动抽奖ICON */
.bili-rich-text-icon.lottery::before {
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAYAAAAehFoBAAAABGdBTUEAALGPC/xhBQAABGhJREFUWAntWF1oHFUUPufOJmlK2qQSW0VCRX0QS5q/VbEixRdfWsQEo1UEqw+K1iaWPvRFpFRQ8MVYbaH6UCmopUXToj5UFFukPtTd5keCD1ErMSlWtE2iprvZmXv87mxmnc3O7M7GBnyYA8u9851zz/nuuefeOztEscQZiDMQZ6BcBricspKu90D6tpwtW5i4TUgmLcVnP9rZdcob13tMLH1x6CFNcjewJlaUtqwVJ4/v2PCrZ1Ntu2TC3QPpXcTyqgit8Adl5k8TzE+TJY22Le9Df1eRnuiyMD93or/rmB+P2l8S4Z630o9qR44SszDJESI+A/ItpHkHMr1WKT6lhVpI5A5MYJyY3gWhadK0FfoHmckRTmw60dd+LipRz65qwmaZcxfTZkmbWaknB/s6QTgvjw18ty7D2WFk9YYFaHhtPd37zrPJOc+mZyD1iiZ6CaTPDfYnTalUJaoqaxjr30ZuR9OMuv3eT9b4+fDF1kvA3zB9I4p5n5+swZrraR8ybibQ9cyh1EqDVSNVE8ZirjcBhOVCYCCWMQ8Xyyr0PQwTyGFSU1gF64+MdZOHR22rJiysRo1z1FLn9sMXijacwUXYMa0R0Xahn0eIeg+MoVzkFnj4W93Y/pOHR22rJvxxX9skNlva1OnM7OWDO/eP10UN1nsohZPj6hGTXdTwJ8cf+XdyUX2U3XR7v5LEyNjQneLgBPCLcAuxfo2EagD/jiUeFyVXXROtrkOlt7t9kRSozeb71AB7U/+rsTyz4LybSed1rgFybvEvbRs6vt17P9sLUEkTSvjxg6Nr5uZzn2P5kiWjlhXg1Mramgc+eH7jlaAwiSDQYCD7siGLpZvE3L8Js0N2G7AB17Dmgi+ctebmq4VuFL+sGSuk5+HnysIJEeJONolIMh+bdgUZFYKUKuUeF2P1BI6vM6X6cKT7zdQPYHgryqRnsK/rx3DLYk33/vObsVNPY3r52MVq9yl00+GGck+AhMUzAeOWBfLFCt3I5TKMUqA2O+ds6357uHBTRWEqjm02IxKlbsZYK8oYY2Pn7G2mRRlOmTZIyhC2cP87W4RoD9n2nqDBFTHRX4iNi7hqMbGDJbQkBvs7TlqkHsZ0v8SMSy6AYHdLR90YiGVimthhnkKPNf8AbKJpHPaNFt57a+pU0dnpt/P62XnnNOzXq4TaXGvxhIcHtbmsXu2QjIDwDF6GmoJs/FiZkvCb5furGtXEe091TJdqihFM0D34tdZTR19I/lysLX7afnioaXom+gKGlkSx2//PU0x4udciznCc4UUZiEtiUUKu+WOc4Wue0kUOo2VY8v8aMnOJVYvG/+fHgs+FGJUcRnuXwFca/IPYmrGzn+E94Xwlp9Bfb2xYy+uw/7OcPXx2unoTI4JEI2xZu8mxN4J0K96PWyP4dU2EuAdjKgvTBJkYESTS66Xxgw8gDTmdvU+JrKvoV6QTPOuVUvh+IZly9pr5Uo2q+xqfYP8qZxfr4gzEGYgzEC0D/wBWjX1o9a3J6AAAAABJRU5ErkJggg==)
    no-repeat 50%;
  background-size: cover;
  height: 18px;
  width: 22px;
}

.bili-rich-text-icon.goods::before {
  background: url(data:image/png;base64,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)
    no-repeat 50%;
  background-size: 80%;
  height: 17px;
  width: 17px;
}
</style>
