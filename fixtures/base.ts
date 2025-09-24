import { test as base, BrowserContext, expect, Page } from '@playwright/test';
import { App } from '../pages/App';
import { testUsers } from '../test-data/test-users';


async function launchApp(page: Page, url = "/") {
    await page.goto(url);
    await expect(page).toHaveTitle('RoleVault');
    await expect(page.getByRole('heading', { name: 'Role Vault' })).toBeVisible();
    return new App(page);
}

export type TestFixtures = {
    app: App;
    session: (options?: { baseURL?: string, newSession?: boolean, role?: keyof typeof testUsers }) => Promise<App>;
}

export const test = base.extend<TestFixtures>({
    app: async ({ page }, use) => {
        const app = await launchApp(page);
        await use(app);
    },

    session: async ({ browser, page }, use) => {
        const newSessions: BrowserContext[] = [];
        const getSession = async (options?: { baseURL?: string, newSession?: boolean, role?: keyof typeof testUsers }): Promise<App> => {
            let targetPage = page;

            if (options?.newSession) {
                const context = await browser.newContext();
                targetPage = await context.newPage();
                newSessions.push(context);
            }

            const appInstance = await launchApp(targetPage, options?.baseURL);

            if (options?.role) {
                await appInstance.homePage.login(testUsers[options.role]);
                await appInstance.assert.expectToastMessage("Welcome back");
                await expect(appInstance.page).toHaveURL(/dashboard/);
                await appInstance.dashboardPage.assertIsVisible();
            }

            return appInstance
        };
        await use(getSession);

        for (const session of newSessions) {
            await session.close();
        }
    },
});

export { expect };

