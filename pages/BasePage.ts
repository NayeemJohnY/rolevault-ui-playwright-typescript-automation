import { expect, Page } from '@playwright/test';
import { commonLocators } from './common/locators';
import { CommonAssertions } from './common/assertions';

export abstract class BasePage {
    readonly page: Page;
    readonly ui: ReturnType<typeof commonLocators>;
    readonly assert: CommonAssertions;

    constructor(page: Page) {
        this.page = page;
        this.ui = commonLocators(page);
        this.assert = new CommonAssertions(page);
    }

    async navigateToMenu(menuName: string, pageHeading?: string) {
        await this.ui.$sidebarMenu(menuName).click();
        pageHeading = pageHeading ? pageHeading : menuName;
        await expect(this.ui.$level1Heading(pageHeading)).toBeVisible();
    }
}

