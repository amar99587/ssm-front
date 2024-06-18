<template>
  <div class="flex flex-col">
    <div class="min-h-[96px]">
      <div class="flex-between">
        <div class="text-pro">courses <a v-if="getting && courses.length" class="animate-pulse">...</a></div>
        <icon-app v-if="loading" icon="svg-spinners:ring-resize" />
      </div>

      <dialog-app :ref="dialog.item" title="add course" @close="dialog.close()" :canClose="!creating">
        <div class="space-y-2">
          <label for="name">name <a class="text-red-500">*</a></label>
          <input-app :value="course.name" @update="course.name = $event" placeholder="enter course name here"
            icon="solar:document-bold" />
        </div>
        <div class="space-y-2">
          <label for="teacher">teacher <a class="text-red-500">*</a></label>
          <input-app :value="course.teacher" @update="course.teacher = $event"
            placeholder="enter course teacher name here" icon="fluent:person-24-filled" />
        </div>
        <div class="space-y-2">
          <label for="price">price <a class="text-red-500">*</a></label>
          <input-app :value="course.price" @update="course.price = $event" type="number"
            placeholder="enter course price here" icon="material-symbols:attach-money-rounded" />
        </div>
        <div class="flex-center pt-4">
          <btn-app text="create" @click="create(course)" :loading="creating" icon="fluent:add-12-filled" dark />
        </div>
      </dialog-app>

      <div class="flex-between gap-4 my-4">
        <div v-if="store.getters.permission('courses:create')" @click="dialog.open" class="btn-mini">
          <icon-app icon="fluent:add-12-filled" class="w-3" />
        </div>
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
    <h5 v-else class="h-full space-y-4 overflow-y-auto">
      <router-link v-if="search.length" v-for="(course, index) in search" :key="index"
        :to="`/school/${school.code}/courses/${course.uid}`"
        class="flex-between gap-4 bg-v bg-v-hover rounded-v py-2 cursor-pointer smooth">
        <div class="min-w-[36px] flex justify-end cursor-pointer">
          <icon-app icon="solar:document-bold" />
        </div>
        <div class="w-full flex-between gap-4 font-medium">
          <div dir="auto" class="w-full truncate mx-4 md:ml-4">{{ course.name }}</div>
          <div class="w-full hidden md:flex-between gap-4 text-center">
            <div class="w-full truncate">{{ course.teacher }}</div>
            <div class="w-full truncate hidden lg:block">{{ course.price }}</div>
          </div>
        </div>
      </router-link>
      <h6 v-else class="h-full flex-center">no data to display</h6>
      <!-- <h6 v-if="loadingMore && loadingMore != courses.length" class="text-center py-3">loading...</h6> -->
    </h5>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router';
import { validated } from '@/utilities/validator';
import api from '@/plugins/axios.js';
import store from '@/store';

const { school } = defineProps({
  school: Object
});

const router = useRouter();
const route = useRoute();

const getting = ref(false);
const loading = ref(false);
const creating = ref(false);
// const loadingMore = ref(false);

const query = ref({
  // school: school.code,
  name: "",
  teacher: "",
  price: "",
});

const course = ref({
  school: school.code,
  name: "",
  teacher: "",
  price: "",
});

const courses = ref(store.state.courses);

const dialog = {
  item: ref(null),
  open: () => dialog.item.value.open(),
  close: () => {
    if (!creating.value) {
      dialog.item.value.close();
      if (route.query.new == 'true') {
        getCourses();
      }
      router.push({ path: route.path, query: {} });
    }
  }
};

const getCourses = async () => {
  try {
    getting.value = true;
    const { data } = await api.get("/v1/courses/get/all/" + school.code);
    courses.value = data;
    store.commit("set", { key: "courses", value: data });
    getting.value = false;
  } catch (error) {
    console.log(error);
  }
};

onMounted(async () => {
  if (route.query.new == "true") {
    dialog.open();
  } else {
    await getCourses();
  }
});

const search = computed(() => {
  const { name, teacher, price } = query.value;
  return courses.value.filter((course) =>
    course.name.toLowerCase().includes(name.toLowerCase()) &&
    course.teacher.toLowerCase().includes(teacher.toLowerCase()) &&
    course.price.toLowerCase().includes(price.toLowerCase())
  );
});

const create = async (e) => {
  if (validated({ arr: Object.values(e) }) && window.confirm("Do you want to create a new course")) {
    try {
      creating.value = true;
      const result = await api.post("/v1/courses/create", e);
      store.commit("add", { key: "courses", value: result.data });
      router.push(`/school/${e.school}/courses/${result.data.uid}?new=true`);
    } catch (error) {
      console.log(error);
    }
  };
};

</script>