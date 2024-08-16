import { createRouter, createWebHistory } from 'vue-router'

import Board from '~/pages/Board.vue'

const routes = [
  {
    name: 'home',
    path: '/',
    component: Board,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
