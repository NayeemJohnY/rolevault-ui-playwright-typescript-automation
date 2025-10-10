import type { BrowserContext, Page } from '@playwright/test';
import { test as base, expect } from '@playwright/test';
import { App } from '../pages/app';
import { testUsers, type Role } from '../test-data/test-users';
import { captureScreenshot } from '../utils/helper';
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
  session: (options?: { baseURL?: string; role?: Role }) => Promise<App>;
};

export const test = base.extend<TestFixtures>({
  page: async ({ page }, use, testInfo) => {
    const pageIdentifier = 'MainPage';
    // Set up network monitoring for the main page
    const networkMonitor = await setupNetworkMonitoring(page, testInfo, pageIdentifier);

    await use(page);

    // Capture screenshot on failure
    if (testInfo.status !== testInfo.expectedStatus) {
      await captureScreenshot(testInfo, page, `${pageIdentifier}_${testInfo.title}`);
    }

    // Attach the network report after the test completes
    await networkMonitor.attachReport();
  },

  app: async ({ page }, use) => {
    const app = await launchApp(page);
    await use(app);
  },

  session: async ({ browser }, use, testInfo) => {
    const browserContexts: BrowserContext[] = [];
    const sessionData: Array<{
      page: Page;
      networkMonitor: { attachReport: () => Promise<void> };
      name: string;
    }> = [];

    const createSession = async (options?: { baseURL?: string; role?: Role }): Promise<App> => {
      const sessionIndex = sessionData.length + 1;
      const role = options?.role;
      const sessionName = `Session${sessionIndex}_${role || 'Unspecified'}`;

      const stepName = `Initialize ${sessionName}`;

      return await test.step(stepName, async () => {
        const context = await browser.newContext();
        const sessionPage = await context.newPage();
        browserContexts.push(context);

        // Manually set up network monitoring for this new page
        const networkMonitor = await setupNetworkMonitoring(sessionPage, testInfo, sessionName);
        sessionData.push({
          page: sessionPage,
          networkMonitor,
          name: sessionName,
        });

        const appInstance = await launchApp(sessionPage, options?.baseURL);

        if (role) {
          const user = testUsers[role];
          await appInstance.homePage.login(user);
          await appInstance.assert.expectToastMessage(`Welcome back, ${user.fullName}!`);
          await appInstance.dashboardPage.assertIsVisible();
        }

        return appInstance;
      });
    };

    await use(createSession);

    // Capture screenshots on failure for all session pages
    if (testInfo.status !== testInfo.expectedStatus) {
      for (const session of sessionData) {
        await captureScreenshot(testInfo, session.page, session.name);
      }
    }
    // Attach all network reports
    for (const session of sessionData) {
      try {
        await session.networkMonitor.attachReport();
      } catch (error) {
        console.warn(`Could not attach network report for ${session.name}:`, error);
      }
    }

    // Cleanup: Close all created browser contexts
    for (const context of browserContexts) {
      await context.close();
    }
  },
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
