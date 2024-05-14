<template>
    <div @:click="emits('update', !value)" class="flex items-center px-1 min-w-[3rem] h-7 bg-v rounded-full cursor-pointer smooth border-pro">
        <div class="w-4 h-4 rounded-full smooth" :class="{ 'bg-gray-500': !value, 'bg-gray-800 dark:bg-gray-300 translate-x-[120%]': value }" />
    </div>
</template>

<script setup>
defineProps(["value"]);
const emits = defineEmits(["update"]);
</script>