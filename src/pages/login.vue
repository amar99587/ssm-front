<template>
  <div v-bind="$attrs" class="hidden" />
  <div class="w-full h-full bg-White rounded-v flex flex-col sm:flex-row gap-4">
    <div class="w-full min-h-[232px] grid place-content-center mt-12 sm:mt-0">
      <div class="w-full flex flex-col gap-4">
        <div class="text-center sm:text-start grid gap-1">
          <h1>Join Us.</h1>
          <h4>access to your account</h4>
        </div>
        <div class="grid gap-4 mt-8">
          <btn-app text="Login with Google" @click="login('google')" icon="flat-color-icons:google" :loading="loading" class="min-w-fit mx-auto sm:mx-0"/>
        </div>
        <h6 class="w-8/12 sm:w-full mt-1 mb-4 mini-text text-center sm:text-start mx-auto sm:mx-0">click on 'Google' to sign up or login to your account</h6>
      </div>
    </div>
    <div class="w-full h-full roundedv sm:h-auto bg-center bg-cover bg-img-vertical-login sm:bg-img-horizontal-login"/>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '@/plugins/axios.js';
import store from '@/store';
import router from '@/router';
import { googleTokenLogin } from "vue3-google-login"

const loading = ref(false);

const login = async (provider) => {
  let user;
  loading.value = true;
  try {
    switch (provider) {
      case "google":
        const response = await googleTokenLogin(); 
        user = await api.get("/api/users/login/google/"+ response.access_token);
        break;
    }
    console.log(user.data);
    store.commit("set", {key: "user", value: user.data});
    router.push('/account');
  } catch (error) {
    loading.value = false;
    console.log(error.name, error.message);
  }
}
</script>