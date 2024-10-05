import { createRouter, createWebHistory } from 'vue-router'

import BoardPage from '~/pages/BoardPage.vue'

const routes = [
  {
    path: '/',
    name: 'index',
    component: BoardPage,
  },
  {
    path: '/pomodoro',
    name: 'pomodoro',
    component: () => import ('~/pages/PomodoroPage.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
