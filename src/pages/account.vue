<template>
  <div v-bind="$attrs">
    <div class="grid gap-4">
      <!-- <div class="h-20 sm:h-32 bg-[url(https://bit.ly/3tOsUuK)] bg-cover bg-center rounded-v bg-v"></div> -->
      <div class="flex-between">
        <h2 class="text-pro">{{ $t('account') }}</h2>
        <h6 @click="logout" title="click here to logout from your account"
          class="flex-between gap-2 font-bold hover:link">
          {{ $t('logout') }} <icon-app icon="basil:login-solid" class="w-4 h-4" />
        </h6>
      </div>
      <div @click="copy(user.code.toUpperCase())" class="grid gap-2 text-center mx-auto my-4 cursor-pointer">
        <h2 class="tracking-[.25rem] ml-[.25rem] uppercase">{{ user.code }}</h2>
        <h6 class="mini-text">{{ $t('tap here to copy your code') }}</h6>
      </div>
      <h6 class="mx-auto mini-text">{{ user.email }}</h6>
      <h6 v-if="!schools && getting" class="text-center animate-pulse pt-8">{{ $t('loading...') }}</h6>

      <dialog-app :ref="dialog.item" title="abonnement" @close="!creating ? dialog.close() : false" :canClose="!creating">
        <div class="text-center grid gap-2 pt-4 pb-6">
          <h2 class="font-medium">{{ data.name }}</h2>
          <h4 v-if="data.code" class="uppercase tracking-wider">{{ data.code }}</h4>
        </div>
        <div class="space-y-2">
          <label for="email">durée en mois</label>
          <div class="flex-between gap-4">
            <div @click="++subscription.duration" class="btn-mini">
              <icon-app icon="fluent:add-12-filled" class="w-3" />
            </div>
            <input-app :value="subscription.duration" readonly type="number" min="1" center />
            <div @click="subscription.duration - 1 ? --subscription.duration : 0" class="btn-mini"
              :class="{ 'opacity-50 hover:opacity-50 cursor-not-allowed': subscription.duration == 1 }">
              <icon-app icon="ion:minus-round" class="w-3" />
            </div>
          </div>
          <h6 class="mini-text pb-2">
            l'abonnement expirera le 
            {{ toDate((+data.license?.end_left > 0 ? data.license?.end_at : data.license?.date_now) + (1000 * 60 * 60 * 24 * 30 * subscription.duration)) }}
          </h6>
        </div>
        <div class="w-full border-b-[1px] dark:border-gray-700 pb-1" />
        <div class="flex-between pt-1">
          <div>prix unitaire</div>
          <div>{{ subscription.price }} DA</div>
        </div>
        <div class="w-full border-b-[1px] dark:border-gray-700 pb-1" />
        <div class="flex-between pt-1">
          <div>prix total</div>
          <div>{{ subscription.price * subscription.duration }} DA</div>
        </div>
        <div class="flex-center pt-4">
          <btn-app text="payer" @click="createPayment(data.code)" :loading="creating" icon="twemoji:credit-card" dark />
        </div>
      </dialog-app>

      <div v-if="schools?.length" class="grid gap-4">
        <hr>
        <h2>{{ $t('schools') }}<a v-if="getting" class="animate-pulse">...</a></h2>
        <div class="grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div v-for="(school, index) in schools" :key="index" @click="redirect(school)"
            :class="{ 'opacity-60': getting && schools.length }"
            class="h-240 grid gap-4 border-v rounded-v p-4 hover:bg-v smooth cursor-pointer">
            <div class="flex-between">
              <icon-app v-if="school.type != 'owner'"
                :icon="school.status == 'inactive' ? 'mingcute:stopwatch-line' : 'material-symbols:attach-file-rounded'"
                size="16" />
              <icon-app v-if="school.license.end_left <= 3" icon="ep:warning-filled" class="text-red-500" size="16"
                title="license expires" />
              <icon-app v-if="school.status == 'inactive' || (school.type != 'owner' && school.license.end_left <= -30)" @click="deleteLink(school)"
                icon="fluent:delete-24-filled" class="hover:text-red-500 smooth" size="16" />
              <icon-app v-if="loading == school.code" @click="deleteLink(school)" icon="svg-spinners:ring-resize" size="16" />
            </div>
            <h2 class="w-full text-center my-2 truncate" :class="{ 'opacity-50': school.status == 'inactive' }">{{ school.name }}</h2>
            <h6 class="mx-auto mini-text uppercase">{{ school.code }}</h6>
          </div>
        </div>
        <hr>
      </div>

      <div v-if="schools?.length && !more">
        <h6 class="text-center">
          {{ $t('need more schools ?') }}
          <br> 
          {{ $t('click') }} <a @click="more = true" class="link">{{ $t('here') }}</a>.
        </h6>
      </div>
      <h2 v-if="schools.length && more">{{ $t('more schools') }}</h2>
      <div v-if="schools && (more || !schools.length)" class="grid sm:block gap-8">
        <div class="grid sm:grid-cols-11 gap-4 mx-auto sm:my-10">
          <div class="w-full sm:w-10/12 mx-auto col-span-5 p-4 border-v rounded-v grid gap-6">
            <h3>{{ $t("create school") }}</h3>
            <form @submit.prevent="submitForm" class="grid gap-4">
              <h6 v-if="!schools.some(item => item.type == 'owner')" class="sm:w-10/12 mx-auto mini-text">
                Profitez d'un mois d'essai gratuit pour votre première école
              </h6>
              <div class="sm:w-10/12 mx-auto">
                <input-app :value="name" @update="name = $event" center icon="solar:square-academic-cap-bold"
                  :placeholder="$t('enter here your school name')" class="mx-auto"
                  :readonly="(name.length && loading) || false" />
              </div>
              <btn-app @click="create" :text="$t('create')" icon="fluent:add-12-filled" dark class="mx-auto"
                :loading="(name.length && loading) || false" />
            </form>
          </div>
          <h5 class="hidden sm:block m-auto">{{ $t("or") }}</h5>
          <div class="w-full sm:w-10/12 mx-auto col-span-5 p-4 border-v rounded-v grid gap-6">
            <h3>{{ $t("link to school") }}</h3>
            <form @submit.prevent="submitForm" class="grid gap-4">
              <h6 class="sm:w-10/12 mx-auto mini-text">
                Créez un lien vers une autre école, gratuitement !
              </h6>
              <div class="sm:w-10/12 mx-auto">
                <input-app :value="code" @update="code = $event.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase()"
                  icon="fluent:link-16-filled" :placeholder="$t('enter here the school code')" class="mx-auto"
                  :readonly="(code.length && loading) || false" center maxlength="11" />
              </div>
              <btn-app @click="link" :text="$t('link')" icon="fluent:add-12-filled" dark class="mx-auto"
                :loading="(code.length && loading) || false" />
            </form>
            <!-- <h6 class="w-10/12 text-center mx-auto mini-text">
              Become a part of the educational journey with us. Enjoy the benefits of linking to any school for <a class="font-bold">FREE</a>.
              need help? click <router-link to="/help?link-to-school" class="link">here.</router-link>
            </h6> -->
          </div>
        </div>
        <h6 class="text-center mx-auto mini-text">
          {{ $t("for any questions or more informations, don't hesitate to") }}
          <a href="https://proecole.com/fr/index.html" target="_blank" class="link">{{ $t("reach out to us") }}</a>.
          <br class="hidden sm:block"> {{ $t("your satisfaction is our priority!") }}
        </h6>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import store from '@/store';
