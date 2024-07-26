<template>
    <div class="md:flex md:flex-col space-y-4">
        <div class="flex flex-col space-y-6" :class="{ 'min-h-[316px]': payments.rows.length, 'min-h-[272px]': !payments.rows.length }">
            <div class="flex-between">
                <div class="text-pro">finance<a v-if="getting && payments.rows.length" class="animate-pulse">...</a></div>
                <icon-app v-if="loading" icon="svg-spinners:ring-resize" />
            </div>
            <form @submit.prevent="submitForm" class="grid md:grid-cols-5 gap-4">
                <button @click="search()" class="hidden"/>
                <div class="grid gap-2">
                    <input-app label="depuis" :value="query.from" @update="query.from = $event" @change="search()" type="datetime-local" icon="fluent:calendar-24-filled" :min="getLimit(query.to, -days40)" :max="query.to" />
                </div>
                <div class="grid gap-2">
                    <input-app label="à" :value="query.to" @update="query.to = $event" @change="search()" type="datetime-local" icon="fluent:calendar-24-filled" :min="query.from" :max="getLimit(query.from, +days40)" />
                </div>
                <div class="grid gap-2">
                    <input-app label="utilisateur" :value="query.user" @update="query.user = $event" type="search" icon="fluent:person-24-filled" placeholder="nom d'utilisateur" />
                </div>
                <div class="grid gap-2">
                    <input-app label="cours" :value="query.course" @update="query.course = $event" type="search" icon="solar:document-bold" placeholder="nom du cours" />
                </div>
                <div class="grid gap-2">
                    <input-app label="prof" :value="query.teacher" @update="query.teacher = $event" :datalist="store.state.courses.map(({ teacher }) => teacher)" icon="fluent:person-accounts-20-filled" placeholder="nom de prof" />
                </div>
            </form>
            <div class="grid md:grid-cols-4 gap-4">
                <div class="bg-v rounded-v flex flex-col w-full h-32 p-4">
                    <h5 class="font-bold">Recette</h5>
                    <h2 class="h-full flex-center">
                        <a class="flex items-end gap-2">
                            <h6 class="opacity-0">DZD</h6>
                            {{ +payments.statistic.recipe }}
                            <h6 class="mini-text">DZD</h6>
                        </a>
                    </h2>
                </div>
                <div class="bg-v rounded-v flex flex-col w-full h-32 p-4">
                    <h5 class="font-bold">Transaction</h5>
                    <h2 class="h-full flex-center">{{ +payments.statistic.payments }}</h2>
                </div>
                <div class="bg-v rounded-v flex flex-col w-full h-32 p-4 cursor-pointer">
                    <div class="flex-between">
                        <h5 class="font-bold">Remise</h5>
                        <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                    </div>
                    <h2 class="h-full flex-center">
                        <a class="flex items-end gap-2">
                            <h6 class="opacity-0">DZD</h6>
                            {{ +payments.statistic.discount }}
                            <h6 class="mini-text">DZD</h6>
                        </a>
                    </h2>
                </div>
                <div class="bg-v rounded-v flex flex-col w-full h-32 p-4 cursor-pointer">
                    <div class="flex-between">
                        <h5 class="font-bold">Rembourser</h5>
                        <div class="w-3 h-3 bg-orange-500 rounded-full"></div>
                    </div>
                    <h2 class="h-full flex-center">
                        <a class="flex items-end gap-2">
                            <h6 class="opacity-0">DZD</h6>
                            {{ +payments.statistic.payback }}
                            <h6 class="mini-text">DZD</h6>
                        </a>
                    </h2>
                </div>
            </div>
            <h5 v-if="payments.rows.length" class="px-2 grid grid-cols-3 sm:grid-cols-7 gap-4 text-center">
                <div class="truncate">Utilisateur</div>
                <div class="truncate">Cours</div>                
                <div class="hidden sm:block truncate">Prof</div>
                <div class="hidden sm:block truncate">Prix</div>
                <div class="hidden sm:block truncate">Quantité</div>
                <div class="truncate">Total</div>
                <div class="hidden sm:block truncate">{{ $t('created at') }}</div>
            </h5>
        </div>
        <h5 v-if="payments.rows.length" @scroll="loadmore" class="h-full space-y-4 overflow-y-auto">
            <h5 v-for="(item, index) in payments.rows" :key="index" @click="moreInfo = item.uid" class="bg-v bg-v-hover rounded-v p-2 grid grid-cols-3 sm:grid-cols-7 gap-4 text-center overflow-y-auto cursor-pointer smooth">
                <div class="truncate uppercase">{{ item.user_code }}</div>
                <div class="truncate">{{ item.course_name }}</div>                
                <div class="hidden sm:block truncate">{{ item.teacher_name }}</div>
                <div class="hidden sm:block truncate" :class="{ 'font-bold text-orange-500': item.price <= 0 }">{{ +item.price }} <a class="text-xs font-medium">DZD</a></div>
                <div class="hidden sm:block truncate" :class="{ 'font-bold text-orange-500': item.quantity <= 0 }">{{ item.quantity }}</div>
                <div class="truncate" :class="{ 'font-bold text-blue-500': item.price * item.quantity > item.total, 'font-bold text-orange-500': item.total <= 0 }">{{ item.total }} <a class="text-xs font-medium">DZD</a></div>
                <div class="hidden sm:block truncate">{{ toDate(item.created_at, "timestamp") }}</div>
                <div v-if="moreInfo == item.uid" class="text-start grid col-span-full gap-2 sm:hidden">
                    <div class="w-full">Prof : {{ item.teacher_name }}</div>
                    <div class="w-full">nom d'utilisateur : {{ item.user_name }}</div>
                    <div class="w-full">prix de la séance : {{ +item.price }} <a class="text-xs">DZD</a></div>
                    <div class="w-full">Quantité : {{ item.quantity }}</div>
                    <div class="w-full">{{ `${$t('created at')} : ${toDate(item.created_at, "timestamp")}` }}</div>
                </div>
                <router-link v-if="moreInfo == item.uid" :to="`students/${item.student}`" class="col-span-full border-gray-400 dark:border-gray-500 border-t pt-2">
                    <h6 class="mx-auto w-fit flex-between gap-2">aller chez l'élève <icon-app icon="fluent:open-12-regular" /></h6>
                </router-link>
            </h5>
            <h6 v-if="isLoadingMore" class="text-center py-3">{{ $t('loading...') }}</h6>
        </h5>
        <h5 v-else class="md:h-full flex-center">
            {{ $t(getting ? "loading..." : "no data to display") }}
        </h5>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/plugins/axios.js';
