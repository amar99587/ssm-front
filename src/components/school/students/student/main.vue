<template>
  <div v-bind="$attrs" class="hidden" />
  <div class="w-full h-fit sm:h-auto sm:flex sm:flex-col space-y-4 overflow-y-auto">
    <div v-if="[false, 'informations', 'courses'].includes(zoom)" class="w-full sm:flex sm:gap-4 space-y-4 sm:space-y-0" :class="{ 'h-full': zoom, 'sm:h-1/2': !zoom}">
      <student-informations v-if="$store.getters.permission('students:information:access') && [false, 'informations'].includes(zoom)" @zoom="zoom = (zoom != 'informations' && 'informations')" :data="{ zoom, school, student }" />
      <student-courses v-if="$store.getters.permission('students:courses:access') && [false, 'courses'].includes(zoom)" :zoom="zoom" @zoom="zoom = (zoom != 'courses' && 'courses')" :data="{ zoom, school, student }" />
    </div>
    <div v-if="[false, 'payment', 'presence'].includes(zoom)" class="w-full sm:flex sm:gap-4 space-y-4 sm:space-y-0" :class="{ 'h-full': zoom, 'sm:h-1/2': !zoom }">
      <student-payments v-if="$store.getters.permission('students:payments:access') && [false, 'payment'].includes(zoom)" :zoom="zoom" @zoom="zoom = (zoom != 'payment' && 'payment')" :data="{ zoom, school, student }" />
      <student-presence v-if="$store.getters.permission('students:presence:access') && [false, 'presence'].includes(zoom)" :zoom="zoom" @zoom="zoom = (zoom != 'presence' && 'presence')" :data="{ zoom, school, student }" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import store from "@/store"
import { useRoute } from "vue-router";
import studentCourses from "./courses";
import studentPresence from "./presence";
import studentPayments from "./payments";
import studentInformations from "./informations";

const route = useRoute();

const { school } = defineProps({
  school: Object
});

const student = ref({
  isNew: store.state.student?.isNew,
  uid: route.params.student
});

const zoom = ref(false);
</script>
