<template>
  <div class="flex flex-col">
    <div class="space-y-4 min-h-[96px]">
      <div class="flex-between">
        <div class="text-pro">users <a v-if="getting && users.length" class="animate-pulse">...</a></div>
        <icon-app v-if="loading" icon="svg-spinners:ring-resize" />
      </div>

      <div class="flex-between gap-4">
        <router-link v-if="store.getters.permission('settings:users:link')" :to="`/school/${school.code}/settings/users/new`" class="btn-mini">
          <icon-app icon="fluent:add-12-filled" class="w-3" />
        </router-link>
        <div class="w-full flex-between gap-4">
          <input-app :value="query" @update="query = $event" type="search" icon="fluent:people-12-filled"
            placeholder="user code or name" accessKey="c" />
        </div>
      </div>
    </div>

    <h5 v-if="search.length" class="h-full space-y-4 overflow-y-auto">
      <router-link v-for="{ code, status, data } in search" :to="store.getters.permission('settings:users:rules:access') ? `/school/${school.code}/settings/users/${code}` : ''"
        class="flex-between bg-v bg-v-hover rounded-v py-2 cursor-pointer smooth" :class="{ 'mini-text': !data?.name }">
        <div class="min-w-[36px] flex-center mx-2">
          <icon-app icon="fluent:person-24-filled" />
        </div>
        <div class="w-full font-medium truncate">
            {{ `${code.toUpperCase()} : ${status == "active" ? data.name : "watting for user"}` }}
        </div>
        <h6 v-text="code == store.state.user.code ? 'You' : (code == route.query.uid ? 'New' : '')" :class="{ 'text-red-400': code == route.query.uid, 'mini-text': code != route.query.uid }" class="min-w-fit flex-center mx-2" />
      </router-link>
    </h5>

    <h6 v-else-if="!search.length || getting" class="h-full flex-center">
      {{ getting ? "LOADING..." : "no data to display" }}
    </h6>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router'
import api from '@/plugins/axios.js';
import store from '@/store';

const { school } = defineProps({
  school: Object
});

const route = useRoute();

const getting = ref(false);
const loading = ref(false);

const query = ref("");

const users = ref(store.state.users);

onMounted(async () => {
  try {
    getting.value = true;
    const result = await api.get("/v1/schools/get/all/users/" + school.code);
    users.value = result.data;
    store.commit("set", { key: "users", value: result.data });
    getting.value = false;
  } catch (error) {
    console.log(error.name);
    console.log(error.message);
    getting.value = false;
  }
});

const search = computed(() => {
  return users.value.filter(({ code, data }) =>
    code.toLowerCase().includes(query.value.toLowerCase()) ||
    data?.name.toLowerCase().includes(query.value.toLowerCase())
  );
});
</script>