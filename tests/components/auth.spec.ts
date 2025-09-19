import { expect, test } from '../../fixtures/base';
import { commonLocators } from '../../pages/common/locators';
import { DashboardPage } from '../../pages/DashboardPage';
import { HomePage } from '../../pages/HomePage';

test.describe("User Authentication", { tag: '@component' }, () => {

  test.describe("Login", () => {

    test(`should allow to log in and access dashboard using ui test accounts`, async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.loginUsingTestAccount()
      await expect(page).toHaveURL(/dashboard/);
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.assertIsVisible();
    });

    const invalidCredentials = {
      invalidPassword: { emailAddress: "invaliduser@test.com", password: 'invalidPassword' },
      shorterInvalidPassword: { emailAddress: "invalidPassword@test.com", password: 'pass' },
    };

    for (const [type, credentials] of Object.entries(invalidCredentials)) {
      test(`should show valid error ${type} for invalid login credentials`, async ({ page }) => {
        const homePage = new HomePage(page);
        await homePage.login(credentials)
        const errorMessage = "Invalid credentials or account deactivated"
        await expect(commonLocators.$formError(page)).toHaveText(errorMessage);
        await expect(commonLocators.$toastMessage(page, errorMessage)).toBeVisible();
      });
    }

    test('should redirect unauthenticated user to login', async ({ page }) => {
      // user login
      const homePage = new HomePage(page);
      await homePage.loginUsingTestAccount();
      await expect(page).toHaveURL(/dashboard/);
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.assertIsVisible();
      // clear token & Reload
      await page.evaluate(() => { localStorage.clear(); })
      await page.reload();
      // session should be removed and redirected to login
      await expect(page).not.toHaveURL(/dashboard/);
      await expect(homePage.$login).toBeVisible();
      await expect(page).toHaveURL(/login/);
    });
  });

  test.describe("Register", () => {

    test("should handle registration with existing email", async ({ page }) => {
      const homePage = new HomePage(page);
      const existingEmail = await homePage.getRandomTestAccountEmail();
      await homePage.register({ emailAddress: existingEmail, fullName: 'Admin User', password: 'TestMe@123' });
      await expect(commonLocators.$toastMessage(page, 'User already exists with this email')).toBeVisible();
      await expect(page).not.toHaveURL(/dashboard/);
    });
  });

})



