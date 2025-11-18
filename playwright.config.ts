import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'PORT=3001 node dist/backend/server.js',
      port: 3001,
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: 'npm run dev:frontend',
      port: 3000,
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],
});
