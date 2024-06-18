<template>
  <div class="flex flex-col">
    <div class="space-y-4 min-h-[96px]">
      <div class="flex-between">
        <h4 class="font-bold">users <a v-if="getting && link" class="animate-pulse">...</a></h4>
      </div>
      <div class="space-y-4">
        <h5 class="flex-between gap-4 rounded-v smooth">
          <router-link v-if="link?.type != 'owner' && ($store.getters.permission('settings:users:unlink') || $store.state.user.code == link?.user_code)" :to="`/school/${school.code}/settings/users`" class="btn bg-v bg-v-hover">
            <icon-app icon="ion:chevron-back-outline" />
          </router-link>
          <h4 class="w-full bg-v rounded-v p-1.5 rounded-v text-center truncate">{{ route.params.user.toUpperCase() }}</h4>
          <div v-if="link?.type != 'owner' && ($store.getters.permission('settings:users:unlink') || $store.state.user.code == link?.user_code)" @click="unlink()" class="bg-v btn-mini flex-center p-2 rounded-v cursor-pointer hover:text-red-500 smooth">
            <icon-app :icon="loading == 'unlink' ? 'svg-spinners:ring-resize' : 'fluent:delete-24-filled'" />
          </div>
        </h5>
      </div>
    </div>

    <div v-if="link" class="h-full space-y-4 overflow-y-auto">
      <div v-for="(permissions, rule) in rulesGroup(link.rules)" :key="rule" class="w-full grid grid-cols-1 gap-4 border-v rounded-v smooth">
        <h4 class="bg-v py-2 px-4">{{ rule }}</h4>
        <!-- <p>{{ JSON.stringify(permissions) }}</p> -->
        <div class="mx-4 grid gap-3 divide-y-2 divide-gray-200 dark:divide-gray-700 -translate-y-3">
          <div v-for="(permission, key) in permissions" :key="key" class="flex justify-between items-start pt-3">                        
            <div class="w-10/12 space-y-2">
              <h4 :class="{ 'mini-text': !link.rules[key] }" class="smooth">{{ rulesExplanation[key]?.title }}</h4>
              <h6 v-if="rulesExplanation[key]?.description.length" class="mini-text">{{ rulesExplanation[key]?.description }}</h6>
            </div>
            <switch-app :value="link.rules[key]" @update="($store.getters.permission('settings:users:rules:edit') && $store.state.user.code != link.user_code && link.type != 'owner') ? link.rules[key] = $event : ''" />
          </div>
        </div>
      </div>

      <btn-app v-if="$store.getters.permission('settings:users:rules:edit') && $store.state.user.code != link.user_code && link.type != 'owner'" text="update" @click="update()" icon="fluent:add-12-filled" :loading="loading == 'update'" dark class="min-w-fit mx-auto" />

      <h6 class="text-center mini-text">user linked to the school at {{ $toDate(link.created_at, "timestamp") }}</h6>

      <h6 v-if="$store.getters.permission('settings:users:rules:edit') && $store.state.user.code != link.user_code && link.type != 'owner'" class="text-center mini-text">the user need to refreach the page to apply changes</h6>
    </div>

    <h6 v-else class="h-full flex-center">LOADING...</h6>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import api from '@/plugins/axios.js';

const { school } = defineProps(["school"]);

const route = useRoute();
const router = useRouter();

const getting = ref(false);
const loading = ref(false);

const link = ref(null);

const rulesGroup = (e) => {
  const originalRules = {};
  for (const key in require('@/assets/json/school-rules.json')) {
    originalRules[key] = e[key] == true;
  }
  const rules = Object.entries(originalRules).reduce((acc, [key, value]) => {
    const [group] = key.split(':');
    acc[group] = acc[group] || {};
    acc[group][key] = value;
    return acc;
  }, {});
  
  return rules;
};
const rulesExplanation = ref(require('@/assets/json/school-rules-explanation.json'));

onMounted(async () => {
  try {
    getting.value = true;
    const result = await api.get(`/v1/link/${route.params.user}/${school.code}`);
    if (result.data.exists) {
      link.value = result.data.data;
      getting.value = false;
    } else {
      getting.value = "user not found";
    }
  } catch (error) {
    console.log(error);
  }
});

const update = async () => {
  if (!loading.value && window.confirm("Do you want to edit this user ?")) {
    try {
      loading.value = "update";
      const result = await api.post(`/v1/link/${route.params.user}/${school.code}`, link.value.rules);
      console.log(result.data);
      router.go(-1);
    } catch (error) {
      console.log(error);
    }
  };
}

const unlink = async () => {
  if (!loading.value && window.confirm("Do you want to unlink this user ?")) {
    try {
      loading.value = "unlink";
      const result = await api.delete(`/v1/link/${route.params.user}/${school.code}`);
      router.push('/account');
    } catch (error) {
      console.log(error);
    }
  };
}
</script>