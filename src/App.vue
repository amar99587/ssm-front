<template>
  <header-app v-if="$store.state.user != null" />
  <div class="full flex gap-4 overflow-y-auto" :class="{ 'flex-col sm:flex-row': $route.path.startsWith('/school') }">
    <router-view v-if="$store.state.user != null" class="full bg-White rounded-v p-4 overflow-y-auto break-words smooth -border-pro" />
    <div v-else class="w-full flex-center bg-White rounded-v p-4 break-words uppercase -border-pro">STARTING...</div>
  </div>
</template>

<script setup>
import headerApp from "@/components/header.vue";
</script>