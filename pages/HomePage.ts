import { Locator, Page } from "@playwright/test";

export class HomePage {

    readonly page: Page;
    readonly $emailAddress: Locator;
    readonly $password: Locator;
    readonly $login: Locator;
    readonly $registerTab: Locator;
    readonly $fullName: Locator;
    readonly $confirmPassword: Locator;
    readonly $createAccount: Locator


    constructor(page: Page) {
        this.page = page;
        this.$emailAddress = page.getByLabel('Email Address');
        this.$password = page.getByLabel('Password', { exact: true });
        this.$login = page.getByTestId('login-submit');
        this.$registerTab = page.getByTestId('register-tab');
        this.$fullName = page.getByLabel('Full Name');
        this.$confirmPassword = page.getByRole('textbox', { name: 'Confirm Password' });
        this.$createAccount = page.getByTestId('register-submit');
    }

    public async login(user): Promise<void> {
        await this.$emailAddress.fill(user.emailAddress);
        await this.$password.fill(user.password);
        await this.$login.click();
    }

    public async register(registerUser): Promise<void> {
        await this.$registerTab.click();
        await this.$fullName.fill(registerUser.fullName)
        await this.$emailAddress.fill(registerUser.emailAddress);
        await this.$password.fill(registerUser.password);
        await this.$confirmPassword.fill(registerUser.password);
        await this.$createAccount.click();
    }

}