<template>
  <nav v-if="school" class="hidden sm:flex-between min-w-full sm:min-w-fit bg-White rounded-v overflow-x-auto sm:overflow-y-auto flex-col p-1 min-h-[48px] sm:h-auto -border-pro">
    <div class="h-full">
      <div class="grid grid-flow-col sm:grid-flow-row gap-1 overflow-auto">
        <router-link 
          v-for="({ path, name, icon }, index) in nav" :key="index" :to="`/school/${school.code}/${path}`"
          class="w-10 h-10 hover:bg-v rounded-v cursor-pointer smooth"
          :class="{ 'hidden': school.link?.type == 'owner' ? false : (index ? !school.link?.rules[path + ':access'] : false), 'bg-v': route.path.startsWith(`/school/${school.code}/${path}`) }"
          :title="name"
        >
          <icon-app :icon="icon" class="h-full mx-auto" />
        </router-link>
        <router-link to="/contactus" class="w-10 h-10 hover:bg-v flex-center rounded-v cursor-pointer smooth sm:hidden">
          <icon-app icon="fluent:chat-12-filled" />
        </router-link>
        <router-link to="/help" class="w-10 h-10 hover:bg-v flex-center rounded-v cursor-pointer smooth sm:hidden">
          <icon-app icon="fluent:question-circle-12-filled" />
        </router-link>
      </div>
    </div>
    <div class="hidden sm:grid gap-1 min-h-[40px]"> <!--  40px = 172px - (44px * 3) -->
      <!-- <a href="https://proecole.com/fr/index.html" target="_blank" title="Help" class="w-10 h-10 hover:bg-v flex-center rounded-v cursor-pointer smooth">
        <icon-app icon="fluent:question-circle-12-filled" />
      </a> -44px
      <a href="https://proecole.com/fr/index.html" target="_blank" title="Contact us" class="w-10 h-10 hover:bg-v flex-center rounded-v cursor-pointer smooth">
        <icon-app icon="fluent:chat-12-filled" />
      </a> -44px
      <a href="https://proecole.com/fr/index.html" target="_blank" title="Report a bug" class="w-10 h-10 hover:bg-v flex-center rounded-v cursor-pointer smooth">
        <icon-app icon="solar:bug-minimalistic-bold" />
      </a> -44px -->
      <div title="open/close nav bar" class="w-10 h-10 hover:bg-v hidden sm:flex-center rounded-v cursor-pointer smooth">
        <icon-app class="flip-if-rtl" icon="fluent:chevron-right-12-filled" />
      </div>
    </div>
  </nav>
  <router-view v-if="school" v-bind="$attrs" :school="school" class="-border-pro" />
  <div v-else v-bind="$attrs" class="flex-center">{{ getting }}</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router';
import store from '@/store';

const route = useRoute();

const nav = ref([
  {
    icon: "fluent:grid-24-filled",
    name: "Dashboard",
    path: "dashboard"
  },
  {
    icon: "fluent:people-12-filled",
    name: "Students",
    path: "students"
  },
  {
    icon: "solar:documents-bold",
    name: "Courses",
    path: "courses"
  },
  {
    icon: "fluent:person-accounts-20-filled",
    name: "Teachers",
    path: "teachers"
  },
  {
    icon: "fluent:calendar-ltr-24-filled",
    name: "Timetable",
    path: "timetable"
  },
  {
    icon: "fa6-solid:money-check-dollar",
    name: "Finance",
    path: "finance"
  },
  {
    icon: "majesticons:chart-pie",
    name: "Statistics",
    path: "statistics"
  },
  {
    icon: "fluent:settings-48-filled",
    name: "Settings",
    path: "settings"
  },
]);

const getting = ref(false);

const school = computed(() => store.state.school);
</script>