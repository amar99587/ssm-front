<template>
  <div class="flex flex-col">

    <dialog-app :ref="dialog.item" title="ajouter une nouvelle séance" @close="dialog.close()" :canClose="!creating">
      <div class="space-y-4">
        <div v-if="!newTimetable.course" class="space-y-2">
          <label>Cours <a class="text-red-500">*</a></label>
          <select-app :list="courses.map(({ uid, name }) => ({ value: uid, text: name }))"
            @update="uid => newTimetable.course = courses.find(item => (item.uid == uid))"
            icon="fluent:calendar-ltr-24-filled" class="w-full" />
        </div>
        <div v-else class="text-center grid gap-4">
          <h2>{{ newTimetable.course.name }}</h2>
          <div class="space-y-2">
            <h4>{{ newTimetable.course.teacher }}</h4>
            <h5>{{ newTimetable.course.price }} DA</h5>
          </div>
          <h6 @click="newTimetable.course = null" class="mini-text cursor-pointer w-fit flex items-center grid-6 mx-auto">
            changer
            <icon-app icon="humbleicons:exchange-vertical" class="w-4" />
          </h6>
        </div>
        <div class="flex-between">
          <label>Fixé <a class="text-red-500">*</a></label>
          <switch-app :value="newTimetable.fixed" @update="newTimetable.fixed = $event" />
        </div>
        <div v-if="newTimetable.fixed" class="flex-between">
          <label>Jour <a class="text-red-500">*</a></label>
          <select-app :list="days" :value="newTimetable.day" @update="newTimetable.day = $event"
            placeholder="select a course" icon="fluent:calendar-ltr-24-filled" class="max-w-fit" />
        </div>
        <div v-else class="flex-between">
          <label>Date <a class="text-red-500">*</a></label>
          <input-app :value="newTimetable.date" @update="newTimetable.date = $event"
            icon="fluent:calendar-ltr-24-filled" type="date" class="max-w-fit" />
        </div>
        <div class="flex-between">
          <label>Commencer à <a class="text-red-500">*</a></label>
          <input-app :value="newTimetable.start_at" @update="newTimetable.start_at = $event" class="max-w-fit"
            type="time" center />
        </div>
        <div class="flex-between">
          <label>Fin à <a class="text-red-500">*</a></label>
          <input-app :value="newTimetable.end_at" @update="newTimetable.end_at = $event" class="max-w-fit" type="time"
            center />
        </div>
        <div class="flex-center pt-4">
          <btn-app :text="$t('create')" @click="addLesson(newTimetable)" :loading="creating" icon="fluent:add-12-filled" dark />
        </div>
      </div>
      <button @click="addLesson(newTimetable)" class="hidden" />
    </dialog-app>

    <div class="min-h-[96px] space-y-4">
      <div class="flex-between">
        <div class="text-pro">Emploi du Temps <a v-if="getting == 'timetables' && timetable.length" class="animate-pulse">...</a></div>
        <!-- <icon-app v-if="loading" icon="svg-spinners:ring-resize" /> -->
      </div>
      <div class="flex-between gap-4 my-4">
        <div @click="dialog.open()" class="btn-mini">
          <icon-app :icon="getting == 'courses' ? 'svg-spinners:ring-resize' : 'fluent:add-12-filled'" class="w-3" />
        </div>
        <div class="w-full flex-between gap-4">
          <input-app :value="query.course" @update="query.course = $event" icon="solar:document-bold" accessKey="s"
            type="search" placeholder="nom du cours" />
          <input-app :value="query.teacher" @update="query.teacher = $event" icon="fluent:person-24-filled"
            placeholder="nom du prof" class="hidden sm:flex" />
          <select-app :list="days" :value="query.day"
            @update="(e) => { (query.day = Number(e)); (Number(e) ? '' : query.date = ''); }"
            icon="fluent:calendar-ltr-24-filled" />
          <input-app :value="query.date"
            @update="(e) => { (query.date = e); (e.length ? query.day = currentDay(e) : ''); }"
            icon="fluent:calendar-ltr-24-filled" class="hidden sm:flex" type="date" />
        </div>
      </div>
    </div>

    <div v-if="timetable.length" :class="{ 'opacity-60': getting == 'timetables' && timetable.length }" class="h-full space-y-4 overflow-y-auto smooth">
      <div v-for="day in query.day ? `${query.day}` : '1234567'" class="grid gap-2">
        <div class="flex-between gap-4">
          <h3 class="font-medium min-w-fit">
            {{ days[day] }}
          </h3>
          <div class="w-full border-b-[1px] dark:border-gray-700" />
        </div>
        <div v-if="dayCourses(day).length" class="grid sm:grid-cols-3 md:grid-cols-4 gap-4">
          <div v-for="course in dayCourses(day)" class="group bg-v bg-v-hover rounded-v grid gap-2 p-3 smooth">
            <div class="flex-between gap-2">
              <router-link
                :to="$store.getters.permission('courses:information:access') ? `/school/${school.code}/courses/${course.uid}` : ''"
                :class="{ 'cursor-pointer hover:link smooth': $store.getters.permission('courses:information:access') }"
                class="font-medium truncate"
              >
                {{ course.name }}
              </router-link>
              <h6 class="min-w-fit">{{ course.price }} DZD</h6>
            </div>
            <h6 class="px-4 truncate">{{ course.teacher }}</h6>
            <h6 class="flex-between gap-4">
              <div class="flex-between px-4 min-w-fit truncate">
                {{ course.date && `${course.date} : ` }} {{ course.start_at.slice(0, -3) }} - {{ course.end_at.slice(0, -3) }}
              </div>
              <h5 class="flex-between gap-2">
                <icon-app v-if="$store.getters.permission('timetable:create')"
                  @click="deleteLesson(course.timetable_uid)"
                  :icon="loading ? 'svg-spinners:ring-resize' : 'fluent:delete-24-filled'"
                  class="opacity-0 group-hover:opacity-100 cursor-pointer hover:text-red-500 smooth min-w-4 min-h-4" />
                <icon-app v-if="course.date" icon="material-symbols:magic-button" class="min-w-4 min-h-4" />
                <icon-app v-if="course.day == 0" title="all days" icon="mingcute:refresh-4-fill" class="min-w-4 min-h-4" />
                <div v-if="$route.query.uid == course.timetable_uid"
                  :class="{ 'hidden': $route.query.uid != course.timetable_uid }"
                  class="text-micro font-bold text-red-400 min-w-fit">NEW</div>
              </h5>
            </h6>
          </div>
        </div>
        <h6 v-else class="h-full flex-center">{{ $t("no data to display") }}</h6>
      </div>
    </div>
    <h6 v-else-if="getting == 'timetables' && !timetable.length" class="h-full flex-center">{{ $t('loading...') }}</h6>
    <h6 v-else class="h-full flex-center">{{ $t("no data to display") }}</h6>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/plugins/axios.js';
