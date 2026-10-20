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
      component: () => import('../views/LiveView.vue'),
      meta: { title: 'Live' },
    },
    {
      path: '/sign-in',
      name: 'sign-in',
      component: PlaceholderView,
      meta: {
        title: 'Sign in or sign up',
        note: 'This prototype has no accounts. Use the demo panel to switch views.',
      },
    },
    {
      path: '/account',
      name: 'account',
      component: () => import('../views/AccountView.vue'),
      meta: { title: 'Your account' },
    },
    {
      path: '/shop',
      name: 'shop',
      component: () => import('../views/ShopView.vue'),
      meta: { title: 'Shop' },
    },
    {
      path: '/shows',
      name: 'shows',
      component: () => import('../views/ShowsView.vue'),
      meta: { title: 'Shows' },
    },
    {
      // The page names the tab itself, after the show.
      path: '/shows/:id',
      name: 'show',
      component: () => import('../views/ShowView.vue'),
    },
    {
      path: '/series/:slug',
      name: 'series',
      component: () => import('../views/SeriesView.vue'),
      meta: { title: 'Series' },
    },
    {
      path: '/watch/:id',
      name: 'watch',
      component: () => import('../views/WatchView.vue'),
      meta: { title: 'Episode' },
    },
    {
      path: '/join',
      name: 'join',
      component: () => import('../views/JoinView.vue'),
      meta: { title: 'Membership' },
    },
    {
      path: '/articles',
      name: 'articles',
      component: () => import('../views/ArticlesView.vue'),
      meta: { title: 'Articles' },
    },
    {
      // The page names the tab itself, after the article.
      path: '/articles/:id',
      name: 'article',
      component: () => import('../views/ArticleView.vue'),
    },
    {
      path: '/courses',
      name: 'courses',
      component: () => import('../views/CoursesView.vue'),
      meta: { title: 'Courses' },
    },
    {
      // The page names the tab itself, after the course.
      path: '/courses/:id',
      name: 'course',
      component: () => import('../views/CourseView.vue'),
    },
    {
      path: '/contributors',
      name: 'contributors',
      component: () => import('../views/ContributorsView.vue'),
      meta: { title: 'Contributors' },
    },
    {
      // The page names the tab itself, after the person.
      path: '/contributors/:id',
      name: 'contributor',
      component: () => import('../views/ContributorView.vue'),
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactView.vue'),
      meta: { title: 'Contact' },
    },
    {
      // Search is an overlay now (?search=). Old /search?q= links open it over the homepage.
      path: '/search',
      name: 'search',
      redirect: (to) => ({ path: '/', query: { search: typeof to.query.q === 'string' ? to.query.q : '' } }),
    },
    {
      path: '/pitch',
      name: 'pitch',
      component: () => import('../views/PitchView.vue'),
      meta: { title: 'Pitch notes' },
    },
    {
      path: '/credits',
      name: 'credits',
      component: () => import('../views/CreditsView.vue'),
      meta: { title: 'Credits' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: PlaceholderView,
      meta: { title: 'Page not found', note: 'That page does not exist.' },
    },
  ],
  // Back and Forward return to where you were. A new page starts at the top,
  // but a change on the same page (a filter, a page of results, opening
  // search) keeps your place; the page scrolls itself if it needs to.
  // A link to a #section scrolls it into view below the sticky header.
  scrollBehavior: (to, from, saved) => {
    if (saved) return saved
    if (to.hash) {
      const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64
      return { el: to.hash, top: header + 16 }
    }
    return to.path === from.path ? false : { top: 0 }
  },
})

router.afterEach((to, from) => {
  // Only on a new page, so titles a page sets itself (such as a show's name) stay.
  if (to.path === from.path) return
  document.title = to.meta.title ? `${to.meta.title} · Stoa` : 'Stoa'
})

export default router
