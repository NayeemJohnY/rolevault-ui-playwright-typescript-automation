import { test, expect } from '../fixtures/base';


test('Should user able to Login', async ({ page }) => {
  await page.getByLabel('Email Address').fill('admin@test.com');
  await page.getByLabel('Password').fill('admin123');
  await page.getByTestId('login-submit').click();
  await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Profile', exact: true })).toBeVisible();
});
