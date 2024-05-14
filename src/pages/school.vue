<template>
  <nav v-if="school" class="hidden sm:flex-between min-w-full sm:min-w-fit bg-White rounded-v overflow-x-auto sm:overflow-y-auto flex-col p-1 min-h-[48px] sm:h-auto -border-pro">
    <div class="h-full">
      <div class="grid grid-flow-col sm:grid-flow-row gap-1 overflow-auto">
        <router-link 
          v-for="({ path, name, icon }, index) in nav" :key="index" :to="`/school/${code}/${path}`"
          class="w-10 h-10 hover:bg-v rounded-v cursor-pointer smooth"
          :class="{ 'hidden': index ? !school.link?.rules[path + ':access'] : false, 'bg-v': route.path.startsWith(`/school/${code}/${path}`) }"
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
    <div class="hidden sm:grid gap-1 min-h-[84px]">
      <a href="https://proecole.com/fr/index.html" target="_blank" title="Contact us" class="w-10 h-10 hover:bg-v flex-center rounded-v cursor-pointer smooth">
        <icon-app icon="fluent:chat-12-filled" />
      </a>
      <a href="https://proecole.com/fr/index.html" target="_blank" title="Help" class="w-10 h-10 hover:bg-v flex-center rounded-v cursor-pointer smooth">
        <icon-app icon="fluent:question-circle-12-filled" />
      </a>
      <!-- <div title="open/close nav bar" class="w-10 h-10 hover:bg-v hidden sm:flex-center rounded-v cursor-pointer smooth">
        <icon-app class="flip-if-rtl" icon="fluent:chevron-right-12-filled" />
      </div> -->
    </div>
  </nav>
  <router-view v-if="school" v-bind="$attrs" :school="school" class="-border-pro" />
  <div v-else v-bind="$attrs" class="flex-center">{{ getting }}</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/plugins/axios.js';
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
    icon: "fluent:settings-48-filled",
    name: "Settings",
    path: "settings"
  },
]);

const getting = ref(false);
const code = route.params.school;
const school = computed(() => store.state.schools.filter((i) => i.code == code)[0]);

onMounted(async () => {
  getting.value = "Loading...";
  try {
    const result = await api.get("/api/schools/get/" + code );
    if (result.data.haveAccess) {
      store.commit("add", {key: "schools", value: result.data.school});
      store.commit("set", {key: "school", value: result.data.school});
      getting.value = false;
    } else {
      getting.value = "You don't have access to this school";
    }
  } catch (error) {
    console.log(error);
  }
});
</script>