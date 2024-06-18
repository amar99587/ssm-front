<template>
    <div v-bind="$attrs" class="space-y-4">
        <div class="sm:flex-between grid gap-4">
            <div class="text-pro">dashboard</div>
            <router-link :to="`/school/${school.code}/settings/information?subscription=true`" v-if="license_end < (date_now + 1000 * 60 * 60 * 24 * 10)" class="w-fit flex-between gap-4 hover:underline cursor-pointer smooth mx-auto sm:m-0">
                <h6>{{ license_end_left }} days until subscription ends</h6>
                <icon-app v-if="3 >= license_end_left" icon="ep:warning-filled" class="w-3 text-red-500" size="16" />
            </router-link>
        </div>
        <div class="grid gap-4 text-center mx-auto">
            <h2 class="tracking-[.0125rem] ml-[.0125rem]">{{school.name}}</h2>
            <h5 @click="copy(school.code.toUpperCase())">
                <a class="tracking-[.125rem] ml-[.125rem] font-medium uppercase cursor-pointer">{{ school.code }}</a>
                <br> 
                <h6 class="mini-text mt-2 cursor-pointer">tap here to copy school code</h6>
            </h5>
        </div>
        <hr>
        <div v-if="school.link?.rules">
            <input-app :value="query" @update="query = $event" icon="iconamoon:search-bold" class="w-full sm:w-6/12 md:w-4/12 lg:w-3/12 mx-auto mt-8 mb-12" type="search" placeholder="search in app" accessKey="s" />
            <div v-if="search.length" class="grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-4">
                <router-link v-for="{name, description, path, rule, icon} in search" :to="path" :class="{ 'hidden': !school.link.rules[rule] }" class="flex gap-2 bg-v p-4 rounded-v bg-v-hover smooth cursor-pointer">
                    <icon-app :icon="icon" size="24" />
                    <div class="grid gap-2">
                        <div class="font-medium first-letter:uppercase truncate">{{ name }}</div>
                        <h6 class="truncate">{{ description }}</h6>
                    </div>
                </router-link>
            </div>
            <h6 v-else class="h-full flex-center">no data to display</h6>
        </div>
        <h6 v-else class="mt-16 text-center">loading...</h6>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { toDate } from '@/utilities/date';

const { school } = defineProps([ "school" ]);

const query = ref("");

const license_end = computed(() => toDate(school.license_end, 'milliseconds'));
const date_now = computed(() => toDate('now', 'milliseconds'));
const license_end_left = computed(() => ((license_end.value - date_now.value) / (1000 * 60 * 60 * 24)).toFixed());

const Routes = ref([
    {
        name: 'New Student',
        icon: 'fluent:person-32-filled',
        path: `/school/${school.code}/students?new=true`,
        rule: 'students:create',
        description: 'add a new student to the school'
    },
    {
        name: 'Students List',
        icon: 'fluent:people-12-filled',
        path: `/school/${school.code}/students`,
        rule: 'students:access',
        description: 'list of the school students'
    },
    {
        name: 'New Course',
        icon: 'solar:document-bold',
        path: `/school/${school.code}/courses?new=true`,
        rule: 'courses:create',
        description: 'add a new course to the school'
    },
    {
        name: 'Courses List',
        icon: 'solar:documents-bold',
        path: `/school/${school.code}/courses`,
        rule: 'courses:access',
        description: 'list of the school courses'
    },
    {
        name: 'Timetable',
        icon: 'fluent:calendar-ltr-24-filled',
        path: `/school/${school.code}/timetable`,
        rule: 'timetable:access',
        description: 'manage school timetable'
    },
    {
        name: 'finance',
        icon: 'fa6-solid:money-check-dollar',
        path: `/school/${school.code}/finance`,
        rule: 'finance:access',
        description: 'manage school finance'
    },
    {
        name: 'settings',
        icon: 'fluent:settings-48-filled',
        path: `/school/${school.code}/settings`,
        rule: 'settings:access',
        description: 'manage school settings'
    },
    {
        name: 'school information',
        icon: 'pajamas:information',
        path: `/school/${school.code}/settings/information`,
        rule: 'settings:information:edit',
        description: 'manage school information'
    },
    {
        name: 'users',
        icon: 'fluent:people-12-filled',
        path: `/school/${school.code}/settings/users`,
        rule: 'settings:users:access',
        description: 'manage school users'
    },
    {
        name: 'new user',
        icon: 'fluent:person-32-filled',
        path: `/school/${school.code}/settings/users/new`,
        rule: 'settings:users:link',
        description: 'add a new user to the school'
    }
]);

const search = computed(() => Routes.value.filter( item => 
    item.name.toLowerCase().includes(query.value.toLowerCase()) ||
    item.description.toLowerCase().includes(query.value.toLowerCase())
));

const copy = text => {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
};
</script>