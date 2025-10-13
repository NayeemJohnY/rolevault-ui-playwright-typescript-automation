import { test } from '../fixtures/base';

test.describe('Test group', () => {
  test('Should allow user to login and access dashboard using UI test accounts', async ({ app }) => {
    await app.homePage.loginUsingTestAccount();
    await app.dashboardPage.assertIsVisible();
  });
});
