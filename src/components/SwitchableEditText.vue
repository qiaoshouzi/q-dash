<template>
  <span
    v-if="!showInput"
    style="display: block; width: 100%"
    @click="
      async () => {
        if (props.edit) {
          showInput = true;
          await nextTick();
          inputInstRef?.focus();
        } else {
          emit('click');
        }
      }
    "
  >
    {{ props.value }}
  </span>
  <n-input
    v-else
    :value="props.value"
    @update:value="(v) => emit('update:value', v)"
    clearable
    type="text"
    :size="props.inputSize"
    placeholder="请输入..."
    ref="inputInstRef"
    @blur="() => (showInput = false)"
  />
</template>

<script setup lang="ts">
import { ref, nextTick, type PropType } from "vue";
import { NInput, type InputInst } from "naive-ui";

const props = defineProps({
  value: {
    type: String,
    required: true,
  },
  edit: {
    type: Boolean,
    required: true,
  },
  inputSize: {
    type: String as PropType<"tiny" | "small" | "medium" | "large">,
    default: "tiny",
  },
});
const emit = defineEmits<{
  click: [];
  "update:value": [v: string];
}>();

const showInput = ref<boolean>(false);
const inputInstRef = ref<InputInst | null>(null);
</script>
