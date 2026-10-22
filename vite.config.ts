import { copyFileSync, readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { brand } from './src/config/brand'

// GitHub Pages serves the site from /stoa-prototype/. Only `vite build --mode pages`
// uses that base; dev, dev:laravel and a plain build stay at /.
const PAGES_BASE = '/stoa-prototype/'

// The site's Content Security Policy: what the browser may load and run.
// Scripts, data, images, video and fonts come from the site itself; frames
// only from the three video platforms' embed pages. Inline styles are
// allowed because Vue sets some style attributes; inline scripts are not.
// GitHub Pages cannot send headers, so it goes in a <meta> tag, which
// cannot carry frame-ancestors: the Laravel server sends that as a header.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "font-src 'self'",
  "connect-src 'self'",
  'frame-src https://rumble.com https://odysee.com https://www.bitchute.com',
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

/** A colour from the theme tokens in main.css, so the app's colours follow the site's. */
function themeToken(name: string): string {
  const css = readFileSync(new URL('./src/assets/main.css', import.meta.url), 'utf8')
  const value = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{3,8})`))?.[1]
  if (!value) throw new Error(`No --color-${name} token in main.css`)
  return value
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const base = mode === 'pages' ? PAGES_BASE : '/'
  return {
    base,
    plugins: [
      // index.html's title and description come from the brand file.
      {
        name: 'brand-in-index-html',
        transformIndexHtml: (html) =>
          html.replaceAll('%BRAND_NAME%', brand.name).replaceAll(
            '%BRAND_DESCRIPTION%',
            brand.description.replace(/^./, (c) => c.toLowerCase()),
          ),
      },
      // Built pages only: the dev server injects inline styles and a live-reload connection.
      {
        name: 'content-security-policy',
        apply: 'build',
        transformIndexHtml: () => [
          {
            tag: 'meta',
            attrs: { 'http-equiv': 'Content-Security-Policy', content: CONTENT_SECURITY_POLICY },
            injectTo: 'head-prepend',
          },
        ],
      },
      vue(),
      vueDevTools(),
      tailwindcss(),
      // The installable app. The service worker is built with the site and is
      // never registered by `npm run dev` or `dev:laravel` (devOptions is off).
      // "prompt": a new version waits until the visitor chooses to reload.
      VitePWA({
        registerType: 'prompt',
        injectRegister: false,
        includeAssets: ['favicon.ico', 'icons/apple-touch-icon.png'],
        manifest: {
          id: base,
          name: brand.name,
          short_name: brand.name,
          description: brand.description,
          lang: 'en-GB',
          theme_color: themeToken('ink'),
          background_color: themeToken('ink'),
          display: 'standalone',
          scope: base,
          start_url: base,
          icons: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          // The app shell. Data and images are cached as they are visited (below).
          globPatterns: ['**/*.{js,css,html,ico,png,woff2}'],
          globIgnores: ['404.html', 'data/**', 'media/**'],
          // Any address opens the app shell, and the router shows the page.
          navigateFallback: `${base}index.html`,
          cleanupOutdatedCaches: true,
          // These rules match only this site's own paths, so third-party
          // players are never cached. Videos are not cached either.
          runtimeCaching: [
            {
              urlPattern: new RegExp(`${base}data/.+\\.json$`),
              handler: 'StaleWhileRevalidate',
              options: { cacheName: 'stoa-data', expiration: { maxEntries: 400 } },
            },
            {
              urlPattern: new RegExp(`${base}(media|icons)/.+\\.(webp|png|jpe?g|svg)$`),
              handler: 'CacheFirst',
              options: { cacheName: 'stoa-images', expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 } },
            },
          ],
        },
      }),
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
  }
})
