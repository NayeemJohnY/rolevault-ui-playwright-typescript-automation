import { expect, test } from '../fixtures/base';
import { DashboardPage } from '../pages/DashboardPage';
import { HomePage } from '../pages/HomePage';

test.describe("User Authentication", () => {
  const users = {
    admin: { emailAddress: "admin@test.com", password: 'admin123' },
    contributor: { emailAddress: "contributor@test.com", password: 'contrib123' },
    viewer: { emailAddress: "viewer@test.com", password: 'viewer123' }
  };

  for (const [role, credentials] of Object.entries(users)) {
    test(`should allow ${role} to log in and access dashboard`, async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.login(credentials)
      await expect(page).toHaveURL(/dashboard/);
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.assertIsVisible();
    });
  };


})



