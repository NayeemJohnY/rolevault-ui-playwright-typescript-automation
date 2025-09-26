import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";


export class DashboardPage extends BasePage {
    readonly $profileIcon: Locator;
    readonly $logout: Locator;
    readonly $logoutFromProfile: Locator

    constructor(page: Page) {
        super(page);
        this.$profileIcon = page.getByRole('button', { name: 'Profile', exact: true });
        this.$logout = page.getByRole('button', { name: 'Logout' });
        this.$logoutFromProfile = page.getByTestId('logout-button');
    }

    async assertIsVisible() {
        await expect(this.page).toHaveURL(/dashboard/);
        await expect(this.ui.$level1Heading('Dashboard')).toBeVisible();
        await expect(this.$profileIcon).toBeVisible();
    }


    async logoutFromProfile() {
        const dialogPromise = this.page.waitForEvent('dialog')

        await this.$profileIcon.hover();
        await this.$profileIcon.click();
        this.$logoutFromProfile.click();

        const dialog = await dialogPromise
        expect(dialog.message()).toEqual("Are you sure you want to logout?");
        await dialog.accept();
    }

    async logoutFromSideNavMenu() {
        if (await this.ui.$menuButton.isVisible()) {
            await this.ui.$menuButton.click();
        } else {
            await this.ui.$sidebar.hover();
        }
        await this.ui.$sidebar.locator(this.$logout).click();
    }
}