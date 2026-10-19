// Latin character set only, to keep the download small.
import '@fontsource/poppins/latin-400.css'
import '@fontsource/poppins/latin-500.css'
import '@fontsource/poppins/latin-600.css'
import '@fontsource/poppins/latin-700.css'
import '@fontsource/pt-serif/latin-700.css'
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { loadReference } from './api/catalogue'
import router from './router'

// Load the small reference data (shows, hosts, series, the live event)
// before mounting, so every page can read it instantly. Top-level await:
// the rest of this file waits for it.
try {
  await loadReference()
  createApp(App).use(router).mount('#app')
} catch (error) {
  console.error(error)
  document.getElementById('app')!.innerHTML =
    '<p style="padding:2rem;font-family:sans-serif">Stoa could not load. Check your connection and refresh the page.</p>'
}
