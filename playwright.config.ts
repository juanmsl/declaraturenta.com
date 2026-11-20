import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

/**
 * End-to-end tests (ADR 0042): Chromium at 1440 px against the production build served by
 * `vite preview`, which mimics Vercel's routing (one HTML per public page, `app.html` for the rest).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${String(PORT)}`,
    locale: 'es-CO',
    timezoneId: 'America/Bogota',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        // Local runs can point to an already installed Chromium.
        launchOptions: process.env.E2E_CHROMIUM_PATH ? { executablePath: process.env.E2E_CHROMIUM_PATH } : {},
      },
    },
  ],
  webServer: {
    command: `pnpm build && pnpm preview --port ${String(PORT)} --strictPort`,
    url: `http://localhost:${String(PORT)}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
