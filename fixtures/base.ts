import type { BrowserContext, Page } from '@playwright/test';
import { test as base, expect } from '@playwright/test';
import { App } from '../pages/app';
import { testUsers, type Role } from '../test-data/test-users';
import { setupNetworkMonitoring } from '../utils/networkMonitor';

export { expect };

/**
 * Launches the RoleVault application and performs initial setup.
 *
 * @param page - The Playwright page instance
 * @param url - The URL to navigate to, defaults to '/'
 * @returns Promise resolving to an App instance
 * @throws Will throw an error if the application fails to load or title is incorrect
 */
async function launchApp(page: Page, url = '/'): Promise<App> {
  return await test.step('Launch Application', async () => {
    await page.goto(url);
    await expect(page).toHaveTitle('RoleVault');
    await expect(page.getByRole('heading', { name: 'Role Vault' })).toBeVisible();
    const app = new App(page);
    await app.homePage.addPopupHandler();
    return app;
  });
}

/**
 * Test fixtures interface extending Playwright's base test fixtures.
 * Provides common utilities and setup for RoleVault application tests.
 */
export type TestFixtures = {
  /** Pre-initialized App instance for the current test */
  app: App;
  /** Session factory function to create app instances with different configurations */
  session: (options?: { baseURL?: string; newSession?: boolean; role?: Role }) => Promise<App>;
  /** Automatic full page screenshot capture on test failure */
  fullPageScreenshotOnFailure: void;

  networkMonitor: void;
};

export const test = base.extend<TestFixtures>({
  app: async ({ page }, use) => {
    const app = await launchApp(page);
    await use(app);
  },

  session: async ({ browser, page }, use) => {
    const browserContexts: BrowserContext[] = [];

    const createSession = async (options?: { baseURL?: string; newSession?: boolean; role?: Role }): Promise<App> => {
      const stepName = `Initialize session ${options?.newSession ? 'New' : ''} for ${
        options?.role || 'anonymous user'
      }`;
      return await test.step(stepName, async () => {
        let sessionPage = page;
        if (options?.newSession) {
          const context = await browser.newContext();
          sessionPage = await context.newPage();
          browserContexts.push(context);
        }
        const appInstance = await launchApp(sessionPage, options?.baseURL);

        if (options?.role) {
          const user = testUsers[options.role];
          await appInstance.homePage.login(user);
          await appInstance.assert.expectToastMessage(`Welcome back, ${user.fullName}!`);
          await appInstance.dashboardPage.assertIsVisible();
        }

        return appInstance;
      });
    };

    await use(createSession);

    // Cleanup: Close all created browser contexts
    for (const context of browserContexts) {
      await context.close();
    }
  },

  fullPageScreenshotOnFailure: [
    async ({ page }, use, testInfo): Promise<void> => {
      await use();
      if (testInfo.status !== testInfo.expectedStatus) {
        const screenshot = await page.screenshot({
          path: `screenshots/${testInfo.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`,
          fullPage: true,
          scale: 'css',
        });
        await testInfo.attach(testInfo.title, {
          body: screenshot,
          contentType: 'image/png',
        });
      }
    },
    { auto: true },
  ],

  networkMonitor: [
    async ({ page }, use, testInfo): Promise<void> => {
      // Use the setupNetworkMonitoring function from networkMonitor.ts
      const networkMonitor = await setupNetworkMonitoring(page, testInfo);

      await use();

      // Attach the network report after the test completes
      await networkMonitor.attachReport();
    },
    { auto: true },
  ],
});

/**
 * Decorator function that wraps class methods with Playwright test steps.
 * Provides better test reporting and debugging by creating named steps in test execution.
 *
 * @param stepName - Optional custom name for the test step. If not provided, uses class and method name
 * @returns Decorator function for class methods
 *
 * @example
 * ```typescript
 * class MyPage {
 *   @step('Click login button')
 *   async clickLogin() {
 *     // method implementation
 *   }
 * }
 * ```
 */
export function step(stepName?: string) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return function decorator(target: Function, context: ClassMethodDecoratorContext) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return async function replacementMethod<T>(this: any, ...args: any[]): Promise<T> {
      const name = stepName ? stepName : `${this.constructor.name} + "." + ${String(context.name)}`;
      return await test.step(name, async () => await target.call(this, ...args));
    };
  };
}
