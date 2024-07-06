<template>
    <header dir="ltr" class="bg-White h-[50px] p-4 flex-between rounded-v z-50 -border-pro">
        <div class="flex-between gap-4">
            <img @click="$router.push('/')" name="Logo" src="../assets/img/logo.png" class="h-5 dark:hidden">
            <img @click="$router.push('/')" name="Logo" src="../assets/img/white-logo.png" class="h-5 hidden dark:block">
            <h6 class="font-black text-micro text-gray-600 dark:text-gray-400">BETA</h6>
        </div>

        <!-- Desktop -->
        <div dir="rtl" class="hidden sm:flex-between gap-6">
            <icon-app @click="menu = !menu" :icon="user ? 'fluent:person-24-filled' : 'ep:more-filled'" size="24"
                class="w-5 h-5 cursor-pointer" name="Account" />
            <Transition>
                <menu v-if="menu" @mouseleave="menu = false"
                    class="min-w-[250px] fixed bg-white dark:bg-gray-800 border-v drop-shadow-2xl p-4 rounded-v m-auto grid gap-3 z-50"
                    :class="{ 'translate-y-44': !installed, 'translate-y-40': installed }">

                    <div class="flex-between -translate-y-2">
                        <icon-app @click="menu = false" icon="fa6-solid:xmark" size="24" class="cursor-pointer" />
                        <h3>menu</h3>
                    </div>

                    <div class="flex-between gap-3">
                        <router-link :to="user ? '/account' : '/login'" @click="menu = false"
                            class="w-full bg-v bg-v-hover p-2 flex-between rounded-v smooth">
                            <h5>compte</h5>
                            <icon-app icon="fluent:person-24-filled" size="24" />
                        </router-link>
                        <div @click="mode(!dark)" :title="`Switch to ${dark ? 'Light' : 'Dark'} mode`"
                            class="min-w-fit bg-v bg-v-hover p-2.5 flex-between rounded-v cursor-pointer smooth">
                            <icon-app
                                :icon="dark ? 'line-md:moon-filled-to-sunny-filled-loop-transition' : 'line-md:sunny-filled-loop-to-moon-filled-loop-transition'"
                                size="24" />
                        </div>
                        <!-- <div @click="changeLanguage(language == 'ar' ? 'fr' : 'ar')"
                            :title="`Switch to ${language == 'ar' ? 'French' : 'Arabic'} language`"
                            class="h-9 min-w-[36px] bg-v bg-v-hover p-2.5 flex-between rounded-v cursor-pointer smooth">
                            {{ language == 'ar' ? 'Fr' : 'Ar' }}
                        </div> -->
                    </div>

                    <div @click="menu = false" class="grid gap-3 mt-4">
                        <button v-if="!installed" @click="install"
                            class="bg-v bg-v-hover p-2 flex-between rounded-v smooth">
                            <h5>Installer l'app</h5>
                            <icon-app icon="fluent:arrow-download-16-filled" size="24" />
                        </button>
                        <a href="https://proecole.com/fr/index.html" target="_blank"
                            class="bg-v bg-v-hover p-2 flex-between rounded-v smooth">
                            <h5>aide</h5>
                            <icon-app icon="fluent:question-circle-12-filled" size="24" />
                        </a>
                        <a href="https://proecole.com/fr/index.html" target="_blank"
                            class="bg-v bg-v-hover p-2 flex-between rounded-v smooth">
                            <h5>contactez-nous</h5>
                            <icon-app icon="fluent:chat-12-filled" size="24" />
                        </a>
                        <a href="mailto:contact@proecole.com" target="_blank"
                            class="bg-v bg-v-hover p-2 flex-between rounded-v smooth">
                            <h5>signaler un bug</h5>
                            <icon-app icon="solar:bug-minimalistic-bold" size="24" />
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

        <!-- Phone -->
        <div dir="rtl" class="flex-between sm:hidden gap-6">
            <icon-app @click="menu = !menu" :icon="user ? 'fluent:person-24-filled' : 'ep:more-filled'" size="24"
                class="w-5 h-5 cursor-pointer" name="Account" />
            <Transition>
                <menu v-if="menu" @click="menu = false"
                    class="flex flex-col items-center fixed h-full w-full top-0 right-0 bg-black bg-opacity-50 z-50">
                    <div dir="auto" class="w-10/12 max-h-[90%] bg-White p-4 rounded-v m-auto grid gap-3">
                        <div dir="rtl" @click="menu = false">
                            <div class="absolute -translate-y-8 bg-v rounded-full px-2 py-1.5 mx-auto cursor-pointer">
                                <icon-app icon="fa6-solid:xmark" size="24" />
                            </div>
                        </div>

                        <h3 class="-translate-y-2">menu</h3>

                        <div class="flex-between gap-3">
                            <div v-if="installed" @click="refresh()"
                                class="min-w-[36px] min-h-[36px] bg-v flex-center rounded-v">
                                <icon-app icon="material-symbols:refresh-rounded" size="24" />
                            </div>
                            <!-- <div @click="changeLanguage(language == 'ar' ? 'fr' : 'ar')"
                                class="h-9 min-w-[36px] bg-v p-2 flex-between rounded-v">
                                {{ language == 'ar' ? 'Fr' : 'Ar' }}
                            </div> -->
                            <div @click="mode(!dark)" class="min-w-[36px] min-h-[36px] bg-v flex-center rounded-v">
                                <icon-app
                                    :icon="dark ? 'line-md:moon-filled-to-sunny-filled-loop-transition' : 'line-md:sunny-filled-loop-to-moon-filled-loop-transition'"
                                    size="24" />
                            </div>
                            <router-link :to="user ? '/account' : '/login'"
                                class="w-full bg-v p-2 flex-between rounded-v">
                                <h5>compte</h5>
                                <icon-app icon="fluent:person-24-filled" size="24" />
                            </router-link>
                        </div>

                        <div class="space-y-3 overflow-y-auto">
                            <div v-if="route.params.school && school" class="space-y-3 pt-4">
                                <h4>{{ school.name }}</h4>
                                <router-link to="dashboard"
                                    class="bg-v p-2 flex-between rounded-v">
                                    <h5>tableau de bord</h5>
                                    <icon-app icon="fluent:grid-24-filled" size="24" />
                                </router-link>
                                <router-link v-if="checkRole('students')" to="students" class="bg-v p-2 flex-between rounded-v">
                                    <h5>les élèves</h5>
                                    <icon-app icon="fluent:people-12-filled" size="24" />
                                </router-link>
                                <router-link v-if="checkRole('courses')" to="courses"
                                    class="bg-v p-2 flex-between rounded-v">
                                    <h5>les cours</h5>
                                    <icon-app icon="solar:documents-bold" size="24" />
                                </router-link>
                                <router-link v-if="checkRole('teachers')" to="teachers"
                                    class="bg-v p-2 flex-between rounded-v">
                                    <h5>les profs</h5>
                                    <icon-app icon="solar:documents-bold" size="24" />
                                </router-link>
                                <router-link v-if="checkRole('timetable')" to="timetable" class="bg-v p-2 flex-between rounded-v">
                                    <h5>Emploi du Temps</h5>
                                    <icon-app icon="fluent:calendar-ltr-24-filled" size="24" />
                                </router-link>
                                <router-link v-if="checkRole('finance')" to="finance"
                                    class="bg-v p-2 flex-between rounded-v">
                                    <h5>Finance</h5>
                                    <icon-app icon="fa6-solid:money-check-dollar" size="24" />
                                </router-link>
                                <router-link v-if="checkRole('statistics')" to="statistics" class="bg-v p-2 flex-between rounded-v">
                                    <h5>Statistiques</h5>
                                    <icon-app icon="majesticons:chart-pie" size="24" />
                                </router-link>
                                <router-link v-if="checkRole('settings')" to="settings" class="bg-v p-2 flex-between rounded-v">
                                    <h5>Paramètres</h5>
                                    <icon-app icon="fluent:settings-48-filled" size="24" />
                                </router-link>
                            </div>

                            <h4 class="pt-4">Plus</h4>
                            <a v-if="!installed" @click="install" class="bg-v p-2 flex-between rounded-v">
                                <h5>Installer l'app</h5>
                                <icon-app icon="fluent:arrow-download-16-filled" size="24" />
                            </a>
                            <a href="https://proecole.com/fr/index.html" target="_blank"
                                class="bg-v p-2 flex-between rounded-v">
                                <h5>aide</h5>
                                <icon-app icon="fluent:question-circle-12-filled" size="24" />
                            </a>
                            <a href="https://proecole.com/fr/index.html" target="_blank"
                                class="bg-v p-2 flex-between rounded-v">
                                <h5>contactez-nous</h5>
                                <icon-app icon="fluent:chat-12-filled" size="24" />
                            </a>
                            <a href="mailto:contact@proecole.com" target="_blank"
                                class="bg-v p-2 flex-between rounded-v">
                                <h5>signaler un bug</h5>
                                <icon-app icon="solar:bug-minimalistic-bold" size="24" />
                            </a>
                        </div>

                        <div class="text-center flex-between">
                            <div class="w-full border-b-[1px]" />
                            <h6 v-text="new Date().getFullYear()" class="w-10/12" />
                            <div class="w-full border-b-[1px]" />
                        </div>
                    </div>
                </menu>
            </Transition>
        </div>
    </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import store from '@/store';

