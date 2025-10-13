import { defineConfig, devices, type PlaywrightTestConfig, type ReporterDescription } from '@playwright/test';
import { getArg } from './utils/helper';

/**
 * Supported test environments for the RoleVault application.
 * Each environment has different base URLs and configurations.
 */
type Environment = 'staging' | 'prod';

/**
 * Current test environment, determined from TESTENV environment variable.
 * Defaults to 'staging' if not specified.
 */
const environment = (process.env.TESTENV as Environment) || 'staging';

/**
 * Base URL for the application under test.
 * Can be overridden by BASE_URL environment variable or determined by environment.
 */
const baseURL =
  process.env.BASE_URL ||
  {
    prod: 'http://localhost:5000',
    staging: 'http://localhost:5001',
  }[environment];

/**
 * Browser configuration for maximized window when running in headed mode.
 * Only applied when tests are running with visible browser.
 */
const startMaximizedConfig = process.env.PW_HEADED
  ? {
      deviceScaleFactor: undefined,
      viewport: null,
      launchOptions: {
        args: ['--start-maximized'],
      },
    }
  : {};

const reportsConfig: ReporterDescription[] = getArg('--shard')
  ? [['list'], ['allure-playwright'], ['blob']]
  : [
      ['list'],
      ['allure-playwright'],
      ['html', { title: 'RoleVault Playwright Test Results' }],
      ['./custom-reporter/test-results-reporter.ts'],
    ];

/**
 * Base Playwright test configuration shared across all environments.
 * Defines common settings for test execution, reporting, and browser behavior.
 */
const basePlaywrightTestConfig: PlaywrightTestConfig = {
  testDir: './tests',
  globalSetup: './fixtures/globalSetup',
  globalTeardown: './fixtures/globalTeardown',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: reportsConfig,
  expect: {
    timeout: 10000,
  },
  use: {
    video: 'retain-on-failure',
  },
  projects: [
    // Desktop - Most popular browser (covers 70%+ market share)
    {
      name: 'Chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...startMaximizedConfig,
      },
    },

    // Desktop - Alternative engine for compatibility testing
    {
      name: 'Firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    // Mobile - Most popular mobile browser
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 7'],
      },
    },

    {
      name: 'Google Chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        ...startMaximizedConfig,
      },
    },
  ],
};

/**
 * Staging environment configuration.
 * Extends base configuration with additional retry logic and trace settings for CI.
 */
const stagingPlaywrightTestConfig: PlaywrightTestConfig = {
  ...basePlaywrightTestConfig,
  name: 'Staging Tests',
  retries: process.env.ci ? 2 : 0,
  use: {
    ...basePlaywrightTestConfig.use,
    baseURL,
    trace: process.env.ci ? 'on-first-retry' : 'retain-on-failure',
  },
};

/**
 * Production environment configuration.
 * Optimized for speed with no retries and minimal trace collection.
 */
const prodPlaywrightTestConfig: PlaywrightTestConfig = {
  ...basePlaywrightTestConfig,
  name: 'Production Tests',
  retries: 0,
  use: {
    ...basePlaywrightTestConfig.use,
    baseURL,
    trace: 'retain-on-failure',
  },
};

/**
 * Mapping of environment names to their respective configurations.
 * Used to select the appropriate config based on the current environment.
 */
const configMap: Record<Environment, PlaywrightTestConfig> = {
  staging: stagingPlaywrightTestConfig,
  prod: prodPlaywrightTestConfig,
};

/**
 * Exports the Playwright configuration for the current environment.
 * Configuration is selected based on the TESTENV environment variable.
 */
export default defineConfig(configMap[environment]);
