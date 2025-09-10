import { test as base, expect } from '@playwright/test'

export const test = base.extend({
    page: async ({ page }, use) => {
        // Extend the page fixture to launch app and assert title and heading
        await page.goto("/");
        await expect(page).toHaveTitle('RoleVault');
        await expect(page.getByRole('heading', { name: 'Role Vault' })).toBeVisible();
        await use(page);
    }
});

export { expect }