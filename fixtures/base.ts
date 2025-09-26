import type { BrowserContext, Page } from '@playwright/test';
import { test as base, expect } from '@playwright/test';
import { App } from '../pages/app';
import { testUsers, type Role } from '../test-data/test-users';

export { expect };

async function launchApp(page: Page, url = "/") {
    return await test.step('Launch Application', async () => {
        await page.goto(url);
        await expect(page).toHaveTitle('RoleVault');
        await expect(page.getByRole('heading', { name: 'Role Vault' })).toBeVisible();
        return new App(page);
    });
}

export type TestFixtures = {
    app: App;
    session: (options?: { baseURL?: string, newSession?: boolean, role?: Role }) => Promise<App>;
}

export const test = base.extend<TestFixtures>({
    app: async ({ page }, use) => {
        const app = await launchApp(page);
        await use(app);
    },

    session: async ({ browser, page }, use) => {
        const browserContexts: BrowserContext[] = [];

        const createSession = async (options?: { baseURL?: string, newSession?: boolean, role?: Role }): Promise<App> => {
            const stepName = `Initialize session ${options?.newSession ? 'New' : ''} for ${options?.role || 'anonymous user'}`;
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
});


export function step(stepName?: string) {

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    return function decorator(target: Function, context: ClassMethodDecoratorContext) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return async function replacementMethod(this: any, ...args: any[]) {
            const name = stepName ? stepName : `${this.constructor.name} + "." + ${String(context.name)}`
            return await test.step(name, async () => {
                return await target.call(this, ...args);
            })
        }
    }
}