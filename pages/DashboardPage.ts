import { expect, Locator, Page } from "@playwright/test";


export class DashboardPage {
    readonly page: Page;
    readonly $headingDashboard: Locator;
    readonly $profileIcon: Locator;
    readonly $logout: Locator;
    readonly $sidebar: Locator;
    readonly $menuButton: Locator
    readonly $appHeader: Locator

    constructor(page: Page) {
        this.page = page;
        this.$headingDashboard = page.getByRole('heading', { name: 'Dashboard', level: 1 });
        this.$profileIcon = page.getByRole('button', { name: 'Profile', exact: true });
        this.$logout = page.getByRole('button', { name: 'Logout' });
        this.$sidebar = page.getByTestId('sidebar');
        this.$menuButton = page.getByTestId('menu-button');
        this.$appHeader = page.locator(".app-header");
    }

    async assertIsVisible() {
        await expect(this.$headingDashboard).toBeVisible();
        await expect(this.$profileIcon).toBeVisible();
    }


    async logoutFromProfile() {
        await this.$profileIcon.hover()
        await this.$profileIcon.click();
        await Promise.all([
            this.page.once('dialog', async dialog => {
                expect(dialog.message()).toEqual("Are you sure you want to logout?");
                await dialog.accept();
            }),
            this.$appHeader.locator(this.$logout).click()
        ]);
    }

    async logoutFromSideNavMenu() {
        if (await this.$menuButton.isVisible()) {
            await this.$menuButton.click();
        } else {
            await this.$sidebar.hover();
        }
        await this.$sidebar.locator(this.$logout).click();
    }
}