import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/ui-analysis',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  timeout: 30000,

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'off',
    screenshot: 'on',
    video: 'off',
  },

  projects: [
    {
      name: 'Desktop',
      use: { viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'Tablet',
      use: { viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'Mobile',
      use: { viewport: { width: 375, height: 812 } },
    },
  ],
})
