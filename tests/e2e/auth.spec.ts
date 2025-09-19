import { expect, test } from '../../fixtures/base';

test.describe("User Authentication E2E", { tag: '@e2e' }, () => {
    const currentTimeStampInSeconds = Math.floor(new Date().getTime() / 1000)
    const registerUser = {
        fullName: "John Test",
        emailAddress: `johntest${currentTimeStampInSeconds}@rolevault.com`,
        password: `TestPassword@${currentTimeStampInSeconds}`
    };

    test("complete user registration, login, and logout flow", async ({ page, homePage, dashboardPage, assert }) => {

        // Step 1 : Register New User
        await test.step("Register new user", async () => {
            await homePage.register(registerUser);
            await assert.expectToastMessage('Account created successfully');
            await expect(page).toHaveURL(/dashboard/);
            await dashboardPage.assertIsVisible();
        });

        // Step 2: Logout user
        await test.step("Logout user", async () => {
            await dashboardPage.logoutFromProfile()
            await assert.expectToastMessage("Logged out successfully");
            await expect(homePage.$login).toBeVisible();
            await expect(page).toHaveURL(/login/);
        });

        // Step 3: Login with registered user
        await test.step("Login with registered user", async () => {
            homePage.login({
                emailAddress: registerUser.emailAddress,
                password: registerUser.password
            });
            await assert.expectToastMessage("Welcome back");
            await expect(page).toHaveURL(/dashboard/);
            await dashboardPage.assertIsVisible();
        });


        // Step 4: Logout user
        await test.step("Logout user", async () => {
            await dashboardPage.logoutFromSideNavMenu()
            await assert.expectToastMessage("Logged out successfully");
            await expect(homePage.$login).toBeVisible();
            await expect(page).toHaveURL(/login/);
        });

    });

})



