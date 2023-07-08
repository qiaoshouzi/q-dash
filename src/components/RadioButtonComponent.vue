<template>
  <n-button-group :size="props.size">
    <n-button
      v-for="value in props.options"
      :key="value.key"
      :type="value.key === props.value ? 'primary' : 'default'"
      @click="emit('update:value', value.key)"
    >
      {{ value.label }}
    </n-button>
  </n-button-group>
</template>

<script setup lang="ts">
import { type PropType } from "vue";
import { NButton, NButtonGroup } from "naive-ui";

const props = defineProps({
  size: {
    type: String as PropType<"tiny" | "small" | "medium" | "large">,
    default: "medium",
  },
  value: {
    type: String,
    required: true,
  },
  options: {
    type: Object as PropType<
      {
        label: string;
        key: string;
      }[]
    >,
    required: true,
  },
});
const emit = defineEmits(["update:value"]);
</script>
