<template>
  <div style="height: fit-content !important;" class="bg-white w-full sm:w-6/12 md:w-6/12 lg:w-4/12 flex flex-col items-center text-center gap-4 p-4 rounded-v m-auto mt-0">
    <h3>Let's get Started</h3>
    <h5>create your account using</h5>
    <!-- <div class="w-10/12 flex-between m-auto">
      <btn-app text="goolge" icon="logos:google-icon" class="w-5/12" />
      <btn-app text="microsoft" icon="logos:microsoft-icon" class="w-5/12" />
    </div>
    <div class="w-full flex-between">
      <div class="w-full border-[1px]"></div>
      <div class="w-6/12">Or</div>
      <div class="w-full border-[1px] rounded-v"></div>
    </div> -->
    <form @submit.prevent="submitForm" class="w-full grid gap-4 text-left">
      <input-app :value="user.email" @update="user.email = $event" label="email" :subText="!avalide.email && '(enter a valid email)'" :invalid="!avalide.email && !regex.email" type="email" icon="fluent:person-mail-24-filled"  placeholder="user@email.com" :readonly="loading" />
      <input-app :value="user.password" @update="user.password = $event" label="password" :subText="!avalide.password && '(at least 8 characters)'" :invalid="!avalide.password && !regex.password" :type="type" icon="fluent:shield-person-20-filled" placeholder="password123" @btn="show(type)" :btnIcon="`fluent:eye${type == 'text' ? '-off' : ''}-16-filled`" :readonly="loading" />
      <btn-app text="create" @click="signup" icon="fluent:person-24-filled" :loading="loading" dark class="min-w-fit mt-4 mx-auto"/>
    </form>
    <h5 class="my-4 text-gray-600">already have an account ? <router-link to="/login" class="font-semibold link">Login</router-link></h5>
    <h6 class="w-10/12 font-normal text-gray-500">by Creating an Account You are Agreeing to <a class="link">Terms</a>, <a class="link">Conditions</a> and, <a class="link">Policies</a> of this Platform</h6>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { api } from '@/plugins/axios.js';
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore();
const router = useRouter();

const type = ref('password');
const loading = ref(false);

const user = ref({
  email: null,
  password: null,
});

const regex = ref({
  email: computed(() => (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/).test(user.value.email)),
  password: computed(() => (/^.{8,100}$/).test(user.value.password)),
});

const avalide = ref({
  email: true,
  password: true
});

const show = (v) => type.value = v == 'text' ? 'password' : 'text';

const signup = async () => {

  avalide.value = regex.value;
  
  try {
    if (avalide.value.email && avalide.value.password) {
      loading.value = true;
      await api.post("/api/OTP/send", user.value);
      store.commit("OTP", {email: user.value.email});
      router.push('/verify?OTP=signup');
    }
  } catch (error) {
    loading.value = false;
    console.log(error);
  }
}
</script>
