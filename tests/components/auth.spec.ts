import { expect, test } from '../../fixtures/base';
import { testUsers, getNewUser } from '../../test-data/test-users';

test.describe("User authentication", { tag: '@component' }, () => {

  test.describe("Login", () => {

    test('Should allow user to login and access dashboard using UI test accounts', { tag: '@smoke' }, async ({ app }) => {
      await app.homePage.loginUsingTestAccount()
      await expect(app.page).toHaveURL(/dashboard/);
      await app.dashboardPage.assertIsVisible();
    });

    const invalidCredentials = [testUsers.invalidPassword, testUsers.tooShortPassword];
    const errorMessage = "Invalid credentials or account deactivated"

    for (const user of invalidCredentials) {
      test(`Should show valid error for ${user.role} with invalid login credentials`, async ({ app }) => {
        await app.homePage.login(user)
        await app.assert.expectFormError(errorMessage);
        await app.assert.expectToastMessage(errorMessage);
      });
    }

    test('Should redirect unauthenticated user to login', async ({ app }) => {

      await test.step('Login with valid credentials', async () => {
        await app.homePage.loginUsingTestAccount();
        await expect(app.page).toHaveURL(/dashboard/);
        await app.dashboardPage.assertIsVisible();
      });

      await test.step('Clear session and verify redirect', async () => {
        await app.page.evaluate(() => { localStorage.clear(); })
        await app.page.reload();
        await expect(app.page).not.toHaveURL(/dashboard/);
        await expect(app.homePage.$login).toBeVisible();
        await expect(app.page).toHaveURL(/login/);
      });
    });
  });

  test.describe("Register", () => {

    test("Should handle registration with existing email", async ({ app }) => {
      const existingEmail = await app.homePage.getRandomTestAccountEmail();
      await app.homePage.register({ ...getNewUser(), emailAddress: existingEmail });
      await app.assert.expectToastMessage('User already exists with this email');
      await expect(app.page).not.toHaveURL(/dashboard/);
    });
  });

})



