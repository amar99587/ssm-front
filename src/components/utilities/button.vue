<template>
    <button dir="auto" :type="type" 
        class="h-9 w-fit flex items-center rounded-v gap-3 px-4 py-2 smooth"
        :class="{ 'bg-[#1f2937] dark:bg-gray-700 text-white': dark, 'bg-[#e5e7eb] dark:bg-gray-600': !dark, '-border-pro opacity-70 cursor-default': loading || disabled, 'hover:opacity-80': !(loading || disabled) }" 
        :style="`background: ${bg}; color: ${color};`"
    >
        <icon-app v-if="icon" :icon="loading ? 'svg-spinners:ring-resize' : icon" class="w-5 m-auto" />
        <h5 v-if="text" class="w-full text-center truncate">{{ text }}</h5>
    </button>
</template>
  
<script setup>
defineProps({
    text: String,
    icon: String,
    type: String,
    color: String,
    bg: String,
    dark: Boolean,
    loading: Boolean,
    disabled: Boolean,
});
</script>