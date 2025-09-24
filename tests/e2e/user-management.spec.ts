import { expect, test } from '../../fixtures/base';
import { App } from '../../pages/App';
import { getNewUser } from '../../test-data/test-users';


test.describe("User management", { tag: '@e2e' }, () => {

    test('Admin login to Role Vault, add new user, added new user login, delete user, verify removed user cannot login', async ({ app, session }) => {
        await test.step('Admin login to Role Vault', async () => {
            await session({ role: 'Administrator' });
        });

        const newUser = getNewUser();
        newUser.role = 'Viewer';

        await test.step('Admin adds a new user and verifies user is added', async () => {
            await app.dashboardPage.navigateToMenu('User Management');
            await app.usersPage.addNewUser(newUser);
            await app.assert.expectToastMessage('User created successfully');
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
            const errorMessage = "Invalid credentials or account deactivated"
            await newUserApp.assert.expectFormError(errorMessage);
            await newUserApp.assert.expectToastMessage(errorMessage);
        });
    });
});