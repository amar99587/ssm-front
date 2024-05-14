<template>
    <div class="md:flex md:flex-col space-y-4">
        <div class="flex flex-col space-y-6" :class="{ 'min-h-[316px]': payments.length, 'min-h-[272px]': !payments.length }">
            <div class="flex-between">
                <div class="text-pro">finance <a v-if="getting && payments.length" class="animate-pulse">...</a></div>
                <icon-app v-if="loading" icon="svg-spinners:ring-resize" />
            </div>
            <form @submit.prevent="submitForm" class="grid md:grid-cols-4 gap-4">
                <button @click="search()" class="hidden"/>
                <div class="grid gap-2">
                    <input-app label="from" :value="query.from" @update="query.from = $event" @change="search()" type="datetime-local" icon="fluent:calendar-24-filled" :max="query.to" />
                </div>
                <div class="grid gap-2">
                    <input-app label="to" :value="query.to" @update="query.to = $event" @change="search()" type="datetime-local" icon="fluent:calendar-24-filled" :min="query.from" />
                </div>
                <div class="grid gap-2">
                    <input-app label="user" :value="query.user" @update="query.user = $event" class="" type="search" icon="fluent:person-24-filled" placeholder="user name" />
                </div>
                <div class="grid gap-2">
                    <input-app label="course" :value="query.course" @update="query.course = $event" class="" type="search" icon="solar:document-bold" placeholder="course name" />
                </div>
            </form>
            <div class="grid md:grid-cols-4 gap-4">
                <div class="bg-v rounded-v flex flex-col w-full h-32 p-4">
                    <h5 class="font-bold">Recipe</h5>
                    <h2 class="h-full flex-center">
                        <a class="flex items-end gap-2">
                            <h6 class="opacity-0">DZD</h6>
                            {{ payments.reduce((sum, { total }) => sum + Number(total), 0) }}
                            <h6 class="mini-text">DZD</h6>
                        </a>
                    </h2>
                </div>
                <div class="bg-v rounded-v flex flex-col w-full h-32 p-4">
                    <h5 class="font-bold">Payments</h5>
                    <h2 class="h-full flex-center">{{ payments.length }}</h2>
                </div>
                <div 
                    @click="payments = payments.sort((a, b) => {
                        const valueA = parseFloat(a.price) * parseInt(a.quantity);
                        const valueB = parseFloat(b.price) * parseInt(b.quantity);

                        return valueB - parseFloat(b.total) - (valueA - parseFloat(a.total));
                    })" 
                    class="bg-v rounded-v flex flex-col w-full h-32 p-4 cursor-pointer"
                >
                    <div class="flex-between">
                        <h5 class="font-bold">Discount</h5>
                        <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                    </div>
                    <h2 class="h-full flex-center">
                        <a class="flex items-end gap-2">
                            <h6 class="opacity-0">DZD</h6>
                            {{ -1 * payments.reduce((sum, { price, quantity, total }) => price * quantity > total ? (total - (price * quantity)) + sum : sum, 0) }}
                            <h6 class="mini-text">DZD</h6>
                        </a>
                    </h2>
                </div>
                <div 
                    @click="payments = payments.sort((a, b) => Object.values(a).some(value => value <= 0) ? -1 : Object.values(b).some(value => value <= 0) ? 1 : 0)" 
                    class="bg-v rounded-v flex flex-col w-full h-32 p-4 cursor-pointer"
                >
                    <div class="flex-between">
                        <h5 class="font-bold">Pay back</h5>
                        <div class="w-3 h-3 bg-orange-500 rounded-full"></div>
                    </div>
                    <h2 class="h-full flex-center">
                        <a class="flex items-end gap-2">
                            <h6 class="opacity-0">DZD</h6>
                            {{ -1 * payments.reduce((sum, { total }) => total < 0 ? sum + Number(total) : sum, 0) }}
                            <h6 class="mini-text">DZD</h6>
                        </a>
                    </h2>
                </div>
            </div>
            <h5 v-if="payments.length" class="px-2 grid grid-cols-3 sm:grid-cols-6 gap-4 text-center">
                <div class="truncate cursor-pointer" @click="payments.sort((a, b) => a.user_name - b.user_name)">User</div>
                <div class="truncate cursor-pointer" @click="payments = payments.sort((a, b) => a.course_name - b.course_name)">Course</div>
                <div class="hidden sm:block truncate cursor-pointer">Price</div>
                <div class="hidden sm:block truncate cursor-pointer">Quantity</div>
                <div class="truncate cursor-pointer">Total</div>
                <div class="hidden sm:block truncate cursor-pointer">Created At</div>
            </h5>
        </div>
        <h5 v-if="payments.length" class="h-full space-y-4 overflow-y-auto">
            <h5 v-for="(item, index) in payments" :key="index" class="bg-v bg-v-hover rounded-v p-2 grid grid-cols-3 sm:grid-cols-6 gap-4 text-center overflow-y-auto smooth">
                <div class="truncate">{{ item.user_name }}</div>
                <div class="truncate">{{ item.course_name }}</div>
                <div class="hidden sm:block truncate" :class="{ 'font-bold text-orange-500': item.price <= 0 }">{{ item.price }} <a class="text-xs font-medium">DZD</a></div>
                <div class="hidden sm:block truncate" :class="{ 'font-bold text-orange-500': item.quantity <= 0 }">{{ item.quantity }}</div>
                <div class="truncate" :class="{ 'font-bold text-blue-500': item.price * item.quantity > item.total, 'font-bold text-orange-500': item.total <= 0 }">{{ item.total }} <a class="text-xs font-medium">DZD</a></div>
                <div class="hidden sm:block truncate">{{ toDate(item.created_at, "timestamp") }}</div>
            </h5>
        </h5>
        <h5 v-else class="md:h-full flex-center">
            no data to display
        </h5>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/plugins/axios.js';
import { toDate } from "@/utilities/date"
import store from '@/store';

const { school } = defineProps({
  school: Object
});

const getting = ref(false);
const loading = ref(false);

const query = ref({
    school: school.code, 
    from: "" || toDate() + 'T00:00',
    to: ""  || toDate() + 'T23:59',
    user: "",
    course: "",
});

const payments = ref([]); //store.state.payments

const search = async (first) => {
  try {
    first ? getting.value = true : loading.value = true;
    query.value.from = query.value.from || toDate() + 'T00:00';
    query.value.to = query.value.to || toDate() + 'T23:59';
    const { data } = await api.post("/api/payments/get/school", query.value);
    payments.value = data;
    first ? getting.value = false : loading.value = false;
  } catch (error) {
    console.log(error);
  }
};

onMounted(async () => await search(true));
</script>