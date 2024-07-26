<template>
    <div class="flex flex-col">
        <div class="space-y-4 min-h-[96px]">
            <h4 class="font-bold">Lier un nouvel utilisateur</h4>
            <input-app :value="user.toUpperCase()" @update="user = $event" icon="fluent:person-24-filled"
                placeholder="entrez le code utilisateur" center maxlength="11" />
        </div>

        <div class="h-full space-y-4 overflow-y-auto">
            <div v-for="(permissions, category) in rulesGroup" :key="category"
                class="w-full grid grid-cols-1 gap-4 border-v rounded-v smooth">
                <h4 class="bg-v py-2 px-4">{{ translate(category) }}</h4>
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

            <btn-app text="lier" @click="link()" icon="fluent:add-12-filled" :loading="loading" dark
                class="min-w-fit mx-auto" :disabled="!isCodeValid" />

            <h6 class="text-center mini-text">l'utilisateur doit également ajouter votre école <br> pour terminer cette opération
                <!-- <br> need help? click <router-link to="/help" class="link">here</router-link> -->
            </h6>
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
const rulesExplanation = ref(require('@/assets/json/school-rules-explanation.json'));
const rulesGroup = computed(() => Object.entries(rules.value).reduce((acc, [key, value]) => {
    const [group] = key.split(':');
    acc[group] = acc[group] || {};
    acc[group][key] = value;

    // Delete the 'teachers' and 'statistics' property
    delete acc.teachers;
    delete acc.statistics;
    return acc;
}, {}));

const isCodeValid = computed(() => {
    const pattern = /^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{3}$/;
    return pattern.test(user.value);
});

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

const changeRule = (category, rule, newValue) => {
    rules.value[rule] = newValue;
    if (newValue) {
        rules.value[`${category}:access`] = true;
        if (category == "students") {
            if (rule != "students:access") {
                rules.value["students:information:access"] = true;
            }
            switch (rule) {
                case "students:information:edit":
                    rules.value["students:information:access"] = true;
                    break;
                case "students:payments:add":
                    rules.value["students:courses:access"] = true;
                    rules.value["students:payments:access"] = true;
                    break;
                case "students:payments:discount":
                    rules.value["students:courses:access"] = true;
                    rules.value["students:payments:add"] = true;
                    rules.value["students:payments:access"] = true;
                    rules.value["students:payments:payback"] = true;
                    break;
                case "students:payments:payback":
                    rules.value["students:courses:access"] = true;
                    rules.value["students:payments:add"] = true;
                    rules.value["students:payments:access"] = true;
                    rules.value["students:payments:payback"] = true;
                    break;
            }
        } else if (category == "courses") {
            if (rule != "courses:access") {
                rules.value["courses:information:access"] = true;
            }
            switch (rule) {
                case "courses:information:edit":
                    rules.value["courses:information:access"] = true;
                    break;
                case "courses:lessons:create":
                    rules.value["courses:lessons:access"] = true;
                    break;
                case "courses:presence:edit":
                    rules.value["courses:presence:access"] = true;
                    break;
            }
        } else if (category == "settings") {
            if (rule != "settings:access") {
                rules.value["settings:users:access"] = true;
            }
            switch (rule) {
                case "settings:users:unlink":
                    rules.value["settings:users:rules:access"] = true;
                    break;
                case "settings:users:rules:edit":
                    rules.value["settings:users:rules:access"] = true;
                    break;
            }
        }
    } else {
        if (rule == `${category}:access`) {
            for (const key in rules.value) {
                if (key.startsWith(category)) {
                    rules.value[key] = false;
                }
            }
        } else if (category == "students") {
            switch (rule) {
                case "students:information:access":
                    for (const key in rules.value) {
                        if (key.startsWith(category) && key != "students:access") {
                            rules.value[key] = false;
                        }
                    }
                    break;
                case "students:payments:payback":
                    rules.value["students:payments:discount"] = false;
                    break;
            }
        } else if (category == "courses") {
            switch (rule) {
                case "courses:information:access":
                    for (const key in rules.value) {
                        if (key.startsWith(category) && key != "courses:access") {
                            rules.value[key] = false;
                        }
                    }
                    break;
                case "courses:lessons:access":
                    rules.value["courses:lessons:create"] = false;
                    break;
                case "courses:presence:access":
                    rules.value["courses:presence:edit"] = false;
                    break;
            }
        } else if (category == "settings") {
            switch (rule) {
                case "settings:users:access":
                    for (const key in rules.value) {
                        if (key.startsWith(category) && key != "settings:access") {
                            rules.value[key] = false;
                        }
                    }
                    break;
                case "settings:users:rules:access":
                    rules.value["settings:users:unlink"] = false;
                    rules.value["settings:users:rules:edit"] = false;
                    break;
            }
        }
    }
};

const link = async () => {
    if (isCodeValid.value && window.confirm("Voulez-vous lier un nouvel utilisateur ?")) {
        try {
            loading.value = true;
            const result = await api.post("/v1/link/new", { user: user.value, school: school.code, rules: rules.value });
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