import { defineConfig, devices, PlaywrightTestConfig } from '@playwright/test';

const startMaximized = {
  deviceScaleFactor: undefined,
  viewport: null,
  launchOptions: {
    args: ['--start-maximized']
  }
}

const baseURL = process.env.BASE_URL ||
  (process.env.TESTENV === 'prod' ? 'http://localhost:5000' : 'http://localhost:5001');

const basePlaywrightTestConfig: PlaywrightTestConfig = {
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: [
    ['html', { title: 'RoleVault Playwright Test Results' }],
    ['list']
  ],
  use: {
    screenshot: 'on-first-failure'
  },
  projects: [
    // Desktop - Most popular browser (covers 70%+ market share)
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...startMaximized
      }
    },

    // Desktop - Alternative engine for compatibility testing
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      }
    },

    // Mobile - Most popular mobile browser
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 7']
      },
    },

    {
      name: 'Google Chrome',
      use: {
        ...devices['Desktop Chrome'], channel: 'chrome',
        ...startMaximized
      }
    }
  ]
}

// Staging config: extends base, adds extra browsers for compatibility
const stagingPlaywrightTestConfig: PlaywrightTestConfig = {
  ...basePlaywrightTestConfig,
  name: 'Staging Tests',
  retries: process.env.ci ? 2 : 0,
  use: {
    ...basePlaywrightTestConfig.use,
    baseURL: baseURL,
    trace: process.env.ci ? 'on-first-retry' : 'retain-on-failure'
  }
}

// Production config: extends base, can be minimized for speed
const prodPlaywrightTestConfig: PlaywrightTestConfig = {
  ...basePlaywrightTestConfig,
  name: 'Production Tests',
  retries: 0,
  use: {
    ...basePlaywrightTestConfig.use,
    baseURL: baseURL,
    trace: 'retain-on-failure'
  }
}

// Map of environment name to config
const configMap: Record<string, PlaywrightTestConfig> = {
  staging: stagingPlaywrightTestConfig,
  prod: prodPlaywrightTestConfig
}

// Select environment from TESTENV variable, default to 'staging'
const testEnv = (process.env.TESTENV || 'staging') as keyof typeof configMap

// Export the selected config for Playwright
export default defineConfig(configMap[testEnv])