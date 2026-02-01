import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js', // Only run .spec.js files (not .test.js which are for Vitest)
  timeout: 60000,
  retries: 0,
  workers: 1, // Single worker to avoid memory issues
  fullyParallel: false,
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'off', // Disable screenshots to save memory
    video: 'off', // Disable video to save memory
    trace: 'off', // Disable trace to save memory
    contextOptions: {
      reducedMotion: 'reduce', // Reduce animations
    },
    // Fresh context for each test to avoid memory/state leaks
    launchOptions: {
      args: ['--disable-dev-shm-usage', '--no-sandbox'],
    },
  },
  // Close browser between test files for better cleanup
  globalSetup: undefined,
  globalTeardown: undefined,
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        launchOptions: {
          args: ['--disable-dev-shm-usage'], // Help with memory on some systems
        },
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
  },
});
