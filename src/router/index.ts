import { createRouter, createWebHistory } from 'vue-router'

import Board from '~/pages/Board.vue'
import Pomodoro from '~/pages/Pomodoro.vue'

const routes = [
  {
    path: '/',
    component: Board,
  },
  {
    path: '/pomodoro',
    component: Pomodoro,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
