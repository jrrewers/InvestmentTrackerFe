import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard
    },
    {
      path: '/position/:symbol',
      name: 'position-detail',
      component: Dashboard,
      props: true
    },
    {
      path: '/risk-analysis',
      name: 'risk-analysis',
      component: () => import('../views/RiskAnalysis.vue')
    }
  ]
})

export default router