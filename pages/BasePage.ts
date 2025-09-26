import { expect, Page } from '@playwright/test';
import { step } from '../fixtures/base';
import { CommonAssertions } from './common/assertions';
import { commonLocators } from './common/locators';

export abstract class BasePage {
    readonly page: Page;
    readonly ui: ReturnType<typeof commonLocators>;
    readonly assert: CommonAssertions;

    constructor(page: Page) {
        this.page = page;
        this.ui = commonLocators(page);
        this.assert = new CommonAssertions(page);
    }

    @step('Navigate to Menu from Sidebar')
    async navigateToMenu(menuName: string, pageHeading?: string) {
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

    @step('Get Table Column Values')
    async getColumnValues(headerName: string) {
        const tableBeforeColumnHeaders = this.ui.$tableBeforeColumnHeaders(headerName);
        await tableBeforeColumnHeaders.first().waitFor({ state: 'visible' }); // Ensure at least one is visible
        const columnNumber = await tableBeforeColumnHeaders.count() + 1;
        await this.ui.$comboboxSelect(1).selectOption({ value: '50' })
        let columnValues: string[] = []
        while (true) {
            const tableColumn = this.ui.$tableColumn(columnNumber);
            await tableColumn.first().waitFor({ state: 'visible' });
            columnValues.push(...await tableColumn.allTextContents())
            if (await this.ui.$nextPageNavButton.isDisabled()) {
                break;
            }
            await this.ui.$nextPageNavButton.click();
        }
        return columnValues;
    }
}

