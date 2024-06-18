import { createApp } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import "./assets/css/tailwind.css";
import { Icon } from "@iconify/vue";
import googleAuth from "vue3-google-login";
import input from "./components/utilities/input.vue";
import button from "./components/utilities/button.vue";
import Switch from "./components/utilities/switch.vue";
import select from "./components/utilities/select.vue";
import dialog from "./components/utilities/dialog.vue";
import { createI18n } from 'vue-i18n'

import { toDate } from "./utilities/date";

const app = createApp(App);

app.config.globalProperties.$toDate = (e, type) => toDate(e, type);

const googleAuthOptions = { 
  clientId: process.env.VUE_APP_GOOGLE_CLIENT_ID
};

const i18n = createI18n({
  legacy: false,
  locale: ['ar', 'fr'].includes(localStorage.language) ? localStorage.language : 'fr',
  fallbackLocale: 'fr',
  messages: {
    fr: require("@/assets/json/i18n-fr.json"),
    ar: require("@/assets/json/i18n-ar.json"),
  }
});

app.use(store).use(router).use(i18n)
.use(googleAuth, googleAuthOptions)
.component("btn-app", button)
.component("input-app", input)
.component("switch-app", Switch)
.component("select-app", select)
.component("dialog-app", dialog)
.component("icon-app", Icon)
.mount("#app");