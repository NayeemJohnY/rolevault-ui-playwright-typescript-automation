import { type Page } from '@playwright/test';
import { step, expect } from '../fixtures/base';
import { CommonAssertions } from './common/assertions';
import { commonLocators } from './common/locators';

/**
 * Abstract base class for all page objects in the RoleVault application.
 * Provides common functionality and utilities that all pages need.
 */
export abstract class BasePage {
  readonly page: Page;
  readonly ui: ReturnType<typeof commonLocators>;
  readonly assert: CommonAssertions;

  /**
   * Creates a new page instance with common utilities.
   *
   * @param page - Playwright page instance to interact with
   */
  constructor(page: Page) {
    this.page = page;
    this.ui = commonLocators(page);
    this.assert = new CommonAssertions(page);
  }

  /**
   * Navigates to a menu item from the sidebar and verifies the page heading.
   * Handles both mobile (menu button) and desktop (hover) navigation patterns.
   *
   * @param menuName - Name of the menu item to navigate to
   * @param pageHeading - Expected page heading (defaults to menuName if not provided)
   */
  @step('Navigate to menu from sidebar')
  async navigateToMenu(menuName: string, pageHeading?: string): Promise<void> {
    if (await this.ui.$menuButton.isVisible()) {
      await this.ui.$menuButton.click();
    } else {
      await this.ui.$sidebar.hover();
    }
    await this.ui.$sidebarMenu(menuName).click();
    pageHeading = pageHeading ? pageHeading : menuName;
    await expect(this.ui.$level1Heading(pageHeading)).toBeVisible();
    await this.ui.$themeToggle.hover();
  }

  /**
   * Extracts all values from a specific table column from first 5 pages.
   * Sets pagination to 50 items per page and iterates through first 5 pages.
   *
   * @param headerName - Name of the column header to extract values from
   * @returns Array of all text content from the specified column
   */
  @step('Get table column values')
  async getColumnValues(headerName: string): Promise<string[]> {
    const tableBeforeColumnHeaders = this.ui.$tableBeforeColumnHeaders(headerName);
    await tableBeforeColumnHeaders.first().waitFor({ state: 'visible' }); // Ensure at least one is visible
    const columnNumber = (await tableBeforeColumnHeaders.count()) + 1;
    await this.ui.$comboboxSelect(1).selectOption({ value: '50' });
    const columnValues: string[] = [];
    let counter = 5;
    while (counter > 1) {
      const tableColumn = this.ui.$tableColumn(columnNumber);
      await tableColumn.first().waitFor({ state: 'visible' });
      columnValues.push(...(await tableColumn.allTextContents()));
      if (await this.ui.$nextPageNavButton.isDisabled()) {
        break;
      }
      await this.ui.$nextPageNavButton.click();
      counter--;
    }
    return columnValues;
  }

  /**
   * Adds a handler for feature spotlight popups that appear during navigation.
   * Automatically dismisses the popup by clicking 'Got it!' button when it appears.
   */
  async addPopupHandler(): Promise<void> {
    await this.page.addLocatorHandler(
      this.ui.$featureSpotlightPopup,
      async () => {
        await this.ui.$featureSpotlightPopupGotItButton.click();
        await expect(this.ui.$featureSpotlightPopup).not.toBeVisible();
      },
      { noWaitAfter: true }
    );
  }
}
