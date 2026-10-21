// Latin character set only, to keep the download small.
import '@fontsource/poppins/latin-400.css'
import '@fontsource/poppins/latin-500.css'
import '@fontsource/poppins/latin-600.css'
import '@fontsource/poppins/latin-700.css'
import '@fontsource/pt-serif/latin-700.css'
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { loadAccount } from './api/account'
import { loadReference } from './api/catalogue'
import { API_MODE } from './api/client'
import { startReminders } from './composables/useReminders'
import router from './router'
import { brand } from './config/brand'

// Load the small reference data (shows, hosts, series, the live event)
// before mounting, so every page can read it instantly. In Laravel mode,
// also ask who is signed in. Top-level await: the rest of this file waits.
try {
  await Promise.all([loadReference(), API_MODE === 'laravel' ? loadAccount() : null])
  createApp(App).use(router).mount('#app')
  // The demo's "live now" notification, from any page.
  startReminders()
} catch (error) {
  console.error(error)
  document.getElementById('app')!.innerHTML =
    `<p style="padding:2rem;font-family:sans-serif">${brand.name} could not load. Check your connection and refresh the page.</p>`
}
