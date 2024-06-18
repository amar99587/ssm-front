import { createStore } from 'vuex'

const school = {
  student: null,
  courses: [],
  students: [],
  payments: [],
  lessons: [],
  presence: [],
  timetables: [],
  users: []
};

const defaultValue = {
  user: null,
  schools: [],
  school: {},
  ...school
};

export default createStore({
  state: defaultValue,
  getters: {
    permission: (state) => (rule) => {
      return state.school?.link?.rules[rule];
    }
  },
  mutations: {
    set: (state, payload) => {
      if (payload.key == "school" && sessionStorage.school != payload.value.code) {
        sessionStorage.school = payload.value.code;
        for (const key in school) {
          state[key] = school[key];
        }
      }
      state[payload.key] = payload.value;
    },
    add: (state, payload) => {
      const id = payload.id || Object.entries(payload.value)[0][0];
      const value = state[payload.key];
      const index = value.findIndex((obj) => obj[id] == payload.value[id]);
      index == -1 ? value.push(payload.value) : value[index] = payload.value;
      state[payload.key] = value.filter(item => item.created_at).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    // ... other mutations
    resetApp: (state) => {
      state.user = null;
      state.school = {};
      state.schools = [];
      sessionStorage.clear();
      for (const key in school) {
        state[key] = school[key];
      }
    },
    resetSchool: (state) => {
      state.school = {};
      for (const key in school) {
        state[key] = school[key]; // Or simple copy if not needed
      }
    }
  },
  actions: {
  },
  modules: {
  }
});