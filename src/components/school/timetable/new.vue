<template>
  <div class="flex flex-col">
    <div class="space-y-4" :class="{ 'min-h-[96px]': !timetable.course, 'min-h-[44px]': timetable.course }">
      <div class="flex-between">
        <h4 class="font-bold flex items-end gap-2">New Timetable 
          <a v-if="getting && courses.length" class="animate-pulse">...</a>
          <h6 v-else-if="!getting && courses.length" class="mini-text">: choose the {{!timetable.course ? "course" : "time"}}</h6>
        </h4>
        <!-- <icon-app v-if="loading" icon="svg-spinners:ring-resize" /> -->
      </div>
      <div v-if="!timetable.course" class="flex-between gap-4">
        <!-- <router-link
          :to="`/school/${school.code}/courses/new?name=${query.name}&teacher=${query.teacher}&price=${query.price}`"
          class="btn-mini">
          <icon-app icon="fluent:add-12-filled" class="w-3" />
        </router-link> -->
        <div class="w-full flex-between gap-4">
          <input-app :value="query.name" @update="query.name = $event" type="search" icon="solar:documents-bold"
            placeholder="course name" accessKey="c" />
          <div class="w-full hidden md:flex-between gap-4">
            <input-app :value="query.teacher" @update="query.teacher = $event" center class="" type="search"
              icon="fluent:person-24-filled" placeholder="teacher name" />
            <input-app :value="query.price" @update="query.price = $event" center class="hidden lg:flex" type="number"
              icon="solar:tag-price-bold" placeholder="course price" />
          </div>
        </div>
      </div>
    </div>
    <h6 v-if="!courses.length" class="h-full flex-center">{{ getting ? "LOADING..." : "no data to display" }}</h6>

    <h5 v-else-if="timetable.course" @click="timetable.course = false"
      class="flex-between gap-4 bg-v rounded-v py-2 cursor-pointer smooth">
      <div class="min-w-[36px] flex justify-end cursor-pointer">
        <icon-app icon="ion:chevron-back-outline" />
      </div>
      <div class="w-full flex-between gap-4 font-medium">
        <div dir="auto" class="w-full truncate sm:mx-4 md:ml-4 text-center sm:text-start">Course : <a class="font-bold">{{ courseData.name }}</a>
        </div>
        <div class="w-full hidden md:flex-between gap-4 text-center">
          <div class="w-full truncate">Teacher : <a class="font-bold">{{ courseData.teacher }}</a></div>
          <div class="w-full truncate hidden lg:block">Price : <a class="font-bold">{{ courseData.price }}</a></div>
        </div>
      </div>
      <div class="min-w-[36px]" />
    </h5>

    <h5 v-else class="h-full space-y-4 overflow-y-auto">
      <div v-if="search.length" v-for="{ uid, name, teacher, price } in search" @click="() => { timetable.course = uid; $router.push({ query: { course: timetable.course } }) }"
        class="flex-between gap-4 bg-v bg-v-hover rounded-v py-2 cursor-pointer smooth">
        <div class="min-w-[36px] flex justify-end cursor-pointer">
          <icon-app icon="solar:document-bold" />
        </div>
        <div class="w-full flex-between gap-4 font-medium">
          <div dir="auto" class="w-full truncate mx-4 md:ml-4">{{ name }}</div>
          <div class="w-full hidden md:flex-between gap-4 text-center">
            <div class="w-full truncate">{{ teacher }}</div>
            <div class="w-full truncate hidden lg:block">{{ price }}</div>
          </div>
        </div>
      </div>
      <h6 v-else class="h-full flex-center">no data to display</h6>
    </h5>

    <form v-if="timetable.course" @submit.prevent="submitForm"
      class="w-full md:w-8/12 lg:w-6/12 xl:w-4/12 my-8 mx-auto grid gap-4">
      <h4 class="flex-between">
        Fixed : <switch-app :value="timetable.fixed" @update="timetable.fixed = $event" />
      </h4>
      <h4 v-if="timetable.fixed" class="flex-between">
        Day : <select-app :list="days" :value="timetable.day" @update="timetable.day = $event" icon="fluent:calendar-ltr-24-filled" class="max-w-fit" />
      </h4>
      <!-- <h4 v-if="timetable.fixed" class="flex-between">
        week : <select-app :list="weeks" :value="timetable.week" @update="timetable.week = $event" icon="fluent:calendar-ltr-24-filled" class="max-w-fit" />
      </h4> -->
      <h4 v-else class="flex-between">
        Date : <input-app :value="timetable.date" @update="timetable.date = $event" icon="fluent:calendar-ltr-24-filled" type="date" class="max-w-fit" />
      </h4>
      <h4 class="flex-between">
        Start at : <input-app :value="timetable.start_at" @update="timetable.start_at = $event" class="max-w-fit" type="time" center />
      </h4>
      <h4 class="flex-between">
        End at : <input-app :value="timetable.end_at" @update="timetable.end_at = $event" class="max-w-fit" type="time" center />
      </h4>
      <button @click="create(timetable)" class="hidden"/>
    </form>

    <btn-app v-if="timetable.course" text="create" @click="create(timetable)" icon="fluent:add-12-filled" :loading="loading" dark class="min-w-fit mx-auto"/>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { validated } from '@/utilities/validator';
import api from '@/plugins/axios.js';
import { useRoute, useRouter } from 'vue-router';
import store from '@/store';

const { school } = defineProps({
  school: Object
});

const route = useRoute();
const router = useRouter();

const getting = ref(false);
const loading = ref(false);

const query = ref({
  name: "",
  teacher: "",
  price: "",
});

const timetable = ref({
  school: school.code,
  course: route.query.course,
  fixed: true,
  day: 0,
  // week: 0,
  date: "",
  start_at: "",
  end_at: "",
});

const days = ["All Days",  "Sunday",  "Monday",  "Tuesday",  "Wednesday",  "Thursday",  "Friday",  "Saturday"];
const weeks = ["All Weeks", "First", "Second", "Theard", "Fourth"];

const courses = ref(store.state.courses);
const courseData = computed(() => courses.value.filter(course => course.uid == timetable.value.course)[0]);

onMounted(async () => {
  try {
    getting.value = true;
    const { data } = await api.get("/api/courses/get/all/" + school.code);
    courses.value = data;
    store.commit("set", { key: "courses", value: data });
    getting.value = false;
  } catch (error) {
    console.log(error);
  }
});

const current = (dateString) => {
  const date = new Date(dateString);
  return {
    day: days.indexOf(date.toLocaleDateString('en-US', { weekday: 'long' })),
    week: Math.ceil((date.getDate() - date.getDay()) / 7)
  };
};

const search = computed(() => {
  const { name, teacher, price } = query.value;
  return courses.value.filter((course) =>
    course.name.toLowerCase().includes(name.toLowerCase()) &&
    course.teacher.toLowerCase().includes(teacher.toLowerCase()) &&
    course.price.toLowerCase().includes(price.toLowerCase())
  );
});

const create = async (e) => {
  if (!e.fixed) {
    e.day = current(e.date).day;
  } else {
    delete e["date"];
  }
  console.log(e);
  if (validated({arr: Object.values(e)}) && window.confirm("Do you want to create a new timetable ?")) {
    try {
      loading.value = true;
      const result = await api.post("/api/timetables/create", e);
      console.log(result.data);
      router.push(`/school/${school.code}/timetable?uid=${result.data.uid}`);
      store.commit("add", {key: "timetables", value: result.data});
    } catch (error) {
      console.log(error);
    }
  };
}
</script>