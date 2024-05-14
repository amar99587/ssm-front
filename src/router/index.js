import { createRouter, createWebHistory } from 'vue-router';
import store from "../store/index";
import api from '@/plugins/axios.js';

const routes = [
  {
    path: '/login',
    name: 'login',
    meta: { auth: "hide" },
    component: () => import('../pages/login.vue')
  },
  {
    path: '/',
    alias: '/account',
    name: 'account',
    meta: { auth: "required" },
    component: () => import('../pages/account.vue')
  },
  {
    path: '/school/:school',
    name: 'school',
    meta: { auth: "required" },
    component: () => import('../pages/school.vue'),
    children: [
      {
        alias: "",
        path: "dashboard",
        name: "dashboard",
        component: () => import("../components/school/dashboard.vue")
      },
      {
        path: "students",
        name: "students",
        meta: { rule: "students:access" },
        component: () => import("../components/school/students/list.vue")
      },
      {
        path: "students/new",
        name: "new student",
        meta: { rule: "students:create" },
        component: () => import("../components/school/students/student/main.vue")
      },
      {
        path: "students/:student",
        name: "student",
        meta: { rule: "students:information:access" },
        component: () => import("../components/school/students/student/main.vue")
      },
      {
        path: "courses",
        name: "courses",
        meta: { rule: "courses:access" },
        component: () => import("../components/school/courses/list.vue")
      },
      {
        path: "courses/new",
        name: "new course",
        meta: { rule: "courses:create" },
        component: () => import("../components/school/courses/course.vue")
      },
      {
        path: "courses/:course",
        name: "course",
        meta: { rule: "courses:information:access" },
        component: () => import("../components/school/courses/course.vue")
      },
      {
        path: "timetable",
        name: "timetable",
        meta: { rule: "timetable:access" },
        component: () => import("../components/school/timetable/list.vue")
      },
      {
        path: "timetable/new",
        name: "new timetable",
        meta: { rule: "timetable:create" },
        component: () => import("../components/school/timetable/new.vue")
      },
      {
        path: "finance",
        name: "finance",
        meta: { rule: "finance:access" },
        component: () => import("../components/school/finance.vue")
      },
      {
        path: "settings",
        name: "settings",
        meta: { rule: "settings:access" },
        component: () => import("../components/school/settings/list.vue")
      },
      {
        path: "settings/users",
        name: "users",
        meta: { rule: "settings:users:access" },
        component: () => import("../components/school/settings/users/list.vue")
      },
      {
        path: "settings/users/new",
        name: "new user",
        meta: { rule: "settings:users:link" },
        component: () => import("../components/school/settings/users/new.vue")
      },
      {
        path: "settings/users/:user",
        name: "user",
        meta: { rule: "settings:users:rules:access" },
        component: () => import("../components/school/settings/users/user.vue")
      },
      {
        path: "settings/information",
        name: "infomation",
        component: () => import("../components/school/settings/information.vue")
      },
      {
        path: ":pathMatch(.*)*",
        name: "404",
        component: () => import("../pages/404.vue")
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "404",
    component: () => import("../pages/404.vue")
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior() {
    return new Promise(resolve => {
      resolve({ left: 0, top: 0 })
    })
  }
});

router.beforeEach(async (to, from, next) => {

  var user = store.state.user;

  if (user == null) {
    try {
      const result = await api.get("/api/users/enter");
      store.commit("set", {key: "user", value: result.data});
      user = result.data;
    } catch (error) {
      console.log(error);
    }
  }
  
  if (to.meta.auth == "required") {
    const school_code = to.params.school;
    const routeRule = to.matched[1]?.meta?.rule;
    const allowed = await store.state.school?.link?.rules[routeRule];
    !user ? next({ path: "/login" }) : (
      routeRule ? 
        (
          allowed ? 
            next() 
            : next(
              allowed == false ? 
                { path: "/404", query: { access: "rejected" } } 
                : { path: `/school/${school_code}/dashboard` }
            )
        ) 
        : next()
    );
  } else if (to.meta.auth == "hide") {
    user ? next({ path: "/account" }) : next();
  } else {
    next();
  }
});


export default router;