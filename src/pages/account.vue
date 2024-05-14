<template>
  <div v-bind="$attrs">
    <div class="grid gap-4">
      <!-- <div class="h-20 sm:h-32 bg-[url(https://bit.ly/3tOsUuK)] bg-cover bg-center rounded-v bg-v"></div> -->
      <div class="flex-between">
        <h2 class="text-pro">account</h2>
        <h6 @click="logout" title="click here to logout from your account" class="font-medium link">logout</h6>
      </div>
      <div @click="copy(user.code.toUpperCase())" class="grid gap-2 text-center mx-auto my-4 cursor-pointer">
        <h2 class="tracking-[.25rem] ml-[.25rem] uppercase">{{ user.code }}</h2>
        <h6 class="mini-text">tap here to copy your code</h6>
      </div>
      <h6 class="mx-auto mini-text">{{ user.email }}</h6>
      <h6 v-if="!schools && getting" class="text-center animate-pulse pt-8">Loading...</h6>
      <div v-if="schools?.length" class="grid gap-4">
        <hr>
        <h2>school's <a v-if="getting" class="animate-pulse">...</a></h2>
        <div class="grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <router-link 
            v-for="(school, index) in schools" :key="index" :to="school.status == 'inactive' ? '' : `/school/${school.code}/dashboard`" 
            class="h-240 grid gap-4 border-v rounded-v p-4 hover:bg-v smooth cursor-pointer"            
          >
            <div class="flex-between">
              <h6 class="mini-text micro-text truncate min-h-[16px]">{{ school.status == "inactive" ? "watting for School" : (school.type == "owner" ? "Owner" : "") }}</h6>
              <icon-app v-if="school.status == 'inactive'" @click="deleteLink(school)" :icon="loading == school.code ? 'svg-spinners:ring-resize' : 'fluent:delete-24-filled'" class="hover:text-red-500 smooth" size="16" />
            </div>
            <h2 class="w-full text-center my-2 truncate" :class="{ 'opacity-50': school.status == 'inactive' }">{{ school.name }}</h2>
            <h6 class="mx-auto mini-text uppercase">{{ school.code }}</h6>
          </router-link>
        </div>
        <hr>
      </div>
      <div  v-if="schools?.length && !more">
        <h6 class="text-center">need more schools ? <br> click <a @click="more = true" class="link">here</a>.</h6>
      </div>
      <h2 v-if="schools.length && more">more school's</h2>
      <div v-if="schools && (more || !schools.length)" class="grid sm:block gap-8">
        <div class="grid sm:grid-cols-11 gap-4 mx-auto sm:my-10">
          <div class="sm:w-10/12 mx-auto col-span-5 p-4 border-v rounded-v grid gap-6">
            <h3>create school</h3>
            <form @submit.prevent="submitForm" class="grid gap-4">
              <div class="sm:w-10/12 mx-auto">
                <input-app :value="name" @update="name = $event" center icon="ion:school" placeholder="enter here your school name" class="mx-auto" :readonly="(name.length && loading) || false" />
              </div>
              <btn-app @click="create" text="create" icon="fluent:add-12-filled" dark class="mx-auto" :loading="(name.length && loading) || false" />
            </form>
            <!-- <h6 class="w-10/12 text-center mx-auto mini-text">
              Join Us Today! let us take care of your school management, so you can enjoy peace of mind, For only <a class="font-bold">4000 DZD/month</a>.
              need help? click <router-link to="/help?create-school" class="link">here.</router-link>
            </h6> -->
          </div>
          <h5 class="hidden sm:block m-auto">Or</h5>
          <div class="sm:w-10/12 mx-auto col-span-5 p-4 border-v rounded-v grid gap-6">
            <h3>Link to school</h3>
            <form @submit.prevent="submitForm" class="grid gap-4">
              <div class="sm:w-10/12 mx-auto">
                <input-app :value="code" @update="code = $event.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase()" icon="fluent:link-16-filled" placeholder="enter here the school code" class="mx-auto" :readonly="(code.length && loading) || false" center maxlength="11" />
              </div>
              <btn-app @click="link" text="link" icon="fluent:add-12-filled" dark class="mx-auto" :loading="(code.length && loading) || false" />
            </form>
            <!-- <h6 class="w-10/12 text-center mx-auto mini-text">
              Become a part of the educational journey with us. Enjoy the benefits of linking to any school for <a class="font-bold">FREE</a>.
              need help? click <router-link to="/help?link-to-school" class="link">here.</router-link>
            </h6> -->
          </div>
        </div>
        <h6 class="text-center mx-auto mini-text">
          For any questions or more informations, don't hesitate to 
          <a href="https://proecole.com/fr/index.html" target="_blank" class="link">reach out to us</a>. 
          <br class="hidden sm:block"> Your satisfaction is our priority!
        </h6>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import store from '@/store';
import router from '@/router';
import api from '@/plugins/axios.js';

const loading = ref(false);
const getting = ref(false);

const user = ref(store.state.user);
const schools = ref(store.state.schools.length ? store.state.schools : false);
const name = ref("");
const code = ref("");
const more = ref(false);

onMounted(async () => {
  try {
    getting.value = true;
    const result = await api.get("/api/schools/user");
    store.commit("set", {key: "schools", value: result.data});
    schools.value = result.data;
    getting.value = false;
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

const link = async () => {
  if (code.value && !loading.value) {
    try {
      loading.value = true;
      const { data } = await api.post("/api/link/new", { user: user.value.code, school: code.value });
      console.log(data);
      if (data.status == "inactive") { 
        const result = await api.get("/api/schools/user");
        store.commit("set", {key: "schools", value: result.data});
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

const create = async () => {
  if (name.value && !loading.value) {
    try {
      loading.value = true;
      const result = await api.post("/api/schools/create", { name: name.value, email: user.value.email });
      router.push(`/school/${result.data.school_code}/dashboard`);
    } catch (error) {
      console.log(error);
    }
  }
};

const deleteLink = async (school) => {
  if (!loading.value && school && window.confirm(`Are you sure you want to unlink "${school.name}" school?`)) {
    try {
      loading.value = school.code;
      const result = await api.post("/api/link/delete", { user: user.value.code, school: school.code });
      if (result.data) {
        schools.value = schools.value.filter(i => i.code != school.code);
        store.commit("set", {key: "schools", value: schools.value});
      }
      loading.value = false;
    } catch (error) {
      console.log(error);
    }
  }
};

const logout = async () => {
  if (window.confirm(`By clicking "OK" you will be logged out from your account`)) {
    await api.get("/api/users/logout");
    store.commit("resetApp");
    router.push('/login');
  }
};
</script>