import { toDate } from "@/utilities/date"
import store from '@/store';

const { school } = defineProps({
  school: Object
});

const getting = ref(false);
const loading = ref(false);
const moreInfo = ref(false);
const loadingMore = ref(false);
const isLoadingMore = computed(() => loadingMore.value && typeof loadingMore.value != 'number');

const query = ref({
    school: school.code, 
    from: "" || toDate() + 'T00:00',
    to: ""  || toDate() + 'T23:59',
    user: "",
    course: "",
    teacher: "",
});

const days40 = 1000 * 60 * 60 * 24 * 40;
const getLimit = ( date, limit ) => toDate(new Date(date).getTime() + limit) + `T${limit > 0 ? '23:59' : '00:00'}`

const payments = ref({
    statistic: {
        recipe: '0',
        payments: '0',
        discount: '0',
        payback: '0'
    },
    rows: [] //store.state.payments.rows
});

const search = async (first) => {
  try {
    first ? getting.value = true : loading.value = true;
    query.value.from = query.value.from || toDate() + 'T00:00';
    query.value.to = query.value.to || toDate() + 'T23:59';
    const { data } = await api.post(`/v1/payments/get/school${ isLoadingMore.value ? `?offset=${payments.value.rows.length}` : '' }`, query.value);
    // console.log({ isLoadingMore: isLoadingMore.value, result: data.rows.length });
    if (data.statistic) {
        payments.value = data;
    } else {
        payments.value.rows = isLoadingMore.value ? [ ...payments.value.rows, ...data.rows ] : data.rows;
    }
    loadingMore.value = data.rows.length < 20 && payments.value.rows.length;
    store.commit("set", {key: "payments", value: payments.value.rows });
    first ? getting.value = false : loading.value = false;
  } catch (error) {
    console.log(error);
  }
};

const loadmore = async (event) => {
    const { scrollTop, clientHeight, scrollHeight } = event.target;
    if(!loadingMore.value && (scrollTop + clientHeight >= scrollHeight-50)) {
        console.log("loadingmore : payments", loadingMore.value, scrollTop + clientHeight, scrollHeight - 50);
        loadingMore.value = true;
        try {
            await search();
        } catch (error) {
            console.log(error);
        }
    };
};

onMounted(async () => {
    try {
        await search(true);
    } catch (error) {
        console.log(error);
    }
});
</script>