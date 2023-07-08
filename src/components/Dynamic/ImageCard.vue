<template>
  <n-image-group>
    <div
      :style="{
        ...getRootStyle(props.pics.length, counter.pageSize),
      }"
      style="display: flex; flex-wrap: wrap; gap: 4px"
    >
      <n-image
        v-for="(value, key) in props.pics"
        :key="key"
        :src="getAssetsUrl('url' in value ? value.url : value.src)"
        lazy
        class="d-image-card"
        :style="
          getStyle(value.width, value.height, props.pics.length, counter.pageSize, props.forward)
            .div
        "
        style="border-radius: 4px"
        :img-props="{
          style: {
            ...getStyle(
              value.width,
              value.height,
              props.pics.length,
              counter.pageSize,
              props.forward
            ).image,
            position: 'absolute',
            left: '50%',
            transform: 'translate(-50%, var(--img-translateY))',
          },
        }"
      />
    </div>
  </n-image-group>
</template>

<script setup lang="ts">
import { type PropType } from "vue";
import { NImage, NImageGroup } from "naive-ui";

import { useCounterStore } from "@/stores/counter";

import { getAssetsUrl } from "@/assets/utils";

type Pics = (
  | {
      width: number;
      height: number;
      url: string;
    }
  | {
      width: number;
      height: number;
      src: string;
    }
)[];

const props = defineProps({
  pics: {
    type: Object as PropType<Pics>,
    required: true,
  },
  forward: {
    type: Boolean,
    required: true,
  },
});
const counter = useCounterStore();

const getRootStyle = (length: number, pageSize: "pc" | "phone") => {
  return {
    width: (() => {
      if (length > 1 && pageSize === "pc") {
        return `${160 * (length === 4 ? 2 : 3) + (length === 4 ? 1 : 2) * 4}px`;
      }
      return undefined;
    })(),
  };
};
const getStyle = (
  width: number,
  height: number,
  length: number,
  pageSize: "pc" | "phone",
  forward: boolean
) => {
  let divStyle = {
    width: "",
    height: "",
  };
  let imageStyle: {
    "--img-translateY": "-50%" | "0";
    top: "50%" | undefined;
    width: string | undefined;
    height: string | undefined;
  } = {
    "--img-translateY": "-50%",
    top: "50%",
    width: undefined,
    height: undefined,
  };

  if (pageSize === "pc") {
    // PC
    if (length <= 1) {
      // 单组图片
      // h:w >= 2.5 (w 240px, h 320px, view 显示顶部) (vw 240px, vh auto)
      if (height / width >= 2.5) {
        divStyle = {
          width: "240px",
          height: "320px",
        };
        imageStyle = {
          "--img-translateY": "0",
          top: undefined,
          width: "240px",
          height: "auto",
        };
      }
      // w > h (w 320px, h 等比缩小, view 不裁切) (vw 320px, vh auto)
      else if (width > height) {
        divStyle = {
          width: "320px",
          height: `${Math.ceil(height / (width / 320))}px`,
        };
        imageStyle = {
          ...imageStyle,
          width: "320px",
          height: "auto",
        };
      }
      // w < h (w 240px, h 320px, view 显示中心) (vw 240px, vh auto)
      else if (width < height) {
        divStyle = {
          width: "240px",
          height: "320px",
        };
        imageStyle = {
          ...imageStyle,
          width: "240px",
          height: "auto",
        };
      }
      // w:h = 1 (w 320px, h 320px, view 不裁切) (vw 320px, vh 320px)
      else if (width === height) {
        divStyle = {
          width: "320px",
          height: "320px",
        };
        imageStyle = {
          ...imageStyle,
          width: "320px",
          height: "320px",
        };
      }
    } else {
      // 多组图片 w,h 160px
      divStyle = {
        width: "160px",
        height: "160px",
      };
      // h:w >= 2.5 (view 显示顶部) (vw 160px)
      if (height / width >= 2.5) {
        imageStyle = {
          ...imageStyle,
          "--img-translateY": "0",
          top: undefined,
          width: "160px",
        };
      }
      // w > h (view 显示图片中心) (vh 160px)
      else if (width > height) {
        imageStyle = {
          ...imageStyle,
          height: "160px",
        };
      }
      // w < h (view 显示图片中心) (vw 160px)
      else if (width < height) {
        imageStyle = {
          ...imageStyle,
          width: "160px",
        };
      }
      // w:h = 1 (view 不裁切) (vw 160px, vh 160px)
      else if (width === height) {
        imageStyle = {
          ...imageStyle,
          width: "160px",
          height: "160px",
        };
      }
    }
  } else {
    // phone
    const innerWidth = window.innerWidth - (forward ? 66 : 32);
    if (length <= 1) {
      // 单组图片
      // h:w >= 2.5 (w 240px, h 320px, view 显示顶部) (vw 240px, vh auto) CU
      if (height / width >= 2.5) {
        divStyle = {
          width: "240px",
          height: "320px",
        };
        imageStyle = {
          "--img-translateY": "0",
          top: undefined,
          width: "240px",
          height: "auto",
        };
      }
      // w > h (w innerWidth, h 等比缩小, view 不裁切) (vw innerWidth, vh auto)
      else if (width > height) {
        divStyle = {
          width: `${innerWidth}px`,
          height: `${Math.ceil(height / (width / innerWidth))}px`,
        };
        imageStyle = {
          ...imageStyle,
          width: `${innerWidth}px`,
          height: "auto",
        };
      }
      // w < h (w 240px, h 320px, view 显示中心) (vw 240px, vh auto) CU
      else if (width < height) {
        divStyle = {
          width: "240px",
          height: "320px",
        };
        imageStyle = {
          ...imageStyle,
          width: "240px",
          height: "auto",
        };
      }
      // w:h = 1 (w 320px, h 320px, view 不裁切) (vw 320px, vh 320px) CU
      else if (width === height) {
        divStyle = {
          width: "320px",
          height: "320px",
        };
        imageStyle = {
          ...imageStyle,
          width: "320px",
          height: "320px",
        };
      }
    } else {
      // 多组图片
      const sideLength = length === 4 ? `${(innerWidth - 4) / 2}px` : `${(innerWidth - 8) / 3}px`;
      divStyle = {
        width: sideLength,
        height: sideLength,
      };
      // h:w >= 2.5 (view 显示顶部) (vw sideLength)
      if (height / width >= 2.5) {
        imageStyle = {
          ...imageStyle,
          "--img-translateY": "0",
          top: undefined,
          width: sideLength,
        };
      }
      // w > h (view 显示图片中心) (vh sideLength)
      else if (width > height) {
        imageStyle = {
          ...imageStyle,
          height: sideLength,
        };
      }
      // w < h (view 显示图片中心) (vw sideLength)
      else if (width < height) {
        imageStyle = {
          ...imageStyle,
          width: sideLength,
        };
      }
      // w:h = 1 (view 不裁切) (vw sideLength, vh sideLength)
      else if (width === height) {
        imageStyle = {
          ...imageStyle,
          width: sideLength,
          height: sideLength,
        };
      }
    }
  }

  return {
    div: divStyle,
    image: imageStyle,
  };
};
</script>

<style scoped>
.d-image-card {
  overflow: hidden;
  position: relative;
}
</style>
