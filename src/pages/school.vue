<template>
  <nav v-if="school" :class="{ 'w-[200px]': openNavBar }" class="smooth hidden sm:flex-between min-w-full sm:min-w-fit bg-White rounded-v overflow-x-auto sm:overflow-y-auto flex-col p-1 min-h-[48px] sm:h-auto -border-pro">
    <div class="w-full h-full">
      <div class="w-full grid grid-flow-col sm:grid-flow-row gap-1 overflow-auto">
        <router-link 
          v-for="({ path, name, icon }, index) in nav" :key="index" :to="`/school/${school.code}/${path}`"
          class="flex-between h-10 hover:bg-v rounded-v cursor-pointer smooth"
          :class="{
            'hidden': school.link?.type == 'owner' ? false : (index ? !school.link?.rules[path + ':access'] : false), 
            'bg-v': route.path.startsWith(`/school/${school.code}/${path}`) 
          }"
          :title="name"
        >
          <icon-app :icon="icon" :class="{ 'h-full mx-auto': !openNavBar, 'min-w-[40px]': openNavBar }" />
          <h5 v-if="openNavBar" class="w-full pr-4">{{ name }}</h5>
        </router-link>
        <router-link to="/contactus" class="w-10 h-10 hover:bg-v flex-center rounded-v cursor-pointer smooth sm:hidden">
          <icon-app icon="fluent:chat-12-filled" />
        </router-link>
        <router-link to="/help" class="w-10 h-10 hover:bg-v flex-center rounded-v cursor-pointer smooth sm:hidden">
          <icon-app icon="fluent:question-circle-12-filled" />
        </router-link>
      </div>
    </div>
    <div class="w-full hidden sm:grid gap-1 min-h-[40px]"> <!--  40px = 172px - (44px * 3) -->
      <!-- <a href="https://proecole.com/fr/index.html" target="_blank" title="Help" class="w-10 h-10 hover:bg-v flex-center rounded-v cursor-pointer smooth">
        <icon-app icon="fluent:question-circle-12-filled" />
      </a> -44px
      <a href="https://proecole.com/fr/index.html" target="_blank" title="Contact us" class="w-10 h-10 hover:bg-v flex-center rounded-v cursor-pointer smooth">
        <icon-app icon="fluent:chat-12-filled" />
      </a> -44px
      <a href="https://proecole.com/fr/index.html" target="_blank" title="Report a bug" class="w-10 h-10 hover:bg-v flex-center rounded-v cursor-pointer smooth">
        <icon-app icon="solar:bug-minimalistic-bold" />
      </a> -44px -->
      <div @click="openNavBar = !openNavBar" title="ouvrir/fermer la barre de navigation"  :class="{ 'flex-between': openNavBar, 'flex-center': !openNavBar }" class="h-10 hover:bg-v rounded-v cursor-pointer smooth">
        <icon-app v-if="openNavBar" class="flip-if-rtl min-w-[40px]" icon="fluent:chevron-left-12-filled" />
        <icon-app v-else class="flip-if-rtl min-w-[40px]" icon="fluent:chevron-right-12-filled" />
        <h5 v-if="openNavBar" class="w-full pr-4">Fermer</h5>
      </div>
    </div>
  </nav>
  <router-view v-bind="$attrs" :school="school" class="-border-pro" />
  <!-- <div v-else v-bind="$attrs" class="flex-center">getting</div> -->
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router';
import store from '@/store';

const route = useRoute();

const nav = ref([
  {
    icon: "fluent:grid-24-filled",
    name: "Tableau de bord",
    path: "dashboard"
  },
  {
    icon: "fluent:people-12-filled",
    name: "les Élèves",
    path: "students"
  },
  {
    icon: "solar:documents-bold",
    name: "Cours",
    path: "courses"
  },
  {
    icon: "fluent:person-accounts-20-filled",
    name: "les Profs",
    path: "teachers"
  },
  {
    icon: "fluent:calendar-ltr-24-filled",
    name: "Emploi du Temps",
    path: "timetable"
  },
  {
    icon: "fa6-solid:money-check-dollar",
    name: "Finance",
    path: "finance"
  },
  {
    icon: "majesticons:chart-pie",
    name: "Statistiques",
    path: "statistics"
  },
  {
    icon: "fluent:settings-48-filled",
    name: "Paramètres",
    path: "settings"
  },
]);

// const getting = ref(false);
const openNavBar = ref(false);

const school = computed(() => store.state.school);
</script>