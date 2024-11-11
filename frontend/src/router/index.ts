import { createRouter, createWebHistory } from 'vue-router';
import Prompt from '../views/Prompt.vue';
import NotFound from '../views/NotFound.vue';
import Connexion from '../views/Connexion.vue';
import SignupPage from '../views/SignUp.vue';

const routes = [
  {
    path: '/',
    name: 'Connexion',
    component: Connexion,
  },
  {
    path: '/sign-up',
    name: 'SignupPage',
    component: SignupPage,
  },
  {
    path: '/prompt',
    name: 'Prompt',
    component: Prompt,
  },
  // Catch-all route for 404 - should be last
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
