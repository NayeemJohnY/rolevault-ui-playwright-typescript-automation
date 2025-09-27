import { INVALID_LOGIN_ERROR_MSG, USER_ALREADY_EXISTS } from '../../constants';
import { expect, test } from '../../fixtures/base';
import { testUsers, getNewUser, type Role } from '../../test-data/test-users';

test.describe('User authentication', { tag: '@component' }, () => {
  test('Should allow user to login and access dashboard using UI test accounts', async ({ app }) => {
    await app.homePage.loginUsingTestAccount();
    await app.dashboardPage.assertIsVisible();
  });

  const invalidCredentials: Role[] = ['invalidPassword', 'tooShortPassword'];

  for (const role of invalidCredentials) {
    test(`Should show valid error for ${role} with invalid login credentials`, async ({ app }) => {
      await app.homePage.login(testUsers[role]);
      await app.assert.expectFormError(INVALID_LOGIN_ERROR_MSG);
      await app.assert.expectToastMessage(INVALID_LOGIN_ERROR_MSG);
    });
  }

  test('Should redirect unauthenticated user to login', async ({ app }) => {
    await test.step('Login with valid credentials', async () => {
      await app.homePage.loginUsingTestAccount();
      await app.dashboardPage.assertIsVisible();
    });

    await test.step('Clear session and verify redirect', async () => {
      await app.page.evaluate(() => {
        localStorage.clear();
      });
      await app.page.reload();
      await expect(app.page).not.toHaveURL(/dashboard/);
      await expect(app.homePage.$login).toBeVisible();
      await expect(app.page).toHaveURL(/login/);
    });
  });

  test('Should handle registration with existing email', async ({ app }) => {
    const existingEmail = await app.homePage.getRandomTestAccountEmail();
    await app.homePage.register({ ...getNewUser(), emailAddress: existingEmail });
    await app.assert.expectToastMessage(USER_ALREADY_EXISTS);
    await expect(app.page).not.toHaveURL(/dashboard/);
  });
});
