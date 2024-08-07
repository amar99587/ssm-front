<template>
  <div dir="auto" class="bg-White rounded-v flex flex-1 flex-col gap-4 p-4">
    <div class="min-h-[24px] flex-between">
      <h4 class="font-bold">cours<a v-if="getting && courses.length" class="animate-pulse">...</a></h4>
      <!-- <icon-app v-if="loading" icon="svg-spinners:ring-resize" /> -->
      <icon-app @click="compressed = !compressed" :icon="compressed ? 'fluent:caret-up-16-filled' : 'fluent:caret-down-16-filled'"
        class="block sm:hidden cursor-pointer" />
      <icon-app @click="emits('zoom')"
        :icon="!data.zoom ? 'ic:round-zoom-out-map' : 'ic:round-zoom-in-map'" class="hidden sm:block cursor-pointer" />
    </div>

    <h6 v-if="getting && !courses.length" class="h-full flex-center pb-2">{{ $t('loading...') }}</h6>
    <h6 v-else-if="!courses.length" class="h-full flex-center pb-2">
      <div class="space-y-4 text-center">
        <h5>tu n'as pas encore de cours</h5>
        <btn-app v-if="rules.courses.create" @click="$router.push(`/school/${data.school.code}/courses?new=true`)" :text="$t('create')" icon="fluent:add-12-filled" class="mx-auto" />
        <h6 v-if="rules.courses.create" class="text-micro">cliquez sur « + créer » pour <br>créer un nouveau cours.</h6>
      </div>
    </h6>
    
    <div v-if="courses.length" class="min-h-[36px] gap-2" :class="{ 'hidden sm:flex-between': !compressed, 'flex-between': compressed }">
      <input-app :value="query.course" @update="query.course = $event" type="search" icon="solar:document-bold" placeholder="nom du cours" />
      <div @click="query.color = changeColor(query.color)" class="flex-center min-w-fit h-[36px] bg-v rounded-v p-2 cursor-pointer border-pro">
        <div class="min-w-[1rem] h-4 rounded-full smooth" :style="`background: ${query.color};`"></div>
      </div>
    </div>

    <div v-if="courses.length" class="h-full space-y-4 smooth" :class="{ 'hidden sm:block': !compressed, 'opacity-60': getting && courses.length }">
      <div class="sm:h-full space-y-4 overflow-y-auto" :class="{ 'max-h-[250px]': !data.zoom }">
        <h5 v-if="search.length" v-for="(item, index) in search" :key="index" @click="getting ? false : (selected = { ...selected, course: item.uid, name: item.name, price: item.price, total: item.price })"
          class="flex-between gap-2 sm:gap-4 rounded-v p-2 smooth cursor-pointer"
          :class="{ 'bg-dark': selected.course == item.uid, 'bg-v bg-v-hover': selected.course != item.uid }">
          <div dir="auto"  class="w-full truncate">{{ item.name }}</div>
          <div class="min-w-fit flex-between gap-4">
            <h5 class="min-w-fit">{{ +item.price }} DZD</h5>
            <div class="min-w-[1rem] h-4 rounded-full smooth"
              :style="`background: ${store.state.payments.some(obj => obj.course == item.uid && obj.student == data.student.uid) ? '#0B6E4F' : '#FA9F42'};`"></div>
          </div>
        </h5>
        <h6 v-else class="h-full flex-center">{{ $t("no data to display") }}</h6>
        <!-- <h6 v-if="loadingMore && loadingMore != courses.length" class="text-center py-3">{{ $t('loading...') }}</h6> -->
      </div>
    </div>
    <form @submit.prevent="submitForm" v-if="rules.payments.add && !getting && selected.course"
      class="grid sm:flex gap-4 min-h-[36px]" :class="{ 'hidden': !compressed, 'flex': compressed }">
      <div class="w-full flex-between gap-2 sm:gap-4">
        <input-app required :readonly="loading" :value="selected.quantity" @update="totalCalculation" icon="streamline:tickets-solid" type="number" min="1" placeholder="séances" center />
        <icon-app icon="ic:round-double-arrow" class="min-w-fit" size="24" />
        <input-app required :readonly="!rules.payments.discount" center :value="selected.quantity ? +selected.total : +selected.price" @update="rules.payments.discount ? selected.total = $event : ''" icon="ic:round-attach-money" type="number" placeholder="prix total" />
      </div> 
      <btn-app class="min-w-fit mx-auto" @click="create(selected)" text="payer" dark :loading="loading"
        icon="fluent:add-12-filled" />
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from '@/plugins/axios.js';
import { useStore } from 'vuex';

const store = useStore();

const { data } = defineProps(["data"]);
const emits = defineEmits(["zoom"]);

const compressed = ref(false);
const getting = ref(false);
const loading = ref(false);

const courses = ref(store.state.courses);

const checkPermission = rule => store.getters.permission(rule);
const rules = computed(() => ({
  isOwner: data.school.link.type == "owner",
  courses: {
    create: checkPermission('courses:create'),
  },
  payments: {
    add: checkPermission('students:payments:add'),
    discount: checkPermission('students:payments:discount'),
    payback: checkPermission('students:payments:payback'),
  },
}));

const selected = ref({
  school: data.school.code,
  student: data.student.uid,
  course: null,
  quantity: null,
  price: null,
  total: null,
});

const query = ref({
  course: "",
  color: "#212937",
});

const changeColor = color => {
  switch (color) {
    case '#212937':
      return '#0B6E4F';
    case '#0B6E4F':
      return '#FA9F42';
    default:
      return '#212937';
  }
};

onMounted(async () => {
  try {
    getting.value = true;
    const result = await api.get("/v1/courses/get/all/" + data.school.code);
    courses.value = result.data;
    store.commit("set", {key: "courses", value: result.data});
    getting.value = false;
  } catch (error) {
    console.log(error);
  }
});

const positive = event => +Math.abs(Math.floor(event));

const totalCalculation = (event, price = positive(selected.value.price)) => {
  const payback = rules.value.payments.payback;
  const discount = rules.value.payments.discount;

  // discount is necessary for payback
  const quantity = !payback ? positive(event) : Math.floor(event);
  const total = !discount && !payback ? positive(quantity * price) : Math.floor(quantity * price);

  selected.value.quantity = quantity;
  selected.value.total = total;
};

const search = computed(() => {
  const { course, color } = query.value;

  const paid = color == "#0B6E4F";
  const unpaid = color == "#FA9F42";

  const isPaid = (uid) => store.state.payments.some(obj => obj.course == uid && obj.student == data.student.uid);
  
  return courses.value.filter(({name, uid}) => 
    name.toLowerCase().includes(course.toLowerCase()) && (paid ? isPaid(uid) : (unpaid ? !isPaid(uid) : true))
  );
});

const create = async e => {
  if (!loading.value && rules.value.payments.add && !Object.values(e).includes(null) && 
    window.confirm(`Souhaitez-vous ajouter "${e.quantity}" séances du cours "${e.name}" pour l'étudiant "${store.state.student.name}" pour un montant total de ${e.total} DZD ?`)
  ) {
    try {
      loading.value = true;
      const result = await api.post("/v1/payments/create", e);
      console.log(e);
      store.commit("add", {key: "payments", value: { ...result.data, course_name: e.course_name } });
      loading.value = false;
      selected.value = {
        school: data.school.code,
        student: data.student.uid,
        course: null,
        price: null,
        total: null,
        quantity: null
      };
    } catch (error) {
      console.log(error.message);
    }
  }
};

</script>