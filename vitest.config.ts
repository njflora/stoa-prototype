// Unit tests for the site's logic (`npm run test:unit`). Kept apart from
// vite.config.ts, so tests run without the PWA and dev-tools plugins.
// Tests live beside the code they test, in __tests__ folders.
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['src/**/__tests__/*.spec.ts'],
  },
})
