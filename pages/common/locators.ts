import { Page } from "@playwright/test";


export const commonLocators = {
    $formError: (page: Page) => page.getByTestId('form-error'),
    $toastMessage: (page: Page, message?: string | RegExp) => {
        const locator = page.getByRole('status');
        return message ? locator.getByText(message).first() : locator.first();
    }
}