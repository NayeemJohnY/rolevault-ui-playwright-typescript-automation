import { test as base, expect, Page } from '@playwright/test';
import { App } from '../pages/App';


async function launchApp(page: Page, url = "/") {
    await page.goto(url);
    await expect(page).toHaveTitle('RoleVault');
    await expect(page.getByRole('heading', { name: 'Role Vault' })).toBeVisible();
    return new App(page);
}

export type TestFixtures = {
    app: App;
    newSession: (baseURL?: string) => Promise<App>;
}

export const test = base.extend<TestFixtures>({
    app: async ({ page }, use) => {
        const app = await launchApp(page);
        await use(app);
    },

    newSession: async ({ browser }, use) => {
        const sessions: App[] = [];

        const createSession = async (baseURL?: string) => {
            const context = await browser.newContext();
            const page = await context.newPage();
            const url = baseURL || "/";
            const app = launchApp(page, url);
            return app;
        }

        await use(createSession);

        // Cleanup all created sessions
        for (const session of sessions) {
            await session.page.context().close();
        }
    }

});

export { expect };

