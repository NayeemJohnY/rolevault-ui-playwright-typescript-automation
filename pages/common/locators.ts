import type { Locator, Page } from "@playwright/test";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const commonLocators = (page: Page) => ({
    $themeToggle: page.getByTestId('theme-toggle'),
    $formError: page.getByTestId('form-error'),
    $toastMessage: (message?: string | RegExp): Locator => {
        const locator = page.getByRole('status');
        return message ? locator.getByText(message).first() : locator.first();
    },
    $level1Heading: (heading: string): Locator => page.getByRole('heading', { name: heading, level: 1 }),
    $menuButton: page.getByTestId('menu-button'),
    $sidebar: page.getByTestId('sidebar'),
    $sidebarMenu: (menuName: string): Locator => page.getByTestId('sidebar').getByRole('link', { name: menuName }),
    $confirmPopup: page.getByRole('button', { name: 'Confirm' }),
    $paragraph: (text: string): Locator => page.getByRole('paragraph').filter({ hasText: text }),
    $comboboxSelect: (index: number = 0): Locator => page.getByRole('combobox').nth(index),
    $tableBeforeColumnHeaders: (headerName: string): Locator => page.locator(`xpath=//table//th[text()="${headerName}"]/preceding-sibling::th`),
    $tableRow: page.locator('tbody').getByRole('row'),
    $tableColumn: (index: number = 0): Locator => page.locator(`//table//td[${index}]`),
    $nextPageNavButton: page.locator('//button[contains(@class, "nav-button")][2]'),
    $searchInput: page.locator('input[class*=search-input]'),
});