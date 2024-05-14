<template>
  <div class="flex flex-col">
    <div class="min-h-[96px] space-y-4">
      <div class="flex-between">
        <div class="text-pro">timetable <a v-if="getting && timetable.length" class="animate-pulse">...</a></div>
        <!-- <icon-app v-if="loading" icon="svg-spinners:ring-resize" /> -->
      </div>
      <div class="flex-between gap-4 my-4">
        <router-link v-if="$store.getters.permission('timetable:create')" :to="`/school/${school.code}/timetable/new`" class="btn-mini">
          <icon-app icon="fluent:add-12-filled" class="w-3" />
        </router-link>
        <div class="w-full flex-between gap-4">
          <input-app :value="query.course" @update="query.course = $event" icon="solar:document-bold" accessKey="s"
            type="search" placeholder="course name" />
          <input-app :value="query.teacher" @update="query.teacher = $event" icon="fluent:person-24-filled"
            placeholder="teacher name" class="hidden sm:flex" />
          <select-app :list="days" :value="current(query.date)?.day?.length ? current(query.date).day : query.day" @update="(e) => { (query.day = Number(e)); (Number(e) ? '' : query.date = ''); }" icon="fluent:calendar-ltr-24-filled" />
          <!-- <select-app :list="weeks" :value="query.week ? query.week : current(toDate()).week" @update="query.week = Number($event)" icon="fluent:calendar-ltr-24-filled" class="hidden sm:flex" /> -->
          <input-app :value="query.date" @update="(e) => { (query.date = e); (e.length ? query.day = current(e).day : ''); }" icon="fluent:calendar-ltr-24-filled" class="hidden sm:flex" type="date"/>
        </div>
      </div>
    </div>
    <div v-if="timetable.length" class="h-full space-y-4 overflow-y-auto">
      <div v-for="(courses, index) in second_array" class="grid gap-2">
        <div class="flex-between gap-4">
          <h3 class="font-medium min-w-fit">
            {{ query.day ? days[query.day] : days[index+1] }} 
          </h3>
          <div class="w-full border-b-[1px] dark:border-gray-700" />
        </div>
        <div v-if="courses.length" class="grid sm:grid-cols-3 md:grid-cols-4 gap-4">
          <div v-for="course in courses" class="group bg-v bg-v-hover rounded-v grid gap-2 p-3 smooth">
            <div class="flex-between gap-2">
              <router-link :to="$store.getters.permission('courses:information:access') ? `/school/${school.code}/courses/${course.uid}` : ''" :class="{ 'cursor-pointer hover:link smooth': $store.getters.permission('courses:information:access') }" class="font-medium truncate">{{ course.name }}</router-link>
              <h6 class="min-w-fit">{{ course.price }} DZD</h6>
            </div>
            <h6 class="px-4 truncate">{{ course.teacher }}</h6>
            <h6 class="flex-between gap-4">
              <div class="flex-between px-4 min-w-fit truncate">
                {{ course.date && `${course.date} : ` }} {{ course.start_at.slice(0, -3) }} - {{ course.end_at.slice(0, -3) }}</div>
              <h5 class="flex-between gap-2">
                <icon-app v-if="$store.getters.permission('timetable:create')" @click="deleteTimeTable(course.timetable_uid)" :icon="loading ? 'svg-spinners:ring-resize' : 'fluent:delete-24-filled'" class="opacity-0 group-hover:opacity-100 cursor-pointer hover:text-red-500 smooth min-w-4 min-h-4" />
                <icon-app v-if="course.date" icon="material-symbols:magic-button" class="min-w-4 min-h-4" />
                <div v-if="$route.query.uid == course.timetable_uid" :class="{ 'hidden': $route.query.uid != course.timetable_uid }" class="text-micro font-bold text-red-400 min-w-fit">NEW</div>
              </h5>
            </h6>
          </div>
        </div>
        <h6 v-else class="h-full flex-center">no data to display</h6>
      </div>
    </div>
    <h6 v-else-if="getting && !timetable.length" class="h-full flex-center">loading...</h6>
    <h6 v-else class="h-full flex-center">no data to display</h6>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/plugins/axios.js';
import store from '@/store';
import { toDate } from '@/utilities/date';

const { school } = defineProps({
  school: Object
});

const getting = ref(false);
const loading = ref(false);

const days = ["All Days",  "Sunday",  "Monday",  "Tuesday",  "Wednesday",  "Thursday",  "Friday",  "Saturday"];
// const weeks = ["All Weeks", "First", "Second", "Theard", "Fourth"];

const timetable = ref([]);

onMounted(async () => {
  try {
    getting.value = true;
    // loadingMore.value = false;
    const { data } = await api.get("/api/timetables/get/" + school.code);
    // console.log(data);
    timetable.value = data;
    store.commit("set", {key: "timetables", value: data});
    // loadingMore.value = data.length < 20 && data.length;
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

const query = ref({
  school: school.code,
  course: "",
  teacher: "",
  day: current(toDate()).day,
  // week: current(toDate()).week,
  date: toDate(),
  time: {
    from: "",
    to: "",
  },
});

const filterResult = ({name, teacher, date}) => {
  const getTime = (v) => new Date(v).getTime();
  // console.log(date, query.value.date, toDate());
  return name.toLowerCase().includes(query.value.course.toLowerCase())
  && teacher.toLowerCase().includes(query.value.teacher.toLowerCase())
  && (!date || getTime(date) >= getTime(query.value.date || toDate()));
};

const search = computed(() => timetable.value.filter(course => filterResult(course)));

const second_array = computed((first_array = search.value) => {
  let result = [];
  let allDays = first_array.filter(item => item.day == 0);
  let notAllDays = first_array.filter(item => item.day != 0);
    
  if (query.value.day) {
      result[0] = [ ...allDays, ...notAllDays.filter(item => item.day == query.value.day) ];
      result[0].sort((a, b) => {
        return new Date('1970/01/01 ' + a.start_at) - new Date('1970/01/01 ' + b.start_at);
      });
  } else {
    for (let i = 0; i < 7; i++) {
      result[i] = [ ...allDays, ...notAllDays.filter(item => item.day == i+1) ];
      result[i].sort((a, b) => {
        return new Date('1970/01/01 ' + a.start_at) - new Date('1970/01/01 ' + b.start_at);
      });
    }
  }
  return result;
});

const deleteTimeTable = async (uid) => {
  if (uid && window.confirm("Do you want to delete this timetable ?")) {
      try {
        loading.value = true;
        const result = await api.delete("/api/timetables/delete/" + uid);
        timetable.value = timetable.value.filter(item => item.timetable_uid != uid);
        console.log(result);
        loading.value = false;
      } catch (error) {
        console.log(error);
      }
  };
};
</script>