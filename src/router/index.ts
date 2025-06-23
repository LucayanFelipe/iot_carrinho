import { createRouter, createWebHistory } from 'vue-router'
import TelaInicio from '@/views/TelaInicio.vue'
import Carrinho from '@/views/Carrinho.vue'
import Pagamento from '@/views/Pagamento.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'TelaInicial',
      component: TelaInicio,
    },
    {
      path: '/carrinho',
      name: 'Carrinho',
      component: Carrinho
    },
    {
      path: '/carrinho/pagamento',
      name: 'Pagamento',
      component: Pagamento
    }
  ],
})

export default router