const { locale } = useI18n();

const route = useRoute();

const user = computed(() => store.state.user);
const school = computed(() => store.state.school);

const checkRole = role => {
    if (school.value.link?.type == "owner") {
        return true;
    } else {
        const group = Object.entries(school.value.link.rules).reduce((acc, [key, value]) => {
            const [group] = key.split(':');
            acc[group] = acc[group] || {};
            acc[group][key] = value;
            return acc;
        }, {});

        const acc = group[role] ? !Object.values(group[role]).every((value) => value == false) : false;

        return acc;
    }
};

const menu = ref(false);
const app = document.querySelector("html");
const dark = ref(localStorage.dark == "true");
const language = ref(localStorage.language);

const mode = darkMode => {
    function changeApp() {
        const manifestLink = document.querySelector('link[rel="manifest"]');
        const themeColorMetaTag = document.querySelector('meta[name="theme-color"]');
        if (manifestLink) {
            manifestLink.setAttribute('href', darkMode ? '/manifest-dark.json' : '/manifest-light.json');
        }
        if (themeColorMetaTag) {
            themeColorMetaTag.setAttribute('content', darkMode  ? "#394151"  :  "#e5e7eb");
        }
    }
    dark.value = darkMode;
    localStorage.dark = darkMode;
    darkMode ? app.classList.add("dark") : app.classList.remove("dark");
    changeApp(darkMode);
};

const changeLanguage = i => {
    document.querySelector('html').setAttribute('dir', i == 'ar' ? 'rtl' : 'ltr');
    locale.value = i;
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

const refresh = () => {
    if (window.confirm('are you sure you want to reload the page ?')) {
        window.location.reload();
    }
};
</script>