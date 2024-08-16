import { createRouter, createWebHistory } from 'vue-router'

import Board from '~/pages/Board.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Board,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
