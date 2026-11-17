import { defineConfig } from '@playwright/test';

/**
 * End-to-end tests run against the production build served by `vite preview`, so the
 * Content Security Policy meta tag and the service worker are exercised too. The tests use
 * the Chrome already installed on the machine (channel: 'chrome'); nothing is downloaded.
 */
export default defineConfig({
  testDir: 'e2e',
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['github'], ['list']] : [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173/study-lab/',
    channel: 'chrome',
    headless: true,
    trace: 'retain-on-failure',
    viewport: { width: 1100, height: 800 },
  },
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort --host 127.0.0.1',
    url: 'http://127.0.0.1:4173/study-lab/',
    reuseExistingServer: !process.env['CI'],
    timeout: 60_000,
  },
});
