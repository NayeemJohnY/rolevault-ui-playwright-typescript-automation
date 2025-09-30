import type { Page } from '@playwright/test';
import { expect } from '../../fixtures/base';
import { commonLocators } from './locators';

/**
 * Common assertion utilities for RoleVault application testing.
 * Provides reusable assertion methods for UI validation across all pages.
 */
export class CommonAssertions {
  readonly page: Page;

  /**
   * Creates a new CommonAssertions instance.
   *
   * @param page - Playwright page instance to perform assertions on
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Verifies that a toast message with specific text is visible and close it
   *
   * @param message - Expected toast message text
   */
  async expectToastMessage(message: string): Promise<void> {
    await expect(commonLocators(this.page).$toastMessage(message)).toBeVisible();
    await commonLocators(this.page).$toastMessageCloseButton(message).click();
  }

  /**
   * Verifies that a form error message has the expected text.
   *
   * @param message - Expected form error message text
   */
  async expectFormError(message: string): Promise<void> {
    await expect(commonLocators(this.page).$formError).toHaveText(message);
  }
}
