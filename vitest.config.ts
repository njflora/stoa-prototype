// Unit tests for the site's logic (`npm run test:unit`). Kept apart from
// vite.config.ts, so tests run without the PWA and dev-tools plugins.
// Tests live beside the code they test, in __tests__ folders. The Vue
// plugin lets a test mount a single-file component.
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['src/**/__tests__/*.spec.ts'],
  },
})
