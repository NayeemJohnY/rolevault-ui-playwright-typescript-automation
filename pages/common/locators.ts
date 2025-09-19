import { Page } from "@playwright/test";


export const commonLocators = (page: Page) => ({
    $formError: page.getByTestId('form-error'),
    $toastMessage: (message?: string | RegExp) => {
        const locator = page.getByRole('status');
        return message ? locator.getByText(message).first() : locator.first();
    }
});