import store from '@/store';
import { toDate } from '@/utilities/date';
import { validated } from '@/utilities/validator';
import { useRoute } from 'vue-router';

const { school } = defineProps({
  school: Object
});

const route = useRoute();

const getting = ref(false);
const loading = ref(false);
const creating = ref(false);

const courses = ref(store.state.courses);
const days = ["Tous les jours", "Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const timetable = ref([]);

const newTimetable = ref({
  school: school.code,
  course: null,
  fixed: true,
  day: 0,
  date: "",
  start_at: "",
  end_at: "",
});

const dialog = {
  item: ref(null),
  open: async () => {
    try {
      if (!courses.value.length) {
        getting.value = 'courses';
        const { data } = await api.get("/v1/courses/get/all/" + school.code);
        courses.value = data;
        getting.value = false;
      }
      dialog.item.value.open()
    } catch (error) {
      console.log(error);
    }
  },
  close: () => dialog.item.value.close(),
};

onMounted(async () => {
  if (route.query.new == "true") {
    dialog.open();
  } 
  try {
    getting.value = 'timetables';
    const { data } = await api.get("/v1/timetables/get/" + school.code);
    timetable.value = data;
    store.commit("set", { key: "timetables", value: data });
    getting.value = false;
  } catch (error) {
    console.log(error);
  }
});

const currentDay = dateString => {
  const date = new Date(dateString);
  return days.map(i => i.toLowerCase()).indexOf(date.toLocaleDateString('fr-FR', { weekday: 'long' }));
};

const query = ref({
  school: school.code,
  course: "",
  teacher: "",
  day: currentDay(toDate()),
  date: toDate(),
  time: {
    from: "",
    to: "",
  },
});

const dayCourses = day => {
  const getTime = (v) => new Date(v).getTime();
  return timetable.value?.filter(e => 
    e.day == day &&
    e.name.toLowerCase().includes(query.value.course.toLowerCase()) &&
    e.teacher.toLowerCase().includes(query.value.teacher.toLowerCase()) &&
    (!e.date || getTime(e.date) >= getTime(query.value.date || toDate()))
  );
};

const addLesson = async (e) => {
  if (!e.fixed) {
    e.day = currentDay(e.date);
  } else {
    delete e["date"];
  }
  if (validated({arr: Object.values(e)}) && window.confirm("Voulez-vous créer une nouvelle séance ?")) {
    try {
      creating.value = true;
      const result = await api.post("/v1/timetables/create", { ...e, course: e.course.uid });
      if(result.data.uid) {
        const data = { ...e, ...e.course, start_at: e.start_at + ':00', end_at: e.end_at + ':00', timetable_uid: result.data.uid };
        delete data.course;
        timetable.value.push(data);
        store.commit("add", { key: "timetables", value: timetable.value });
      }
      dialog.close();
      creating.value = false;
    } catch (error) {
      console.log(error);
    }
  };
};

const deleteLesson = async (uid) => {
  if (uid && window.confirm("Voulez-vous supprimer cette séance ?")) {
    try {
      loading.value = true;
      const result = await api.delete("/v1/timetables/delete/" + uid);
      timetable.value = timetable.value.filter(item => item.timetable_uid != uid);
      loading.value = false;
    } catch (error) {
      console.log(error);
    }
  };
};
</script>