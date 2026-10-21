import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { brand } from './src/config/brand'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // index.html's title and description come from the brand file.
    {
      name: 'brand-in-index-html',
      transformIndexHtml: (html) =>
        html.replaceAll('%BRAND_NAME%', brand.name).replaceAll('%BRAND_DESCRIPTION%', brand.description.replace(/^./, (c) => c.toLowerCase())),
    },
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  // With VITE_API_MODE=laravel, the site asks /api, and Vite passes it on to
  // the Laravel API in Docker (backend/compose.yaml). Same address for both,
  // so the sign-in cookie just works.
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
      // Where Laravel hands out the token that protects every change (CSRF).
      '/sanctum': 'http://localhost:8000',
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