import router from '@/router';
import api from '@/plugins/axios.js';
import { useI18n } from 'vue-i18n';
import { toDate } from '@/utilities/date';

const { t } = useI18n();

const route = useRoute();

const loading = ref(false);
const getting = ref(false);
const creating = ref(false);

const user = ref(store.state.user);
const schools = ref(store.state.schools.length && store.state.schools);
const name = ref("");
const code = ref("");
const more = ref(false);

const data = ref({});

const dialog = {
  item: ref(null),
  open: () => dialog.item.value.open(),
  close: () => {
    data.value = {};
    dialog.item.value.close()
  }
};

const subscription = ref({
  price: 2500,
  duration: 1, // month
});

onMounted(async () => {
  try {
    getting.value = true;
    const result = await api.get("/v1/schools/user");
    store.commit("set", { key: "schools", value: result.data });
    schools.value = result.data;
    getting.value = false;
    const payment = route.query.subscription;
    if (payment && schools.value.some(item => item.code == payment)) {
      data.value = schools.value.find(item => item.code == payment);
      dialog.open();
    }
  } catch (error) {
    console.log(error);
  }
});

const copy = (text) => {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
};

const redirect = school => {
  if (school.license.end_left < 0 && school.type == 'owner') {
    data.value = school;
    dialog.open();
  } else if (school.license.end_left > 0) {
    loading.value = school.code;
    if (store.state.school.code != school.code) {
      store.commit("resetSchool");
      store.commit("set", { key: "school", value: { code: school.code } });
    }
    router.push(school.status == 'inactive' ? '' : `/school/${school.code}/dashboard`);
  }
};

