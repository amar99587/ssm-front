<template>
    <nav dir="ltr" class="bg-White h-[50px] p-4 flex-between rounded-v z-50 -border-pro">
        <img @click="$router.push('/')" name="Logo" src="../assets/img/logo.png" class="h-5 dark:hidden">
        <img @click="$router.push('/')" name="Logo" src="../assets/img/white-logo.png" class="h-5 hidden dark:block">
        <div dir="rtl" class="hidden sm:flex-between gap-6">
            <icon-app @click="menu = !menu" :icon="user ? 'fluent:person-24-filled' : 'ep:more-filled'" size="24"
                class="w-5 h-5 cursor-pointer" name="Account" />
            <Transition>
                <menu v-if="menu" @mouseleave="menu = false" class="min-w-[250px] fixed translate-y-36 bg-white dark:bg-gray-800 border-v drop-shadow-2xl p-4 rounded-v m-auto grid gap-3 z-50">

                    <div class="flex-between -translate-y-2">
                        <icon-app @click="menu = false" icon="fa6-solid:xmark" size="24" class="cursor-pointer" />
                        <h3>menu</h3>
                    </div>

                    <div class="flex-between gap-3">
                            <router-link :to="user ? '/account' : '/login'" @click="menu = false" class="w-full bg-v bg-v-hover p-2 flex-between rounded-v smooth">
                                <h5>account</h5>
                                <icon-app icon="fluent:person-24-filled" size="24" />
                            </router-link>
                            <div @click="mode(!dark)" :title="`Switch to ${dark ? 'Light' : 'Dark'} mode`" class="min-w-fit bg-v bg-v-hover p-2 flex-between rounded-v cursor-pointer smooth">
                                <icon-app :icon="dark ? 'line-md:moon-filled-to-sunny-filled-loop-transition' : 'line-md:sunny-filled-loop-to-moon-filled-loop-transition'" size="24" />
                            </div>
                            <div @click="change(language == 'ar' ? 'fr' : 'ar')" :title="`Switch to ${language == 'ar' ? 'French' : 'Arabic'} language`" class="min-w-fit bg-v bg-v-hover p-2 flex-between rounded-v cursor-pointer smooth">
                                <icon-app icon="heroicons:language-16-solid" size="24" />
                            </div>
                        </div>

                        <div @click="menu = false" class="grid gap-3 mt-4">
                            <button v-if="!installed" @click="install" class="bg-v bg-v-hover p-2 flex-between rounded-v smooth">
                                <h5>Install App</h5>
                                <icon-app icon="fluent:arrow-download-16-filled" size="24" />
                            </button>
                            <a href="https://proecole.com/fr/index.html" target="_blank" class="bg-v bg-v-hover p-2 flex-between rounded-v smooth">
                                <h5>contact us</h5>
                                <icon-app icon="fluent:chat-12-filled" size="24" />
                            </a>
                            <a href="https://proecole.com/fr/index.html" target="_blank" class="bg-v bg-v-hover p-2 flex-between rounded-v smooth">
                                <h5>help</h5>
                                <icon-app icon="fluent:question-circle-12-filled" size="24" />
                            </a>
                        </div>

                        <div class="text-center flex-between">
                            <div class="w-full border-b-[1px]" />
                            <h6 v-text="new Date().getFullYear()" class="w-10/12" />
                            <div class="w-full border-b-[1px]" />
                        </div>
                    </menu>
            </Transition>
        </div>

        <div dir="rtl" class="flex-between sm:hidden gap-6">
            <icon-app @click="menu = !menu" :icon="user ? 'fluent:person-24-filled' : 'ep:more-filled'" size="24"
                class="w-5 h-5 cursor-pointer" name="Account" />
            <Transition>
                <menu v-if="menu" @click="menu = false"
                    class="flex flex-col items-center fixed h-full w-full top-0 right-0 bg-black bg-opacity-50 z-50">
                    <div dir="auto" class="w-10/12 bg-White p-4 rounded-v m-auto grid gap-3">
                        <div dir="rtl" @click="menu = false">
                            <div class="absolute -translate-y-8 bg-v rounded-full px-2 py-1.5 mx-auto cursor-pointer">
                                <icon-app icon="fa6-solid:xmark" size="24" />
                            </div>
                        </div>

                        <h3 class="-translate-y-2">menu</h3>

                        <div class="flex-between gap-3">
                            <div @click="change(language == 'ar' ? 'fr' : 'ar')" class="min-w-fit bg-v p-2 flex-between rounded-v">
                                <icon-app icon="heroicons:language-16-solid" size="24" />
                            </div>
                            <div @click="mode(!dark)" class="min-w-fit bg-v p-2 flex-between rounded-v">
                                <icon-app :icon="dark ? 'line-md:moon-filled-to-sunny-filled-loop-transition' : 'line-md:sunny-filled-loop-to-moon-filled-loop-transition'" size="24" />
                            </div>
                            <router-link :to="user ? '/account' : '/login'" class="w-full bg-v p-2 flex-between rounded-v">
                                <h5>account</h5>
                                <icon-app icon="fluent:person-24-filled" size="24" />
                            </router-link>
                        </div>

                        <div v-if="route.params.school && school" class="grid gap-3 mt-4">
                            <h4>{{ school.name }}</h4>
                            <router-link :to="`/school/${route.params.school}/dashboard`" class="bg-v p-2 flex-between rounded-v">
                                <h5>dashboard</h5>
                                <icon-app icon="fluent:grid-24-filled" size="24" />
                            </router-link>
                            <router-link v-if="rule(school.link.rules, 'students')" :to="`/school/${route.params.school}/students`" class="bg-v p-2 flex-between rounded-v">
                                <h5>students</h5>
                                <icon-app icon="fluent:people-12-filled" size="24" />
                            </router-link>
                            <router-link v-if="rule(school.link.rules, 'courses')" :to="`/school/${route.params.school}/courses`" class="bg-v p-2 flex-between rounded-v">
                                <h5>courses</h5>
                                <icon-app icon="solar:documents-bold" size="24" />
                            </router-link>
                            <router-link v-if="rule(school.link.rules, 'timetable')" :to="`/school/${route.params.school}/timetable`" class="bg-v p-2 flex-between rounded-v">
                                <h5>timetable</h5>
                                <icon-app icon="fluent:calendar-ltr-24-filled" size="24" />
                            </router-link>
                            <router-link v-if="rule(school.link.rules, 'finance')" :to="`/school/${route.params.school}/finance`" class="bg-v p-2 flex-between rounded-v">
                                <h5>finance</h5>
                                <icon-app icon="fa6-solid:money-check-dollar" size="24" />
                            </router-link>
                            <router-link v-if="rule(school.link.rules, 'settings')" :to="`/school/${route.params.school}/settings`" class="bg-v p-2 flex-between rounded-v">
                                <h5>settings</h5>
                                <icon-app icon="fluent:settings-48-filled" size="24" />
                            </router-link>
                        </div>

                        <div class="grid gap-3 mt-4">
                            <button v-if="!installed" @click="install" class="bg-v p-2 flex-between rounded-v">
                                <h5>Install App</h5>
                                <icon-app icon="fluent:arrow-download-16-filled" size="24" />
                            </button>
                            <a href="https://proecole.com/fr/index.html" target="_blank" class="bg-v p-2 flex-between rounded-v">
                                <h5>contact us</h5>
                                <icon-app icon="fluent:chat-12-filled" size="24" />
                            </a>
                            <a href="https://proecole.com/fr/index.html" target="_blank" class="bg-v p-2 flex-between rounded-v">
                                <h5>help</h5>
                                <icon-app icon="fluent:question-circle-12-filled" size="24" />
                            </a>
                        </div>

                        <div class="text-center flex-between mt-4">
                            <div class="w-full border-b-[1px]" />
                            <h6 v-text="new Date().getFullYear()" class="w-10/12" />
                            <div class="w-full border-b-[1px]" />
                        </div>
                    </div>
                </menu>
            </Transition>
        </div>
    </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router';
import store from '@/store';

const route = useRoute();

const user = computed(() => store.state.user);
const school = computed(() => store.state.schools.filter((i) => i.code == route.params.school)[0]);

const rule = (rules, i) => {
    const group = Object.entries(rules).reduce((acc, [key, value]) => {
        const [group] = key.split(':');
        acc[group] = acc[group] || {};
        acc[group][key] = value;
        return acc;
    }, {});
    
    const acc = !Object.values(group[i]).every((value) => value == false);
    
    return acc;
};

const menu = ref(false);
const app = document.querySelector("html");
const dark = ref(localStorage.dark == "true");
const language = ref(localStorage.language);

const mode = i => {
    dark.value = i;
    localStorage.dark = i;
    i ? app.classList.add("dark") : app.classList.remove("dark");
};

const change = i => {
    language.value = i;
    localStorage.language = i;
    app.lang = i;
};

const installed = ref(true);
let deferredPrompt;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  installed.value = false;
});

const install = () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(choice => {
      if (choice.outcome == 'accepted') {
        console.log('PWA installed');
      }
      installed.value = true; 
    });
    deferredPrompt = null;
  }
};
</script>