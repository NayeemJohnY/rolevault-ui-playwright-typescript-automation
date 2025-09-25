import { INVALID_LOGIN_ERROR_MSG, USER_CREATE_SUCCESS, USER_MANAGEMENT } from '../../constants';
import { expect, test } from '../../fixtures/base';
import { App } from '../../pages/App';
import { getNewUser, TestUser } from '../../test-data/test-users';


test.describe("User management E2E", { tag: '@e2e' }, () => {

    test('Admin login to Role Vault, add new user, added new user login, delete user, verify removed user cannot login', async ({ app, session }) => {
        await session({ role: 'Administrator' });
        const newUser: TestUser = { ...getNewUser(), role: 'Viewer' };

        await test.step('Admin adds a new user and verifies user is added', async () => {
            await app.dashboardPage.navigateToMenu(USER_MANAGEMENT);
            await app.usersPage.addNewUser(newUser);
            await app.assert.expectToastMessage(USER_CREATE_SUCCESS);
            await expect(app.usersPage.$userRow(newUser)).toBeVisible();
        });

        let newUserApp: App;
        await test.step('Newly added user login to Role Vault and logs out', async () => {
            newUserApp = await session({ newSession: true });
            newUserApp.homePage.login(newUser);
            await newUserApp.assert.expectToastMessage(`Welcome back, ${newUser.fullName}!`);
            await newUserApp.dashboardPage.assertIsVisible();
            await newUserApp.dashboardPage.logoutFromSideNavMenu();
        });

        await test.step('Admin deletes the added user', async () => {
            await app.usersPage.deleteUser(newUser);
            await expect(app.usersPage.$userRow({ ...newUser, role: 'Viewer' })).not.toBeVisible();
        });

        await test.step('Removed user is unable to login', async () => {
            newUserApp.homePage.login(newUser);
            await newUserApp.assert.expectFormError(INVALID_LOGIN_ERROR_MSG);
            await newUserApp.assert.expectToastMessage(INVALID_LOGIN_ERROR_MSG);
        });
    });
});