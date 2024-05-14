<template>
    <div class="flex flex-col">
        <div class="space-y-4 min-h-[96px]">
            <h4 class="font-bold">new user</h4>
            <input-app :value="user.toUpperCase()" @update="user = $event" icon="fluent:person-24-filled"
                placeholder="SDF-4P6-W5U" center maxlength="11" />
        </div>

        <div class="h-full space-y-4 overflow-y-auto">
            <div v-for="(permissions, category) in rulesGroup" :key="category"
                class="w-full grid grid-cols-1 gap-4 border-v rounded-v smooth">
                <h4 class="bg-v py-2 px-4">{{ category }}</h4>
                <div class="mx-4 grid gap-3 divide-y-2 divide-gray-200 dark:divide-gray-700 -translate-y-3">
                    <div v-for="(permission, key) in permissions" :key="key"
                        class="flex justify-between items-start pt-3">
                        <div class="w-10/12 space-y-2">
                            <h4 :class="{ 'mini-text': !rules[key] }" class="smooth">{{ rulesExplanation[key]?.title }}
                            </h4>
                            <h6 v-if="rulesExplanation[key]?.description.length" class="mini-text">{{ rulesExplanation[key]?.description }}</h6>
                        </div>
                        <switch-app :value="rules[key]" @update="changeRule(category, key, $event)" />
                    </div>
                </div>
            </div>

            <btn-app text="link" @click="link()" icon="fluent:add-12-filled" :loading="loading" dark
                class="min-w-fit mx-auto" :disabled="!isCodeValid" />

            <!-- <h6 class="text-center mini-text">
                <a class="font-bold">First</a>, enter your user code in the entry above <br>
                for example: your user code is {{ $store.state.user.code.toUpperCase() }}, <br>
                you can found it on the Account page. <br>
                <a class="font-bold">Secondly</a>, give your user the permissions you want to. <br>
                <a class="font-bold">Finnaly</a>, click " Link " to make requist to your user.
                need help? click <router-link to="/help" class="link">here</router-link>
            </h6> -->

            <h6 class="text-center mini-text">the user also need to added your school <br>to complete this operation
                <br> need help? click <router-link to="/help" class="link">here</router-link></h6>
        </div>

    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '@/plugins/axios.js';
import { useRouter } from 'vue-router';

const router = useRouter();

const { school } = defineProps({
    school: Object
});

const loading = ref(false);

const user = ref("");
const rules = ref(require('@/assets/json/school-rules.json'));
const rulesGroup = computed(() => Object.entries(rules.value).reduce((acc, [key, value]) => {
    const [group] = key.split(':');
    acc[group] = acc[group] || {};
    acc[group][key] = value;
    return acc;
}, {}));
const rulesExplanation = ref(require('@/assets/json/school-rules-explanation.json'));

const isCodeValid = computed(() => {
    const pattern = /^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{3}$/;
    return pattern.test(user.value);
});

const changeRule = (category, rule, newValue) => {
    rules.value[rule] = newValue;

    const access = {
        category: category + ":access",
        need: {},
    };
    
    for (const key in rules.value) {
        const [prefix, accessType] = key.split(':');
        if (!access.need[prefix]) {
            access.need[prefix] = [];
        }
        if (accessType !== 'access') {
            access.need[prefix].push(key);
        }
    }
    
    if (access.need[category].includes(rule) && newValue) {
        rules.value[access.category] = true;
    } 
    // else {
    //     if (rule == access.category) {
    //         rules.value[access.category] = false;
    //         for (const key in access.need[category]) {
    //             rules.value[access.need[category][key]] = false;
    //         }
    //     } else if (rule.endsWith("access")) {
    //         const restRule = rule.replace("access", "");
    //         for (const key in rules.value) {
    //             if (key.startsWith(restRule)) {
    //                 rules.value[key] = false;
    //             }
    //         }
    //     }
    // }
};

const link = async () => {
    if (isCodeValid && window.confirm("Do you want to link a new user")) {
        try {
            loading.value = true;
            const result = await api.post("/api/link/new", { user: user.value, school: school.code, rules: rules.value });
            console.log(result.data);
            if (result?.data?.user_code) {
                router.push(`/school/${school.code}/settings/users?uid=${result.data.user_code}`);
            }
        } catch (error) {
            console.log(error.name);
            console.log(error.message);
        }
        loading.value = false;
    }
};
</script>