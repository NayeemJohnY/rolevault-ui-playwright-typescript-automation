import { test as base, expect, Page } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { HomePage } from '../pages/HomePage';
import { CommonAssertions } from '../pages/common/assertions';
import { commonLocators } from '../pages/common/locators';

export type TestFixtures = {
    app: Page;
    homePage: HomePage;
    dashboardPage: DashboardPage;
    assert: CommonAssertions;
    ui: ReturnType<typeof commonLocators>;
}

export const test = base.extend<TestFixtures>({
    app: async ({ page }, use) => {
        // Extend the page fixture to launch app and assert title and heading
        await page.goto("/");
        await expect(page).toHaveTitle('RoleVault');
        await expect(page.getByRole('heading', { name: 'Role Vault' })).toBeVisible();
        await use(page);
    },

    homePage: async ({ app }, use) => {
        const home = new HomePage(app);
        await use(home);
    },

    dashboardPage: async ({ app }, use) => {
        const dashboard = new DashboardPage(app);
        await use(dashboard);
    },

    assert: async ({ page }, use) => {
        const assert = new CommonAssertions(page);
        await use(assert);
    },

    ui: async ({ page }, use) => {
        await use(commonLocators(page));
    }
});

export { expect };

