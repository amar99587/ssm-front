<template>
  <div v-bind="$attrs">
    <div class="grid gap-4">
      <!-- <div class="h-20 sm:h-32 bg-[url(https://bit.ly/3tOsUuK)] bg-cover bg-center rounded-v bg-v"></div> -->
      <div class="flex-between">
        <h2>account</h2>
        <h6 @click="logout" class="font-medium link">logout</h6>
      </div>
      <div @click="copy(user.code)" class="grid gap-2 text-center mx-auto my-4 cursor-pointer">
        <h2 class="tracking-[.25rem] ml-[.25rem] uppercase">{{ user.code }}</h2>
        <h6 class="text-gray-600">tap here to copy your code</h6>
      </div>
      <h6 class="mx-auto text-gray-600">{{ user.email }}</h6>
      <h6 v-if="!schools && getting" class="text-center animate-pulse pt-8">Loading...</h6>
      <div v-if="schools?.length" class="grid gap-4">
        <hr>
        <h2>school's <a v-if="getting" class="animate-pulse">...</a></h2>
        <div class="grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <router-link v-for="(school, index) in schools" :key="index" :to="`/school/${school.code}/dashboard`" class="h-240 grid gap-4 border-2 rounded-v p-4 hover:bg-v smooth cursor-pointer">
            <h2 class="w-full text-center my-4 truncate">{{ school.name }}</h2>
            <h6 class="mx-auto text-gray-600 uppercase">{{ school.code }}</h6>
          </router-link>
        </div>
        <hr>
      </div>
      <div  v-if="schools?.length && !more">
        <h6 class="text-center">need more schools ? <br> click <a @click="more = true" class="link">here</a>.</h6>
      </div>
      <div v-if="schools && (more || !schools.length)" class="grid sm:block gap-8">
        <div class="grid sm:grid-cols-11 gap-4 mx-auto sm:my-10">
          <div class="sm:w-10/12 mx-auto col-span-5 p-4 border-2 rounded-v grid gap-6">
            <h3>create school</h3>
            <form @submit.prevent="submitForm" class="grid gap-4">
              <div class="sm:w-10/12 mx-auto">
                <input-app :value="name" @update="name = $event" icon="ion:school" placeholder="enter here your school name" class="mx-auto" :readonly="loading" />
              </div>
              <btn-app @click="create" text="create" icon="fluent:add-12-filled" dark class="mx-auto" :loading="name && loading" />
            </form>
            <h6 class="w-10/12 text-center mx-auto text-gray-600">
              Join Us Today! let us take care of the school management, so you can enjoy peace of mind, For only <a class="font-bold">4000 DZD/month</a>.
              need help? click <router-link to="/help?create-school" class="link">here.</router-link>
            </h6>
          </div>
          <h5 class="hidden sm:block m-auto">Or</h5>
          <div class="sm:w-10/12 mx-auto col-span-5 p-4 border-2 rounded-v grid gap-6">
            <h3>Link to another school</h3>
            <form @submit.prevent="submitForm" class="grid gap-4">
              <div class="sm:w-10/12 mx-auto">
                <input-app :value="code" @update="code = $event.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase()" icon="fluent:link-16-filled" placeholder="enter here the school code" class="mx-auto" :readonly="loading" center maxlength="11" />
              </div>
              <btn-app @click="link" text="link" icon="fluent:add-12-filled" dark class="mx-auto" :loading="code && loading" />
            </form>
            <h6 class="w-10/12 text-center mx-auto text-gray-600">
              Become a part of the educational journey with us. Enjoy the benefits of linking to any school for <a class="font-bold">FREE</a>.
              need help? click <router-link to="/help?link-to-school" class="link">here.</router-link>
            </h6>
          </div>
        </div>
        <h6 class="text-center mx-auto text-gray-600">
          For any 
          <router-link to="/help" class="link">questions</router-link> or more
          <router-link to="/help" class="link">information</router-link> , don't hesitate to 
          <router-link to="/contactus" class="link">reach out to us</router-link>. 
          <br class="hidden sm:block"> Your satisfaction is our priority!
        </h6>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { api } from '@/plugins/axios.js';
import { useRouter } from 'vue-router'

const store = useStore();
const router = useRouter();
const loading = ref(false);
const getting = ref(false);

const user = ref(store.state.user);
const schools = ref(store.state.schools.length ? store.state.schools : false);
const name = ref();
const code = ref();
const more = ref(false);

onMounted(async () => {
  getting.value = true;
  const result = await api.get("/api/schools/user");
  store.commit("schools", result.data);
  schools.value = result.data;
  getting.value = false;
});

const copy = (text) => {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
};

const link = () => {
  code.value && (loading.value = true);
};

const create = async () => {
  if (name.value) {
    loading.value = true;
    const result = await api.post("/api/schools/create", { name: name.value });
    router.push(`/school/${result.data.school_code}/dashboard`);
  }
};

const logout = async () => {
  if (window.confirm(`By clicking "OK" you will be logged out from your account`)) {
    await api.get("/api/users/logout");
    store.commit("user", false);
    router.push('/login');
  }
};
</script>
