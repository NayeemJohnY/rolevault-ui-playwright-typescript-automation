import { test, expect } from '@playwright/test';

test('Launch RoleVault and Verify Title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('RoleVault')
  await expect(page.getByRole('heading', { name: 'Role Vault' })).toBeVisible()
});
