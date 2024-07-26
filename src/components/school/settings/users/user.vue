<template>
  <div class="flex flex-col">
    <div class="space-y-4 min-h-[96px]">
      <div class="flex-between">
        <h4 class="font-bold">{{ link?.username ? link.username : "utilisateur" }}<a v-if="getting && link" class="animate-pulse">...</a></h4>
        <icon-app v-if="link?.type == 'owner'" icon="material-symbols-light:kid-star" />
      </div>
      <div class="space-y-4">
        <h5 class="flex-between gap-4 rounded-v smooth">
          <router-link
            v-if="link && (link.type != 'owner') && ($store.getters.permission('settings:users:unlink') || $store.state.user.code == link.user_code)"
            :to="`/school/${school.code}/settings/users`" class="btn bg-v bg-v-hover">
            <icon-app icon="ion:chevron-back-outline" />
          </router-link>
          <h4 class="w-full bg-v rounded-v p-1.5 rounded-v text-center truncate">{{ route.params.user.toUpperCase() }}
          </h4>
          <div
            v-if="link && (link.type != 'owner') && ($store.getters.permission('settings:users:unlink') || $store.state.user.code == link.user_code)"
            @click="unlink()" class="bg-v btn-mini flex-center p-2 rounded-v cursor-pointer hover:text-red-500 smooth">
            <icon-app :icon="loading == 'unlink' ? 'svg-spinners:ring-resize' : 'fluent:delete-24-filled'" />
          </div>
        </h5>
      </div>
    </div>

    <div v-if="link" class="h-full space-y-4 overflow-y-auto">
      <div v-for="(permissions, category) in rulesGroup(link.rules)" :key="category" class="w-full grid grid-cols-1 gap-4 border-v rounded-v smooth">
        <h4 class="bg-v py-2 px-4">{{ translate(category) }}</h4>
        <div class="mx-4 grid gap-3 divide-y-2 divide-gray-200 dark:divide-gray-700 -translate-y-3">
          <div v-for="(permission, rule) in permissions" :key="rule" class="flex justify-between items-start pt-3">
            <div class="w-10/12 space-y-2">
              <h4 :class="{ 'mini-text': !link.rules[rule] }" class="smooth">{{ rulesExplanation[rule]?.title }}</h4>
              <h6 v-if="rulesExplanation[rule]?.description.length" class="mini-text">{{ rulesExplanation[rule]?.description }}</h6>
            </div>
            <switch-app :value="link.type == 'owner' ? true : link.rules[rule]"
              @update="($store.getters.permission('settings:users:rules:edit') && $store.state.user.code != link.user_code && link.type != 'owner') && changeRule(category, rule, $event)" />
          </div>
        </div>
      </div>

      <btn-app
        v-if="$store.getters.permission('settings:users:rules:edit') && $store.state.user.code != link.user_code && link.type != 'owner'"
        :text="$t('save')" @click="update()" icon="fluent:add-12-filled" :loading="loading == 'update'" dark
        class="min-w-fit mx-auto" />

      <h6 class="text-center mini-text">utilisateur lié à l'école à {{ $toDate(link.created_at, "timestamp") }}</h6>

      <h6
        v-if="$store.getters.permission('settings:users:rules:edit') && $store.state.user.code != link.user_code && link.type != 'owner'"
        class="text-center mini-text">l'utilisateur doit actualiser la page pour appliquer les modifications</h6>
    </div>

    <h6 v-else class="h-full flex-center">{{ $t('loading...') }}</h6>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import api from '@/plugins/axios.js';
import store from '@/store';

const { school } = defineProps(["school"]);

const route = useRoute();
const router = useRouter();

const getting = ref(false);
const loading = ref(false);

const link = ref(null);
const rulesExplanation = ref(require('@/assets/json/school-rules-explanation.json'));

const rulesGroup = (e) => {
  const originalRules = {};
  for (const key in require('@/assets/json/school-rules.json')) {
    originalRules[key] = e[key] == true;
  }
  const rules = Object.entries(originalRules).reduce((acc, [key, value]) => {
    const [group] = key.split(':');
    acc[group] = acc[group] || {};
    acc[group][key] = value;

    // Delete the 'teachers' and 'statistics' property
    delete acc.teachers;
    delete acc.statistics;
    return acc;
  }, {});

  return rules;
};

const translate = rule => {
  switch (rule.toLowerCase()) {
    case 'students':
      return 'étudiants'
    case 'courses':
      return 'les Cours'
    case 'timetable':
      return 'Emploi du Temps'
    case 'settings':
      return 'Paramètres'
    default:
      return rule;
  }
};

onMounted(async () => {
  try {
    getting.value = true;
    const result = await api.get(`/v1/link/${route.params.user}/${school.code}`);
    if (result.data.exists) {
      link.value = { ...result.data.data, username: store.state.users.find(({ code }) => code == route.params.user )?.data.name };
      getting.value = false;
    } else {
      getting.value = "user not found";
    }
  } catch (error) {
    console.log(error);
  }
});

const changeRule = (category, rule, newValue) => {
  link.value.rules[rule] = newValue;
  if (newValue) {
    link.value.rules[`${category}:access`] = true;
    if (category == "students") {
      if (rule != "students:access") {
        link.value.rules["students:information:access"] = true;
      }
      switch (rule) {
        case "students:information:edit":
          link.value.rules["students:information:access"] = true;
          break;
        case "students:payments:add":
          link.value.rules["students:courses:access"] = true;
          link.value.rules["students:payments:access"] = true;
          break;
      }
    } else if (category == "courses") {
      if (rule != "courses:access") {
        link.value.rules["courses:information:access"] = true;
      }
      switch (rule) {
        case "courses:information:edit":
          link.value.rules["courses:information:access"] = true;
          break;
        case "courses:lessons:create":
          link.value.rules["courses:lessons:access"] = true;
          break;
        case "courses:presence:edit":
          link.value.rules["courses:presence:access"] = true;
          break;
      }
    } else if (category == "settings") {
      if (rule != "settings:access") {
        link.value.rules["settings:users:access"] = true;
      }
      switch (rule) {
        case "settings:users:unlink":
          link.value.rules["settings:users:rules:access"] = true;
          break;
        case "settings:users:rules:edit":
          link.value.rules["settings:users:rules:access"] = true;
          break;
      }
    }
  } else {
    if (rule == `${category}:access`) {
      for (const key in link.value.rules) {
        if (key.startsWith(category)) {
          link.value.rules[key] = false;
        }
      }
    } else if (category == "students") {
      switch (rule) {
        case "students:information:access":
          for (const key in link.value.rules) {
            if (key.startsWith(category) && key != "students:access") {
              link.value.rules[key] = false;
            }
          }
          break;
      }
    } else if (category == "courses") {
      switch (rule) {
        case "courses:information:access":
          for (const key in link.value.rules) {
            if (key.startsWith(category) && key != "courses:access") {
              link.value.rules[key] = false;
            }
          }
          break;
        case "courses:lessons:access":
          link.value.rules["courses:lessons:create"] = false;
          break;
        case "courses:presence:access":
          link.value.rules["courses:presence:edit"] = false;
          break;
      }
    } else if (category == "settings") {
      switch (rule) {
        case "settings:users:access":
          for (const key in link.value.rules) {
            if (key.startsWith(category) && key != "settings:access") {
              link.value.rules[key] = false;
            }
          }
          break;
        case "settings:users:rules:access":
          link.value.rules["settings:users:unlink"] = false;
          link.value.rules["settings:users:rules:edit"] = false;
          break;
      }
    }
  }
};

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