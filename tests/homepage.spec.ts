import { test, expect } from '@playwright/test';

test('Launch RoleVault and Verify Title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('RoleVault')
  await expect(page.getByRole('heading', { name: 'Role Vault' })).toBeVisible()
});


test('Should user able to Login', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('RoleVault')
  await expect(page.getByRole('heading', { name: 'Role Vault' })).toBeVisible()
  await page.getByLabel('Email Address').fill('admin@test.com');
  await page.getByLabel('Password').fill('admin123');
  await page.getByTestId('login-submit').click();
  await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Profile', exact: true })).toBeVisible();
});
