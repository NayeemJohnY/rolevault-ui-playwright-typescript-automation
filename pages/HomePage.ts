import { Locator, Page } from "@playwright/test";

export class HomePage {

    readonly page: Page;
    readonly $emailAddress: Locator;
    readonly $password: Locator;
    readonly $login: Locator;

    constructor(page: Page) {
        this.page = page;
        this.$emailAddress = page.getByLabel('Email Address');
        this.$password = page.getByLabel('Password')
        this.$login = page.getByTestId('login-submit')
    }

    public async login(user): Promise<void> {
        await this.$emailAddress.fill(user.emailAddress);
        await this.$password.fill(user.password);
        await this.$login.click();
    }

}