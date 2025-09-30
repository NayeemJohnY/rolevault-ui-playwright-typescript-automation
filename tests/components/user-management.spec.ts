/**
 * Component-level user management tests for RoleVault application.
 * Tests user filtering, searching, and table operations.
 */

import { USER_MANAGEMENT } from '../../constants';
import { expect, test } from '../../fixtures/base';
import type { Role, TestUser } from '../../test-data/test-users';
import { getNewUser, testUsers } from '../../test-data/test-users';
import { getRandomValue, getSearchString } from '../../utils/helper';

/** Available user roles for testing user creation */
export const ROLES = ['admin', 'contributor', 'viewer'];

test.describe.configure({ mode: 'default', timeout: 60000 });

test.describe('User management', { tag: '@component' }, () => {
  const users: TestUser[] = [];
  test.beforeAll('Create new users to enable pagination on the users table', async ({ request }) => {
    const admin = testUsers.Administrator;
    const loginResponse = await request.post('/api/auth/login', {
      data: { email: admin.emailAddress, password: admin.password },
    });
    const { token: authToken } = await loginResponse.json();
    for (let i = 0; i < 10; i++) {
      const user = getNewUser();
      user.role = getRandomValue(ROLES) as Role;
      users.push(user);
      const { fullName: name, emailAddress: email, password, role } = user;
      const response = await request.post('/api/users', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: { name, email, password, role },
      });
      expect(response.status()).toBe(201);
    }
  });

  test('Filter users by role', async ({ app, session }) => {
    await session({ role: 'Administrator' });
    await app.dashboardPage.navigateToMenu(USER_MANAGEMENT);
    const filteredRole = (await app.usersPage.filterUsersByRole()).toLowerCase();
    const uniqueColumValues = new Set(await app.usersPage.getColumnValues('Role'));
    expect(uniqueColumValues.size).toEqual(1);
    expect(uniqueColumValues.has(filteredRole)).toBeTruthy();
  });

  const searchFieldKey = { name: 'fullName', email: 'emailAddress' };
  for (const [field, key] of Object.entries(searchFieldKey)) {
    test(`Search users by ${field}`, async ({ app, session }) => {
      await session({ role: 'Administrator' });
      await app.dashboardPage.navigateToMenu(USER_MANAGEMENT);
      const searchString = getSearchString(String(getRandomValue(users)[key as keyof TestUser]));
      const tableTextContents = await app.usersPage.searchUsersBy(searchString);
      expect(tableTextContents.length).toBeGreaterThan(0);
      expect(tableTextContents.every((rowText) => rowText.toLowerCase().includes(searchString))).toBeTruthy();
    });
  }
});
