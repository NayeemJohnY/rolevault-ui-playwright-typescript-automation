import { expect, test } from '../../fixtures/base';
import { getNewUser } from '../../test-data/test-users';

test.describe("User Authentication E2E", { tag: '@e2e' }, () => {


    test("complete user registration, login, and logout flow", async ({ app }) => {

        // Step 1 : Register New User
        const registerUser = getNewUser();
        await test.step("Register new user", async () => {
            await app.homePage.register(registerUser);
            await app.assert.expectToastMessage('Account created successfully');
            await expect(app.page).toHaveURL(/dashboard/);
            await app.dashboardPage.assertIsVisible();
        });

        // Step 2: Logout user
        await test.step("Logout user", async () => {
            await app.dashboardPage.logoutFromProfile()
            await app.assert.expectToastMessage("Logged out successfully");
            await expect(app.homePage.$login).toBeVisible();
            await expect(app.page).toHaveURL(/login/);
        });

        // Step 3: Login with registered user
        await test.step("Login with registered user", async () => {
            await app.homePage.login(registerUser);
            await app.assert.expectToastMessage("Welcome back");
            await expect(app.page).toHaveURL(/dashboard/);
            await app.dashboardPage.assertIsVisible();
        });


        // Step 4: Logout user
        await test.step("Logout user", async () => {
            await app.dashboardPage.logoutFromSideNavMenu()
            await app.assert.expectToastMessage("Logged out successfully");
            await expect(app.homePage.$login).toBeVisible();
            await expect(app.page).toHaveURL(/login/);
        });

    });

})