const create = async () => {
  if (name.value && !loading.value) {
    if (schools.value.filter(school => school.type == 'owner' ).length) {
      data.value = {
        new: true,
        name: name.value,
        license: { date_now: Date.now() }
      };
      dialog.open();
    } else {
      try {
        loading.value = true;
        const result = await api.post("/v1/schools/create", { name: name.value });
        store.commit("set", { key: "school", value: { code: result.data.school_code } });
        router.push(`/school/${result.data.school_code}/dashboard`);
      } catch (error) {
        console.log(error);
      }
    }
  }
};

const createPayment = async school => {
  try {
    creating.value = true;
    const result = await api.post("/v1/subscriptions/create", { school, name: name.value, subscription: subscription.value });
    const popup = window.open(result.data.checkout_url, 'popup', 'width=400,height=600');
    if (!popup) {
      window.location.href = result.data.checkout_url;
    } else {
      const checkPopupClosed = setInterval(async () => {
      if (popup.closed) {
        clearInterval(checkPopupClosed);
        creating.value = false;
        if (result.data.id) {
          const response = await api.get("/v1/subscriptions/check/" + result.data.id);
          console.log(school, response);
          if (!school) school = response.data.create.school;
          if(response.data.data.status == 'paid') {
            store.commit("set", { key: "school", value: { code: school } });
            router.push(`/school/${school}?refresh=true`)
          };
        }
      }
    }, 500);
    }
  } catch (error) {
    console.log(error);
    creating.value = false;
  }
};

const link = async () => {
  if (code.value && !loading.value) {
    try {
      loading.value = true;
      const { data } = await api.post("/v1/link/new", { user: user.value.code, school: code.value });

      if (data.status == "inactive") {
        const result = await api.get("/v1/schools/user");
        store.commit("set", { key: "schools", value: result.data });
        schools.value = result.data;
        loading.value = false;
      } else if (data.status == "active") {
        router.push(`/school/${data.school_code}/dashboard`);
      }
    } catch (error) {
      console.log(error);
    }
  }
};

const deleteLink = async (school) => {
  if (!loading.value && school && window.confirm(t("confirmeUninkSChool", { schoolname: school.name }))) {
    try {
      loading.value = school.code;
      const result = await api.delete(`/v1/link/${user.value.code}/${school.code}`);

      if (result.data) {
        schools.value = schools.value.filter(i => i.code != school.code);
        store.commit("set", { key: "schools", value: schools.value });
      }
      loading.value = false;
    } catch (error) {
      console.log(error);
    }
  }
};

const logout = async () => {
  if (window.confirm(t("by clicking 'OK' you will be logged out from your account"))) {
    await api.get("/v1/users/logout");
    store.commit("resetApp");
    router.push('/login');
  }
};
</script>