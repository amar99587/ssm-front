<template>
  <dialog ref="dialog" class="top-0 h-full w-full p-4 m-0 bg-gray-800 text-white bg-opacity-25 dark:bg-opacity-75 z-50" style="margin: 0;">
    <div class="w-full sm:w-10/12 md:w-5/12 lg:w-3/12 bg-White p-4 rounded-v border-pro space-y-4">
      <div class="flex-between pb-2">
        <h3>{{ title }}</h3>
        <icon-app @click="emits('close', $event.target.value)" :class="{ 'cursor-pointer': canClose }" icon="fa6-solid:xmark" size="24" />
      </div>
      <form @submit.prevent="submitForm" class="space-y-2">
        <slot />
      </form>
    </div>
  </dialog>
</template>

<script setup>
import { ref } from 'vue'

const dialog = ref(null);

const open = () => dialog.value.classList.add('flex-center');
const close = () => dialog.value.classList.remove('flex-center');

defineProps(["title", "canClose"]);
defineExpose({ open, close });

const emits = defineEmits(["close"]);
</script>