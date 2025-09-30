/**
 * End-to-end authentication tests for RoleVault application.
 * Tests complete user authentication workflows from registration to logout.
 */

import { ACCOUNT_CREATE_SUCCESS, LOGOUT_SUCCESS } from '../../constants';
import { expect, test } from '../../fixtures/base';
import { getNewUser } from '../../test-data/test-users';

test.describe('User authentication E2E', { tag: '@e2e' }, () => {
  test('Should complete user registration, login, and logout flow', async ({ app }) => {
    // Step 1: Register a new user
    const registerUser = getNewUser();
    await test.step('Register a new user', async () => {
      await app.homePage.register(registerUser);
      await app.assert.expectToastMessage(ACCOUNT_CREATE_SUCCESS);
      await app.dashboardPage.assertIsVisible();
    });

    // Step 2: Logout from dashboard profile
    await test.step('Logout from dashboard profile', async () => {
      await app.dashboardPage.logoutFromProfile();
      await app.assert.expectToastMessage(LOGOUT_SUCCESS);
      await expect(app.homePage.$login).toBeVisible();
      await expect(app.page).toHaveURL(/login/);
    });

    // Step 3: Login with registered user credentials
    await test.step('Login with registered user credentials', async () => {
      await app.homePage.login(registerUser);
      await app.assert.expectToastMessage(`Welcome back, ${registerUser.fullName}!`);
      await app.dashboardPage.assertIsVisible();
    });

    // Step 4: Logout from side navigation menu
    await test.step('Logout from side navigation menu', async () => {
      await app.dashboardPage.logoutFromSideNavMenu();
      await app.assert.expectToastMessage(LOGOUT_SUCCESS);
      await expect(app.homePage.$login).toBeVisible();
      await expect(app.page).toHaveURL(/login/);
    });
  });
});
