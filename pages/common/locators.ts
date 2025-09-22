import { Page } from "@playwright/test";


export const commonLocators = (page: Page) => ({
    $formError: page.getByTestId('form-error'),
    $toastMessage: (message?: string | RegExp) => {
        const locator = page.getByRole('status');
        return message ? locator.getByText(message).first() : locator.first();
    },
    $level1Heading: (heading: string) => page.getByRole('heading', { name: heading, level: 1 }),
    $sidebar: page.getByTestId('sidebar'),
    $sidebarMenu: (menuName: string) => page.getByTestId('sidebar').getByRole('link', { name: menuName }),
});