import { Page } from '@playwright/test';
import { expect } from '../../fixtures/base';
import { commonLocators } from './locators';


export class CommonAssertions {

    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async expectToastMessage(message: string): Promise<void> {
        await expect(commonLocators(this.page).$toastMessage(message)).toBeVisible();
    }

    async expectFormError(message: string): Promise<void> {
        await expect(commonLocators(this.page).$formError).toHaveText(message);
    }
}