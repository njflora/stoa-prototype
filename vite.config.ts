import { copyFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { brand } from './src/config/brand'

// GitHub Pages serves the site from /stoa-prototype/. Only `vite build --mode pages`
// uses that base; dev, dev:laravel and a plain build stay at /.
const PAGES_BASE = '/stoa-prototype/'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'pages' ? PAGES_BASE : '/',
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
    // Pages has no server rewrites, so a refreshed deep link would 404. Pages
    // serves 404.html for any unknown address; a copy of index.html boots the
    // app there, and the router shows the right page.
    {
      name: 'spa-404-for-pages',
      apply: 'build',
      closeBundle() {
        if (mode === 'pages') copyFileSync('dist/index.html', 'dist/404.html')
      },
    },
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
}))
