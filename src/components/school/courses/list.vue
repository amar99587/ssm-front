<template>
  <div class="flex flex-col">
    <div class="min-h-[96px]">
      <div class="flex-between">
        <div class="text-pro">cours<a v-if="getting && courses.length" class="animate-pulse">...</a></div>
        <icon-app v-if="loading" icon="svg-spinners:ring-resize" />
      </div>

      <dialog-app :ref="dialog.item" title="ajouter un nouveau cours" @close="dialog.close()" :canClose="!creating">
        <div class="space-y-2">
          <label for="nom du cours">nom du cours <a class="text-red-500">*</a></label>
          <input-app :value="course.name" @update="course.name = $event" 
            required placeholder="entrez le nom du cours ici" icon="solar:document-bold" />
        </div>
        <div class="space-y-2">
          <label for="Nom de prof">Nom de prof <a class="text-red-500">*</a></label>
          <input-app :value="course.teacher" @update="course.teacher = $event" :datalist="courses.map(({ teacher }) => teacher)"
            required placeholder="entrez le nom du prof du cours ici" icon="fluent:person-24-filled" />
        </div>
        <div class="space-y-2">
          <label for="price">prix de séance <a class="text-red-500">*</a></label>
          <input-app :value="course.price" @update="course.price = $event" type="number"
            required placeholder="entrez le prix de séance ici" icon="material-symbols:attach-money-rounded" />
          <h6 class="pb-2 mini-text">
              <a class="font-bold">Remarque : </a>Le prix de la séance est <a class="font-bold">le coût d'une seule séance</a>. 
              Par exemple, si le prix mensuel du cours est de 2000 DA pour 4 séances, le prix du séance est de 500 DA.</h6>
          </div>
          <div class="flex-center pt-4">
            <btn-app :text="$t('create')" @click="create(course)" :loading="creating" icon="fluent:add-12-filled" dark />
          </div>
      </dialog-app>

      <div class="flex-between gap-4 my-4">
        <div v-if="store.getters.permission('courses:create')" @click="dialog.open" class="btn-mini">
          <icon-app icon="fluent:add-12-filled" class="w-3" />
        </div>
        <div class="w-full flex-between gap-4">
          <input-app :value="query.name" @update="query.name = $event" type="search" icon="solar:documents-bold"
            placeholder="nom du cours" accessKey="c" />
          <div class="w-full hidden md:flex-between gap-4">
            <input-app :value="query.teacher" @update="query.teacher = $event" center class="" type="search"
              icon="fluent:person-24-filled" placeholder="nom du prof" />
            <input-app :value="query.price" @update="query.price = $event" center class="hidden lg:flex" type="number"
              icon="solar:tag-price-bold" placeholder="prix de séance" />
          </div>
        </div>
      </div>
    </div>
    <h6 v-if="!courses.length" class="h-full flex-center">{{ $t(getting ? "loading..." : "no data to display") }}</h6>
    <h5 v-else class="h-full space-y-4 overflow-y-auto smooth" :class="{ 'opacity-60': getting && search?.length }">
      <router-link v-if="search.length" v-for="(course, index) in search" :key="index"
        :to="`courses/${course.uid}`"
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
      <h6 v-else class="h-full flex-center">{{ $t("no data to display") }}</h6>
      <!-- <h6 v-if="loadingMore && loadingMore != courses.length" class="text-center py-3">{{ $t('loading...') }}</h6> -->
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
  if (validated({ arr: Object.values(e) }) && window.confirm("Voulez-vous créer un nouveau cours ?")) {
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