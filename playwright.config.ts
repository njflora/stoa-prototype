// Browser smoke tests (`npm run test:e2e`): the static preview, built and
// served as GitHub Pages serves it, opened in Chromium. Tests are in e2e/.
// The first run needs the browser: `npx playwright install chromium`.
import { defineConfig, devices } from '@playwright/test'

const PORT = 4176

export default defineConfig({
  testDir: './e2e',
  // A failed run on CI gets one retry, and keeps a trace to inspect.
  retries: process.env.CI ? 1 : 0,
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}/stoa-prototype/`,
    trace: 'retain-on-failure',
    // The offline cache would keep files between tests; each test starts fresh.
    serviceWorkers: 'block',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run build:pages && npx vite preview --mode pages --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/stoa-prototype/`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
