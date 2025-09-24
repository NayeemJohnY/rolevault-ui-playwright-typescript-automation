import { expect, test } from '../../fixtures/base';
import { testUsers, getNewUser, TestUser } from '../../test-data/test-users';


test.describe("User Management", { tag: '@e2e' }, () => {

    test("Admin Login -> Add User -> Added New User Login -> Admin Delete User -> Removed User Unable to Login", async ({ app, newSession }) => {
        await test.step("admin login to role vault", async () => {
            app.homePage.login(testUsers.Administrator);
            await app.assert.expectToastMessage("Welcome back");
            await expect(app.page).toHaveURL(/dashboard/);
            await app.dashboardPage.assertIsVisible();
        });

        const newUser: TestUser = getNewUser();
        newUser.role = 'Viewer';

        await test.step("admin add user & verify user is added", async () => {
            await app.dashboardPage.navigateToMenu('User Management');
            await app.usersPage.addNewUser(newUser);
            await app.assert.expectToastMessage('User created successfully');
            await expect(app.usersPage.$userRow(newUser)).toBeVisible();
        });

        await test.step("added new user login to role vault & logout", async () => {
            const newUserApp = await newSession();
            newUserApp.homePage.login(newUser);
            await newUserApp.assert.expectToastMessage("Welcome back");
            await expect(newUserApp.page).toHaveURL(/dashboard/);
            await newUserApp.dashboardPage.assertIsVisible();
            await newUserApp.dashboardPage.logoutFromSideNavMenu();
        });

        await test.step("admin delete added user", async () => {
            await app.usersPage.deleteUser(newUser);
            await expect(app.usersPage.$userRow({ ...newUser, role: 'Viewer' })).not.toBeVisible();
        });




    });
});