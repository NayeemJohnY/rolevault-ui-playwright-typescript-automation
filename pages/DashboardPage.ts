import { expect, Locator, Page } from "@playwright/test";


export class DashboardPage {
    readonly page: Page;
    readonly $headingDashboard: Locator;
    readonly $profileIcon: Locator;

    constructor(page: Page) {
        this.page = page;
        this.$headingDashboard = page.getByRole('heading', { name: 'Dashboard', level: 1 });
        this.$profileIcon = page.getByRole('button', { name: 'Profile', exact: true });
    }

    async assertIsVisible() {
        await expect(this.$headingDashboard).toBeVisible();
        await expect(this.$profileIcon).toBeVisible();
    }
}