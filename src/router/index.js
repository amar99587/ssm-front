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
        path: "courses/:course",
        name: "course",
        meta: { rule: "courses:information:access" },
        component: () => import("../components/school/courses/course.vue")
      },
      {
        path: "teachers",
        name: "teachers",
        meta: { rule: "teachers:access" },
        component: () => import("../components/school/teachers.vue")
      },
      {
        path: "timetable",
        name: "timetable",
        meta: { rule: "timetable:access" },
        component: () => import("../components/school/timetable.vue")
      },
      {
        path: "finance",
        name: "finance",
        meta: { rule: "finance:access" },
        component: () => import("../components/school/finance.vue")
      },
      {
        path: "statistics",
        name: "statistics",
        meta: { rule: "statistics:access" },
        component: () => import("../components/school/statistics.vue")
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
      const result = await api.get("/v1/users/enter");
      store.commit("set", { key: "user", value: result.data });
      user = result.data;
    } catch (error) {
      console.log(error);
    }
  }

  if (to.meta.auth == "required") {
    if (user && to.path.startsWith('/school')) {
      var school = store.state.school;
      const routeRule = to.matched[1]?.meta?.rule;
      // console.log(to.query.refresh != 'true');
      if ((to.params.school == school?.code) && school?.link && to.query.refresh != 'true') {
        const allowed =  school.link.type != "owner" && routeRule ? school.link.rules[routeRule] : true;
        if(school.license.end_left <= 0) {
          next(`/account?subscription=${school.code}`);
        } else if (!allowed) {
          next("/404?access=rejected");
        } else {
          next();
        }
      } else {
        try {
          const result = await api.get("/v1/schools/get/" + (window.location.pathname.split('/')[2] || school.code));
          if (result.data.haveAccess) {
            school = result.data.school;
            // console.log('school from server : ', school);
            store.commit("set", { key: "school", value: school });
            const allowed =  school.link.type != "owner" && routeRule ? school.link.rules[routeRule] : true;
            if (allowed) {
              school.license.end_left > 0 ? next() : next('/account?subscription=' + school.code);
            } else {
              next({ path: "/404", query: { access: "rejected" } });
            }
          } else {
            next({ path: "/404", query: { access: "rejected" } });
          }
        } catch (error) {
          console.log(error);
        }
      }
    } else {
      user ? next() : next({ path: "/login" });
    }
  } else if (to.meta.auth == "hide") {
    user ? next({ path: "/account" }) : next();
  } else {
    next();
  }
});

export default router;