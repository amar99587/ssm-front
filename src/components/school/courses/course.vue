<template>
    <div v-bind="$attrs" class="hidden" />
    <div class="w-full min-h-fit flex flex-col gap-4">
        <div :class="{ 'min-h-[212px]': !close }" class="bg-White grid gap-4 rounded-v p-4 w-full">
            <div @click="close = !close" class="min-h-[24px] flex-between">
                <h4 class="font-bold truncate">{{ close && course?.name ? course.name : "information" }}<a v-if="getting.course && course?.uid" class="animate-pulse">...</a></h4>
                <icon-app :icon="close ? 'fluent:caret-down-16-filled' : 'fluent:caret-up-16-filled'" class="min-w-fit cursor-pointer" />
            </div>
            <h6 v-if="getting.course && !course?.uid" class="text-center">{{ $t('loading...') }}</h6>
            <form v-else-if="!close" @submit.prevent="submitForm" class="w-full grid gap-4 smooth" :class="{ 'opacity-60': getting.course && course?.uid }">
                <div class="w-full grid grid-cols-2 gap-4">
                    <input-app :value="course.name" @update="course.name = $event" :readonly="!course.edit" icon="solar:document-bold" placeholder="nom complet du cours" class="col-span-2" />
                    <input-app :value="course.teacher" @update="course.teacher = $event" :readonly="!course.edit" :datalist="store.state.courses.map(({ teacher }) => teacher)" icon="fluent:person-24-filled" placeholder="nom du prof" />
                    <input-app :value="course?.price?.toString().replace(/\.00$/, '')" @update="course.price = $event" :readonly="!course.edit" icon="solar:tag-price-bold" type="number" center placeholder="prix de séance" />
                </div>
                <div class="flex-between text-center sm:text-left h-[36px]">
                    <h6 :class="{ 'hidden sm:block': course.edit }" class="first-letter:lowercase">{{ $t('created at') +' '+ $toDate(course?.created_at, 'timestamp') }}</h6>
                    <div v-if="can.edit.course && course.edit" class="w-fit flex-between gap-4 mx-auto sm:mx-0">
                        <btn-app @click="update.course(course)" :text="$t(course?.uid ? 'save' : 'create')" dark :loading="loading.course" icon="fluent:add-12-filled" />
                        <btn-app @click="course.edit = false" :text="$t('cancel')" icon="fa6-solid:xmark" />
                    </div>
                    <btn-app v-else-if="can.edit.course && !course.edit && !getting.course" @click="course.edit = true" :text="$t('edit')" icon="fluent:edit-12-filled" />
                </div>
            </form>
        </div>
        <div v-if="can.access.lessons" class="h-full flex flex-col gap-4 bg-White rounded-v p-4 w-full">
            <div class="grid gap-4" :class="{ 'min-h-[112px]': !lesson && lessons.length, 'min-h-[164px]': lesson, 'min-h-[76px]': !lessons.length}">
                <div class="flex-between">
                    <h4 class="font-bold">séances<a v-if="getting.lessons && lessons.length" class="animate-pulse">...</a></h4>
                    <icon-app v-if="lesson || loading.lessons" @click="lesson ? (() => { lesson = null; query.student = ''; query.color = '#212937'; students = []; })() : false" :icon="loading.lessons ? 'svg-spinners:ring-resize' : 'ion:chevron-back-outline'" class="cursor-pointer" />
                </div>
                <div v-if="!lesson" class="flex-between gap-4">
                    <div v-if="store.getters.permission('courses:lessons:create')" @click="create.lesson(course)" class="btn-mini">
                        <icon-app :icon="loading.lesson ? 'svg-spinners:ring-resize' : 'fluent:add-12-filled'" class="w-3" />
                    </div>
                    <form @submit.prevent="submitForm" class="w-full">
                        <input-app :value="query.date" @update="query.date = $event" @change="search.lessons" icon="fluent:calendar-24-filled" type="date" accessKey="c"/>
                        <button class="hidden"/>
                    </form>
                </div>
                <h5 v-if="lessons.length && (lesson ? can.access.presence : true)" class="flex-between text-center px-2">
                    <div class="w-full truncate">{{ $t('created at') }}</div>
                    <div class="w-full">présences</div>
                    <div class="w-full">absences</div>
                    <div class="w-full hidden sm:block">total</div>
                </h5>
                <h5 v-if="can.access.presence && lesson" class="bg-v rounded-v p-2 flex-between text-center">
                    <div class="w-full sm:hidden">{{ $toDate(lesson.created_at, "date") }}</div>
                    <div class="w-full hidden sm:block">{{ $toDate(lesson.created_at, "timestamp") }}</div>
                    <div class="w-full">{{ lesson?.presents.length }}</div>
                    <div class="w-full">{{ lesson?.absents.length }}</div>
                    <div class="w-full" :class="{ 'hidden sm:block': lesson }">{{ lesson?.presents.length + lesson?.absents.length }}</div>
                </h5>
                <form @submit.prevent="submitForm" v-if="can.access.presence && lesson" class="flex-between gap-2">
                    <input-app :value="query.student" @update="query.student = $event" icon="fluent:person-24-filled" type="search" placeholder="nom d'étudiant" accessKey="c" />
                    <div class="flex-center min-w-fit h-[36px] bg-v rounded-v p-2 cursor-pointer border-pro">
                        <div @click="query.color = changeColor(query.color)" class="min-w-[1rem] h-4 rounded-full smooth" :style="`background: ${query.color};`"></div>
                    </div>
                    <button class="hidden"/>
                </form>
            </div>
            <div v-if="can.access.lessons" @scroll="loadmore.lessons" class="h-full space-y-4 overflow-y-auto">
                <h6 v-if="(!lessons.length || (can.access.presence && lesson && !students.length)) && (getting.lessons || getting.students)" class="h-full flex-center pb-2">{{ $t('loading...') }}</h6>
                <h6 v-else-if="(!lessons.length || (can.access.presence && lesson && !searchStudent.length)) && !getting.lessons && !getting.students" class="h-full flex-center pb-2">{{ $t("no data to display") }}</h6>
                <h5 v-else-if="can.access.presence && lesson" v-for="(student, index) in searchStudent" :key="index" class="bg-v bg-v-hover rounded-v p-2 flex-between smooth">
                    <router-link :to="`/school/${school.code}/students/${student.uid}`" class="w-full text-center truncate hover:link">{{ student.name }}</router-link>
                    <div class="w-full text-center" :class="{ 'hidden sm:block': lesson }">{{ student.birthday }}</div>
                    <div class="w-full text-center" :class="{ 'text-red-500': student.rest == 0 }">rest : {{ student.rest }}</div>
                    <div class="w-full flex justify-end">
                        <div @click="can.edit.presence ? update.studentStatus(student) : ''" class="cursor-pointer">
                            <div class="w-4 h-4 rounded-full smooth" :style="`${(() => {
                                const isPresent = lesson.presents.includes(student.uid);
                                if (loading.student == student.uid) {
                                    return `color:${isPresent ? '#FA9F42' : '#0B6E4F'};`
                                } else {
                                    return `background:${isPresent ? '#0B6E4F' : '#FA9F42'};`
                                }
                            })()}`">
                                <icon-app v-if="loading.student == student.uid" icon="svg-spinners:ring-resize" class="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </h5>
                <h5 v-else-if="can.access.lessons && lessons.length" v-for="item in lessons.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))" @click="can.access.presence ? getStudents(item) : ''" class="bg-v bg-v-hover rounded-v p-2 cursor-pointer flex-between text-center smooth" :class="{ 'opacity-60': getting.lessons && lessons.length }">
                    <div class="w-full sm:hidden">{{ $toDate(item.created_at) }}</div>
                    <div class="w-full hidden sm:block">{{ $toDate(item.created_at, "timestamp") }}</div>
                    <div class="w-full">{{ item?.presents.length }}</div>
                    <div class="w-full">{{ item?.absents.length }}</div>
                    <div class="w-full hidden sm:block">{{ item?.presents.length + item?.absents.length }}</div>
                </h5>
                <h6 v-if="loadingMore.lessons && (typeof loadingMore.lessons != 'number')" class="text-center py-3">{{ $t('loading...') }}</h6>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { validated } from '@/utilities/validator';
import { removeDuplicatesUID } from "@/utilities/functions";
import api from '@/plugins/axios.js';
import { useRoute } from 'vue-router';
import router from '@/router';
import store from '@/store';

const route = useRoute();

const { school } = defineProps(["school"]);

const can = computed(() => {
    return {
        access : {
            lessons: store.getters.permission("courses:lessons:access"),
            presence: store.getters.permission("courses:presence:access")
        },
        edit : {
            course: store.getters.permission("courses:information:edit"),
            lessons: store.getters.permission("courses:lessons:edit"),
            presence: store.getters.permission("courses:presence:edit")
        }
    }
});

const close = ref(false);

const course = ref({
    school: school.code,
    name: null,
    teacher: null,
    price: null,
    edit: false,
});

const getting = ref({
    course: false,
    lessons: false,
    students: false
});
const loading = ref({
    course: false,
    lessons: false,
    lesson: false,
    student: false
});
const loadingMore = ref({
    lessons: false,
    students: false,
});

const students = ref([]);

const lesson = ref();

const query = ref({
    course: route.params.course,
    color: "#212937",
    date: null,
    student: "",
});

const lessons = ref(store.state.lessons.filter(lesson => lesson.course == query.value.course));

const getCourseData = async () => {
    try {
        course.value = store.state.courses.flat().find((e) => e.uid == route.params.course);
        getting.value.course = true;
        getting.value.lessons = true;
        const { data } = await api.get("/v1/courses/get/" + route.params.course);
        const result = await api.post("/v1/lessons/search", { course: query.value.course });
        course.value = data;
        lessons.value = result.data;
        // console.log(lessons.value);
        store.commit("add", {key: "courses", value: data});
        store.commit("set", {key: "lessons", value: removeDuplicatesUID([ ...result.data, ... store.state.lessons ])});
        loadingMore.value.lessons = data.length < 20 && result.data.length;
        if (route.query.lesson) {
            await getStudents(result.data.filter(lesson => lesson.uid == route.query.lesson)[0]);
        }
        getting.value.course = false;
        getting.value.lessons = false;
    } catch (error) {
        console.log(error);
    }
};

onMounted(async () => await getCourseData());

const getStudents = async (e) => {
    try {
        lesson.value = e;
        getting.value.students = true;
        query.value.date = null;
        router.push({ query: { lesson: e.uid } });
        const result = await api.post("/v1/lessons/get/students", { 
            lesson: e.uid, 
            course: e.course, 
            students: [ ...e.presents, ...e.absents ], 
            date: e.created_at, 
        });
        students.value = result.data;
        getting.value.students = false;
    } catch (error) {
        console.log(error);
    }
};

const changeColor = (color) => {
  switch (color) {
    case '#212937':
      return '#0B6E4F';
    case '#0B6E4F':
      return '#FA9F42';
    default:
      return '#212937';
  }
};

const create = {
    lesson: async (e) => {
        if (e.school && e.uid && window.confirm("Do you want to create a new session ?")) {
            try {
                loading.value.lesson = true;
                const { data } = await api.post("/v1/lessons/create", {school: e.school, course: e.uid});
                lesson.value = data;
                students.value = data.students || [];
                lessons.value = [ ...lessons.value, data ];
                console.log(lessons.value, data);
                store.commit("add", { key: "lessons", value: data });
                loading.value.lesson = false;
            } catch (error) {
                console.log(error);
            }
        }
    }
};

const update = {
    course: async (e) => {
        if (!Object.values(e).includes(null) && window.confirm("Voulez-vous mettre à jour les informations sur le cours ?")) {
            try {
                loading.value.course = true;
                const result = await api.post("/v1/courses/update", e);
                course.value = result.data;
                store.commit("add", {key: "courses", value: result.data});
                loading.value.course = false;
            } catch (error) {
                console.log(error);
            }
        };
    },
    studentStatus: async (student) => {
        const { uid, presents } = lesson.value;
        const present = presents.includes(student.uid);
        if (window.confirm(`Voulez-vous vraiment changer le statut de présence de "${student.name}" de ${present ? "présent" : "absent"} à ${present ? "absent" : "présent"} ?`)) {
            try {
                loading.value.student = student.uid;
                const { data } = await api.post("/v1/lessons/student/change/status", { lesson: uid, student: student.uid, present});
                lesson.value = data;
                
                const index = lessons.value.findIndex(i => i.uid == uid);
                if (index != -1) {
                    lessons.value[index] = data;
                    store.commit("set", {key: "lessons", value: lessons.value});
                }
    
                loading.value.student = false;
            } catch (error) {
                console.log(error);
            }
        };
    },
};

const searchStudent = computed(() => {
    const { presents, absents } = lesson.value;
    const { student, color } = query.value;

    const present = color == "#0B6E4F";
    const absent = color == "#FA9F42";

    const arr = (present ? presents : []).concat(absent ? absents : (present ? [] : [...presents, ...absents]));
    
    return students.value.filter(({name, uid}) => 
        name.toLowerCase().includes(student.toLowerCase()) && arr.includes(uid)
    );
});

const search = {
    lessons: async () => {
        console.log(query.value.date);
        if (query.value.date.length == 10 || !query.value.date.length) {
            try {
                loading.value.lessons = true;
                loadingMore.value.lessons = false;
                const { data } = await api.post("/v1/lessons/search", { course: query.value.course, created_at: query.value.date });
                lessons.value = data;
                loadingMore.value.lessons = data.length < 20 && data.length;
                loading.value.lessons = false;
            } catch (error) {
                console.log(error);
            }
        }
    }
}

const loadmore = {
    lessons: async (event) => {
        const scroll = event.target;
        if(!loadingMore.value.lessons && scroll.scrollHeight - scroll.clientHeight - 250 < Math.round(scroll.scrollTop)) {
            try {
                console.log("loadmore : lessons");
                loadingMore.value.lessons = true;
                const { data } = await api.post(`/v1/lessons/search?offset=${lessons.value.length}`, { course: query.value.course, created_at: query.value.date });
                lessons.value = [ ...lessons.value, ...data ];
                store.commit("set", {key: "lessons", value: lessons.value});
                loadingMore.value.lessons = data.length < 20 && lessons.value.length;
            } catch (error) {
                console.log(error);
            }
        };
    }
}
</script>