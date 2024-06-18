<template>
  <div class="flex flex-col">
    <div class="min-h-[96px]">
      <div class="flex-between">
        <div class="text-pro">students <a v-if="getting && students.length" class="animate-pulse">...</a></div>
        <icon-app v-if="loading" icon="svg-spinners:ring-resize" />
      </div>
      <dialog-app :ref="dialog.item" title="add student" @close="dialog.close()" :canClose="!creating">
        <div class="space-y-2">
          <label for="student fullname">fullname <a class="text-red-500">*</a></label>
          <input-app :value="student.name" @update="student.name = $event" placeholder="enter student full name here" icon="fluent:person-24-filled" />
        </div>
        <div class="space-y-2">
          <label for="birthday">birthday <a class="text-red-500">*</a></label>
          <input-app :value="student.birthday" @update="student.birthday = $event" type="date" icon="fluent:calendar-24-filled" center />
        </div>
        <div class="space-y-2">
          <label for="phone number">phone number</label>
          <input-app :value="student.phone" @update="student.phone = $event" type="number" placeholder="enter student phone number here" icon="fluent:call-24-filled" />
        </div>
        <div class="space-y-2">
          <label for="email">email</label>
          <input-app :value="student.email" @update="student.email = $event" type="email" placeholder="enter student email here" icon="fluent:mail-24-filled" />
        </div>
        <div class="flex-center pt-4">
          <btn-app text="create" @click="create(student)" :loading="creating" icon="fluent:add-12-filled" dark />
        </div>
      </dialog-app>
      <div class="flex-between gap-4 my-4">
        <div v-if="$store.getters.permission('students:create')" @click="dialog.open" class="btn-mini">
          <icon-app icon="fluent:add-12-filled" class="w-3" />
        </div>
        <form @submit.prevent="submitForm" class="w-full flex-between gap-4">
          <button @click="search()" class="hidden" />
          <input-app :value="query.name" @update="query.name = $event" icon="fluent:person-24-filled" accessKey="c"
            type="search" center placeholder="student name" />
          <input-app :value="query.birthday" @update="query.birthday = $event" class="hidden lg:flex" @change="search()" type="date"
            icon="fluent:calendar-24-filled" center />
          <input-app :value="query.email" @update="query.email = $event" class="hidden lg:flex" type="search"
            icon="fluent:mail-24-filled" center placeholder="student email" />
          <input-app :value="query.phone" @update="query.phone = $event" class="hidden md:flex" type="number"
            icon="fluent:call-24-filled" center placeholder="student phone" />
        </form>
      </div>
    </div>
    <h6 v-if="!students.length" class="h-full flex-center">{{ getting ? "LOADING..." : "no data to display" }}</h6>
    <h5 v-else @scroll="loadmore" :class="{ 'opacity-60': getting && students.length }"
      class="h-full space-y-4 overflow-y-auto smooth">
      <router-link v-for="(student, index) in students" :key="index"
        :to="`/school/${school.code}/students/${student.uid}`"
        class="flex-between gap-4 bg-v bg-v-hover rounded-v py-2 cursor-pointer smooth">
        <div class="min-w-[36px] flex justify-end items-center cursor-pointer">
          <icon-app icon="fluent:folder-16-filled" />
        </div>
        <div class="w-full flex-between gap-4 text-center items-center font-medium">
          <div class="w-full truncate">{{ student.name }}</div>
          <div class="w-full truncate hidden md:block smooth">{{ student.birthday }}</div>
          <a :href="student.email && `mailto:${student.email}`" @click.stop
            class="w-full truncate hidden lg:block smooth" :class="{ 'hover:link': student.email }">{{ student.email ||
          "-" }}</a>
          <a :href="student.phone && `tel:${student.phone}`" @click.stop class="w-full truncate hidden md:block smooth"
            :class="{ 'hover:link': student.phone }">{{ student.phone || "-" }}</a>
        </div>
      </router-link>
      <h6 v-if="loadingMore && loadingMore != students.length" class="text-center py-3">loading...</h6>
    </h5>
  </div>
</template>

<script setup>
import { validated } from '@/utilities/validator';
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router';
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
const loadingMore = ref(false);

const query = ref({
  school: school.code,
  name: "",
  birthday: "",
  email: "",
  phone: "",
});

const student = ref({
  school: school.code,
  name: "",
  birthday: "",
  email: "",
  phone: "",
});

const students = ref(store.state.students);

const dialog = {
  item: ref(null),
  open: () => dialog.item.value.open(),
  close: () => {
    if (!creating.value) {
      dialog.item.value.close();
      if (route.query.new == 'true') {
        getStudents();
      }
      router.push({ path: route.path, query: {} });
    }
  }
};

const getStudents = async () => {
  try {
    getting.value = true;
    loadingMore.value = false;
    const { data } = await api.post("/v1/students/search", query.value);
    students.value = data;
    store.commit("set", { key: "students", value: data });
    loadingMore.value = data.length < 20 && students.value.length;
    getting.value = false;
  } catch (error) {
    console.log(error);
  }
}

onMounted(async () => {
  if (route.query.new == "true") {
    dialog.open();
  } else {
    await getStudents();
  }
});

const create = async e => {
  if (store.getters.permission('students:create') && validated({ arr: [e.school, e.name, e.birthday] }) && window.confirm("Do you want to create a new student")) {
    try {
      creating.value = true;
      const result = await api.post("/v1/students/create", e);
      store.commit("set", { key: "student", value: { ...result.data, isNew: true } });
      store.commit("add", { key: "students", value: result.data });
      router.push(`/school/${e.school}/students/${result.data.uid}`);
    } catch (error) {
      console.log(error.message);
    }
  }
};

const search = async () => {
  try {
    loading.value = true;
    loadingMore.value = false;
    const { data } = await api.post("/v1/students/search", query.value);
    students.value = data;
    loadingMore.value = data.length < 20 && students.value.length;
    loading.value = false;
  } catch (error) {
    console.log(error);
  }
};

const loadmore = async (event) => {
  const scroll = event.target;
  if (!loadingMore.value && scroll.scrollHeight - scroll.clientHeight - 250 < Math.round(scroll.scrollTop)) {
    try {
      console.log("loadmore : students");
      loadingMore.value = true;
      const { data } = await api.post(`/v1/students/search?offset=${students.value.length}`, query.value);
      students.value = [...students.value, ...data];
      store.commit("set", { key: "students", value: students.value });
      loadingMore.value = data.length < 20 && students.value.length;
    } catch (error) {
      console.log(error);
    }
  };
  // console.log({
  //   scrollTop: Math.round(scroll.scrollTop),
  //   clientHeight: scroll.clientHeight,
  //   scrollHeight: scroll.scrollHeight,
  //   between: scroll.scrollHeight - scroll.clientHeight
  // });
};
</script>