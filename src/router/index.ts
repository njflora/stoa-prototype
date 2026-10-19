import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PlaceholderView from '../views/PlaceholderView.vue'

// Tells TypeScript which extra fields a route's meta can hold.
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    note?: string
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/live',
      name: 'live',
      component: PlaceholderView,
      meta: { title: 'Live', note: 'The live page is the next section to build.' },
    },
    {
      path: '/shows',
      name: 'shows',
      component: PlaceholderView,
      meta: { title: 'Shows', note: 'Show pages and series views come in a later step.' },
    },
    {
      path: '/watch/:id',
      name: 'watch',
      component: PlaceholderView,
      meta: { title: 'Episode', note: 'The episode page and player come in a later step.' },
    },
    {
      path: '/join',
      name: 'join',
      component: PlaceholderView,
      meta: {
        title: 'Membership',
        note: "The members' preview comes in a later step. This prototype never takes payment.",
      },
    },
    {
      path: '/articles',
      name: 'articles',
      component: PlaceholderView,
      meta: { title: 'Articles' },
    },
    {
      path: '/courses',
      name: 'courses',
      component: PlaceholderView,
      meta: { title: 'Courses' },
    },
    {
      path: '/search',
      name: 'search',
      component: PlaceholderView,
      meta: { title: 'Search', note: 'Instant search comes in a later step.' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: PlaceholderView,
      meta: { title: 'Page not found', note: 'That page does not exist.' },
    },
  ],
  scrollBehavior: (_to, _from, saved) => saved ?? { top: 0 },
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · Stoa` : 'Stoa'
})

export default router
