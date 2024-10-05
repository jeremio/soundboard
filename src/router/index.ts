import { createRouter, createWebHistory } from 'vue-router'

import BoardPage from '~/pages/BoardPage.vue'
import PomodoroPage from '~/pages/PomodoroPage.vue'

const routes = [
  {
    path: '/',
    name: 'index',
    component: BoardPage,
  },
  {
    path: '/pomodoro',
    name: 'pomodoro',
    component: PomodoroPage,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
