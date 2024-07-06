<template>
    <div dir="auto" class="bg-White rounded-v flex-1 flex flex-col gap-4 p-4">
        <div @click="compressed = !compressed" class="min-h-[24px] flex-between">
            <h4 class="font-bold">{{ !compressed && student?.name ? student.name : "informations" }}<a v-if="getting && student.uid" class="animate-pulse">...</a></h4>
            <icon-app
                :icon="compressed ? 'fluent:caret-up-16-filled' : 'fluent:caret-down-16-filled'"
                class="block sm:hidden cursor-pointer" />
            <icon-app @click="emits('zoom')" :icon="!data.zoom ? 'ic:round-zoom-out-map' : 'ic:round-zoom-in-map'"
                class="hidden sm:block cursor-pointer" />
        </div>
        <h6 v-if="getting && !student.uid" class="h-full flex-center pb-2">{{ $t('loading...') }}</h6>
        <div v-else class="sm:block h-full overflow-y-auto smooth" :class="{ 'opacity-60': getting && student.uid, 'hidden': !compressed, 'block': compressed }">
            <form @submit.prevent="submitForm" class="flex flex-col sm:grid sm:grid-cols-2 gap-4">
                <div class="space-y-2">
                    <input-app :readonly="!edit" required autocomplete="no" :value="student.name"
                        @update="student.name = $event" label="nom et prénom" icon="fluent:person-24-filled"
                        placeholder="le nom complet de l'étudiant" />
                </div>
                <div class="space-y-2">
                    <input-app :readonly="!edit" required autocomplete="no" :value="$toDate(student.birthday)"
                        @update="student.birthday = $event" label="date de naissance" icon="fluent:calendar-24-filled"
                        type="date" />
                </div>
                <div class="space-y-2">
                    <input-app :readonly="!edit" autocomplete="no" :value="student.email"
                        @update="student.email = $event" label="email" icon="fluent:mail-24-filled" type="email"
                        placeholder="email de l'étudiant" />
                </div>
                <div class="space-y-2">
                    <input-app :readonly="!edit" autocomplete="no" :value="student.phone"
                        @update="student.phone = $event" label="téléphone" icon="fluent:call-24-filled" type="tel"
                        placeholder="téléphone de l'étudiant" />
                </div>
                <h6 v-if="student.created_at" class="col-span-2 text-center mt-2 first-letter:lowercase">{{ $t('created at') +' '+$toDate(student.created_at, 'timestamp') }}</h6>
                <button @click="!edit && update(student)" class="hidden" />
            </form>
        </div>
        <div v-if="$store.getters.permission('students:information:edit') && edit"
            class="gap-4 min-h-[36px] justify-between items-end" :class="{ 'hidden': !compressed, 'flex': compressed }">
            <h6 @click="edit = false" class="cursor-pointer">cancel edit</h6>
            <btn-app @click="update(student)" text="enregistrer" dark :loading="loading" icon="fluent:add-12-filled" />
        </div>
        <h6 v-if="$store.getters.permission('students:information:edit') && compressed && !getting && !edit"
            @click="edit = true" class="w-full min-h-[16px] text-center cursor-pointer">modifier</h6>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from '@/plugins/axios.js';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

const route = useRoute();
const store = useStore();

const { data } = defineProps(["data"]);
const emits = defineEmits(["zoom"]);

const edit = ref(false);
const compressed = ref(true);
const getting = ref(false);
const loading = ref(false);

const student = ref({});

const getStudent = async () => {
    try {
        getting.value = true;
        console.log('local student', student.value);
        const result = await api.get("/v1/students/get/" + data.student.uid);
        student.value = result.data;
        console.log('Server Student : ', student.value.uid);
        store.commit("add", { key: "students", value: result.data });
        getting.value = false;
    } catch (error) {
        console.log(error);
    }
}

onMounted(async () => {
  const { students } = store.state;
  const storedStudent = students.find(i => i.uid === data.student.uid);

  if (storedStudent) {
    student.value = storedStudent;
    if (data.student.isNew) return;
  }

  await getStudent();
});

const update = async e => {
    if (e.school && e.name && e.birthday && window.confirm("Voulez-vous mettre à jour les informations sur les étudiants")) {
        try {
            loading.value = true;
            const result = await api.post("/v1/students/update", e);
            // result.data.birthday = toDate(result.data.birthday);
            student.value = result.data;
            store.commit("add", { key: "students", value: result.data });
            loading.value = false;
            edit.value = false;
        } catch (error) {
            console.log(error);
        }
    };
};
</script>