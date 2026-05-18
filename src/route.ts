import { createWebHashHistory, createRouter } from 'vue-router'

import user from './components/user.vue'
import registr from './components/registr.vue'
import login from './components/login.vue'
import profile from './components/profile.vue'
import korzine from './components/korzine.vue'
import card from './components/cardinfo/card.vue'
import chat from './components/chat/chat.vue'
import pytovar from './components/chat/chat.vue'

const routes = [
  { path: '/', component: login },
  { path: '/registr', component: registr },
  { path: '/user', component: user },
  { path: '/profile', component: profile },
  { path: '/korzine', component: korzine },
  { path: '/card:id', component: card },
  { path: '/chat', component: chat },
  { path: '/pytovar', component: pytovar },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router