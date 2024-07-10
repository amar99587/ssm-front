<template>
  <header-app v-if="$store.state.user != null" />
  <h6 v-if="!installed" @click="install" class="sm:hidden text-center font-black text-gray-600 dark:text-gray-400">
    Pour une meilleure expérience, installez l'app.
  </h6>
  <div class="full flex gap-4 overflow-y-auto" :class="{ 'flex-col sm:flex-row': $route.path.startsWith('/school') }">
    <router-view v-if="$store.state.user != null"
      class="full bg-White rounded-v p-4 overflow-y-auto break-words smooth -border-pro" />
    <div v-else class="w-full flex-center bg-White rounded-v p-4 break-words uppercase -border-pro">STARTING...</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import headerApp from "@/components/header.vue";

const installed = ref(true);
let deferredPrompt;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  installed.value = false;
});

const install = () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(choice => {
      if (choice.outcome == 'accepted') {
        console.log('PWA installed');
      }
      installed.value = true;
    });
    deferredPrompt = null;
  }
};
</script>
