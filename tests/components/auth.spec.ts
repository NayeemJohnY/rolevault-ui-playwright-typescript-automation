import { expect, test } from '../../fixtures/base';
import { registerUser, testUsers } from '../../test-data/test-users';

test.describe("User Authentication", { tag: '@component' }, () => {

  test.describe("Login", () => {

    test(`should allow to log in and access dashboard using ui test accounts`, { tag: '@smoke' }, async ({ page, homePage, dashboardPage }) => {
      await homePage.loginUsingTestAccount()
      await expect(page).toHaveURL(/dashboard/);
      await dashboardPage.assertIsVisible();
    });

    const invalidCredentials = [testUsers['invalidPassword'], testUsers['tooShortPassword']];
    const errorMessage = "Invalid credentials or account deactivated"

    for (const user of invalidCredentials) {
      test(`should show valid error ${user.role} for invalid login credentials`, async ({ homePage, assert }) => {
        await homePage.login(user)
        await assert.expectFormError(errorMessage);
        await assert.expectToastMessage(errorMessage);
      });
    }

    test('should redirect unauthenticated user to login', async ({ page, homePage, dashboardPage }) => {

      await test.step('Login with valid credentials', async () => {
        await homePage.loginUsingTestAccount();
        await expect(page).toHaveURL(/dashboard/);
        await dashboardPage.assertIsVisible();
      });

      await test.step('Clear session and verify redirect', async () => {
        await page.evaluate(() => { localStorage.clear(); })
        await page.reload();
        await expect(page).not.toHaveURL(/dashboard/);
        await expect(homePage.$login).toBeVisible();
        await expect(page).toHaveURL(/login/);
      });
    });
  });

  test.describe("Register", () => {

    test("should handle registration with existing email", async ({ page, homePage, assert }) => {
      const existingEmail = await homePage.getRandomTestAccountEmail();
      await homePage.register({ ...registerUser, emailAddress: existingEmail });
      await assert.expectToastMessage('User already exists with this email');
      await expect(page).not.toHaveURL(/dashboard/);
    });
  });

})



