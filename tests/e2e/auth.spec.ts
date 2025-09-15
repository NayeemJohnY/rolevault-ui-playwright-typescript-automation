import { expect, test } from '../../fixtures/base';
import { commonLocators } from '../../pages/common/locators';
import { DashboardPage } from '../../pages/DashboardPage';
import { HomePage } from '../../pages/HomePage';

test.describe("User Authentication E2E", { tag: '@e2e' }, () => {
    const currentTimeStampInSeconds = Math.floor(new Date().getTime() / 1000)
    const registerUser = {
        fullName: "John Test",
        emailAddress: `johntest${currentTimeStampInSeconds}@rolevault.com`,
        password: `TestMe@${currentTimeStampInSeconds}`
    };

    test("complete user registration, login, and logout flow", async ({ page }) => {
        const homePage = new HomePage(page);
        const dashboardPage = new DashboardPage(page);

        // Step 1 : Register New User
        await test.step("Register new user", async () => {
            await homePage.register(registerUser);
            await expect(commonLocators.$toastMessage(page, 'Account created successfully')).toBeVisible();
            await expect(page).toHaveURL(/dashboard/);
            await dashboardPage.assertIsVisible();
        });

        // Step 2: Logout user
        await test.step("Logout user", async () => {
            await dashboardPage.logoutFromProfile()
            await expect(commonLocators.$toastMessage(page, "Logged out successfully")).toBeVisible();
            await expect(homePage.$login).toBeVisible();
            await expect(page).toHaveURL(/login/);
        });

        // Step 3: Login with registered user
        await test.step("Login with registered user", async () => {
            homePage.login({
                emailAddress: registerUser.emailAddress,
                password: registerUser.password
            });
            await expect(commonLocators.$toastMessage(page, 'Welcome back')).toBeVisible()
            await expect(page).toHaveURL(/dashboard/);
            await dashboardPage.assertIsVisible();
        });


        // Step 4: Logout user
        await test.step("Logout user", async () => {
            await dashboardPage.logoutFromSideNavMenu()
            await expect(commonLocators.$toastMessage(page, "Logged out successfully")).toBeVisible();
            await expect(homePage.$login).toBeVisible();
            await expect(page).toHaveURL(/login/);
        });

    });

})



