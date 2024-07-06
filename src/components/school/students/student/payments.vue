<template>
  <div dir="auto" class="bg-White rounded-v flex-1 flex flex-col gap-4 p-4">
    <div class="min-h-[24px] flex-between">
      <h4 class="font-bold">Paiements<a v-if="getting && localPayments.length" class="animate-pulse">...</a></h4>
      <icon-app v-if="loading" icon="svg-spinners:ring-resize" />
      <icon-app v-else @click="compressed = !compressed" :icon="compressed ? 'fluent:caret-up-16-filled' : 'fluent:caret-down-16-filled'"
        class="block sm:hidden cursor-pointer" />
      <icon-app v-if="!loading" @click="emits('zoom')"
        :icon="!data.zoom ? 'ic:round-zoom-out-map' : 'ic:round-zoom-in-map'" class="hidden sm:block cursor-pointer" />
    </div>

    <h6 v-if="!localPayments.length && getting" class="h-full flex-center pb-2">{{ $t('loading...') }}</h6>
    <h6 v-else-if="!localPayments.length && !(query.course || query.total || query.created_at)"
      class="h-full flex-center pb-2">aucun paiement à afficher</h6>
    <form @submit.prevent="submitForm" v-else-if="localPayments.length" class="min-h-[36px] grid-cols-4 gap-2"
      :class="{ 'hidden sm:grid': !compressed, 'grid': compressed }">
      <input-app :value="query.course_name" @update="query.course_name = $event" type="search" placeholder="cours"
        class="col-span-2" />
      <input-app :value="query.total" @update="query.total = Number($event)" type="number" placeholder="total"
        center />
      <input-app :value="query.created_at" @update="query.created_at = $event" @change="search()" type="date" center />
      <button @click="search()" class="hidden" />
    </form>
    <div v-if="payments.length" class="h-full space-y-4 smooth" :class="{ 'opacity-60': getting && payments?.length, 'hidden sm:block': !compressed }">
      <div @scroll="loadmore" class="sm:h-full space-y-4 overflow-y-auto" :class="{ 'max-h-[250px]': !data.zoom }">
        <h5 v-for="(payment, index) in payments" :key="index" @click="more == payment.uid ? more = false : more = payment.uid"
          class="grid grid-cols-4 gap-2 bg-v bg-v-hover rounded-v py-2 cursor-pointer smooth">
          <div v-if="more != payment.uid" dir="ltr" class="flex-between gap-1 col-span-2 px-2">
            <a class="min-w-fit">{{ payment.quantity }}</a>*
            <a dir="auto" class="w-full truncate">{{ payment.course_name }}</a>
          </div>
          <div v-if="more != payment.uid" class="truncate text-center px-1">{{ payment.total }} DZD</div>
          <div v-if="more != payment.uid" class="truncate text-center px-1">{{ $toDate(payment.created_at) }}</div>
          <div v-if="more == payment.uid" class="truncate col-span-4 px-2 space-y-2">
            <div class="text-center">{{payment.course_name}}</div>
            <div>prix des séances : {{payment.price}} DZD</div>
            <div>nombre de séances : {{payment.quantity}}</div>
            <div>Total attendu : {{payment.quantity * payment.price}} DZD</div>
            <div>Total final : {{payment.total}} DZD</div>
            <h6 class="text-center">créé par <router-link :to="`/school/${data.school.code}/settings/users/${payment.user_code}`" class="link uppercase">{{ payment.user_code }}</router-link> à {{ $toDate(payment.created_at, "timestamp") }}</h6>
          </div>
        </h5>
        <h6 v-if="loadingMore && (typeof loadingMore != 'number')" class="text-center py-3">{{ $t('loading...') }}</h6>
      </div>
    </div>
    <h6 v-else-if="localPayments.length && !payments.length" class="h-full flex-center pb-2">{{ $t("no data to display") }}</h6>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watchEffect } from "vue";
import api from '@/plugins/axios.js';
import { useStore } from 'vuex';

const store = useStore();

const { data } = defineProps(["data"]);
const emits = defineEmits(["zoom"]);
const compressed = ref(false);
const getting = ref(false);
const loading = ref(false);
const loadingMore = ref(false);
const more = ref(null);

const query = ref({
  student: data.student.uid,
  course_name: "",
  total: "",
  created_at: "",
});

const localPayments = computed(() => store.state.payments.filter(obj => obj.student == data.student.uid));
const payments = ref(localPayments.value);

watchEffect(() => {
  payments.value = localPayments.value;
});

const getPayments = async () => {
  if (!data.student.isNew) {
    try {
      getting.value = true;
      const result = await api.post("/v1/payments/search", query.value);
      payments.value = result.data;
      store.commit("set", {key: "payments", value: result.data});
      loadingMore.value = result.data.length < 20 && result.data.length;
      getting.value = false;
    } catch (error) {
      console.log(error);
    }
  }
};

onMounted(async () => await getPayments());

const search = async () => {
  try {
    loading.value = true;
    loadingMore.value = false;
    const result = await api.post("/v1/payments/search", query.value);
    payments.value = result.data;
    loadingMore.value = result.data.length < 20 && result.data.length;
    loading.value = false;
  } catch (error) {
    console.log(error);
  }
};

const loadmore = async (event) => {
  const scroll = event.target;
  if(!loadingMore.value && scroll.scrollHeight - scroll.clientHeight - 50 < Math.round(scroll.scrollTop)) {
    try {
      console.log("loadmore : payments");
      loadingMore.value = true;
      const result = await api.post(`/v1/payments/search?offset=${payments.value.length}`, query.value);
      payments.value = [ ...payments.value, ...result.data ];
      store.commit("set", {key: "payments", value: payments.value});
      loadingMore.value = result.data.length < 20 && payments.value.length;
    } catch (error) {
      console.log(error);
    }
  };
};
</script>