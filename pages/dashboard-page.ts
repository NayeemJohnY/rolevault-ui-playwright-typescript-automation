import type { Dialog, Locator, Page } from '@playwright/test';
import { expect } from '../fixtures/base';
import { BasePage } from './base-page';

export class DashboardPage extends BasePage {
  readonly $profileIcon: Locator;
  readonly $logout: Locator;
  readonly $logoutFromProfile: Locator;

  constructor(page: Page) {
    super(page);
    this.$profileIcon = page.getByRole('button', { name: 'Profile', exact: true });
    this.$logout = page.getByRole('button', { name: 'Logout' });
    this.$logoutFromProfile = page.getByTestId('logout-button');
  }

  async assertIsVisible(): Promise<void> {
    await expect(this.page).toHaveURL(/dashboard/);
    await expect(this.ui.$level1Heading('Dashboard')).toBeVisible();
    await expect(this.$profileIcon).toBeVisible();
  }

  async logoutFromProfile(): Promise<void> {
    const dialogPromise = this.page.waitForEvent('dialog', { timeout: 5000 });
    let dialog: Dialog;
    const clickLogout = async (): Promise<void> => {
      await this.$profileIcon.click();
      // Since this logout click not get resolves unless the dialog in handled
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.$logoutFromProfile.click();
    };
    try {
      await clickLogout();
      dialog = await dialogPromise;
    } catch {
      await clickLogout();
      dialog = await dialogPromise;
    }

    expect(dialog.message()).toBe('Are you sure you want to logout?');
    await dialog.accept();
  }

  async logoutFromSideNavMenu(): Promise<void> {
    if (await this.ui.$menuButton.isVisible()) {
      await this.ui.$menuButton.click();
    } else {
      await this.ui.$sidebar.hover();
    }
    await this.ui.$sidebar.locator(this.$logout).click();
  }
}
