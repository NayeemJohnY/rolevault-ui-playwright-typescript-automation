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
    let dialog: Dialog;
    const clickLogoutAndGetDialogPromise = async (): Promise<Dialog> => {
      const dialogPromise = this.page.waitForEvent('dialog', { timeout: 5000 });
      await this.$profileIcon.click();
      // Since this logout click not get resolves unless the dialog in handled
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.$logoutFromProfile.click();
      return dialogPromise;
    };
    try {
      dialog = await clickLogoutAndGetDialogPromise();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Timeout 5000ms exceeded while waiting for event "dialog"')
      ) {
        console.warn(`${error.message} Retrying...`);
        dialog = await clickLogoutAndGetDialogPromise();
      }
      throw error;
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
