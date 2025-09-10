import { expect, test } from '../fixtures/base';
import { DashboardPage } from '../pages/DashboardPage';
import { HomePage } from '../pages/HomePage';

test('should allow admin to log in with valid credentials and view dashboard', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.login({ emailAddress: "admin@test.com", password: 'admin123' })
  await expect(page).toHaveURL(/dashboard/);
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.assertIsVisible();
});

