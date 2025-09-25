import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { UserData } from "../test-data/test-users";
import { step } from "../fixtures/base";

export class HomePage extends BasePage {
    readonly $emailAddress: Locator;
    readonly $password: Locator;
    readonly $login: Locator;
    readonly $registerTab: Locator;
    readonly $fullName: Locator;
    readonly $confirmPassword: Locator;
    readonly $createAccount: Locator;
    readonly $showTestAccounts: Locator;
    readonly $testAccounts: Locator;


    constructor(page: Page) {
        super(page);
        this.$emailAddress = page.getByLabel('Email Address');
        this.$password = page.getByLabel('Password', { exact: true });
        this.$login = page.getByTestId('login-submit');
        this.$registerTab = page.getByTestId('register-tab');
        this.$fullName = page.getByLabel('Full Name');
        this.$confirmPassword = page.getByRole('textbox', { name: 'Confirm Password' });
        this.$createAccount = page.getByTestId('register-submit');
        this.$showTestAccounts = page.getByRole('button', { name: 'Show Test Accounts' });
        this.$testAccounts = page.locator('[data-testid^="test-account"]');
    }

    public async login(user: UserData): Promise<void> {
        await this.$emailAddress.fill(user.emailAddress);
        await this.$password.fill(user.password);
        await this.$login.click();
    }

    public async loginUsingTestAccount(): Promise<void> {
        const testAccount = await this.getRandomTestAccountLocator();
        await testAccount.click();
        await this.$login.click();
    }


    @step('Fill User Registration Form and Create Account')
    public async register(registerUser: UserData): Promise<void> {
        await this.$registerTab.click();
        await this.$fullName.fill(registerUser.fullName)
        await this.$emailAddress.fill(registerUser.emailAddress);
        await this.$password.fill(registerUser.password);
        await this.$confirmPassword.fill(registerUser.password);
        await this.$createAccount.click();
    }

    public async getRandomTestAccountLocator(): Promise<Locator> {
        await this.$showTestAccounts.click();
        const testAccounts = await this.$testAccounts.all();
        const randomTestAccount = testAccounts[Math.floor(Math.random() * testAccounts.length)];
        return randomTestAccount;
    }

    public async getRandomTestAccountEmail(): Promise<string> {
        const $testAccount = await this.getRandomTestAccountLocator();
        const innerTexts = await $testAccount.allInnerTexts();
        const [, email] = innerTexts[0].split("\n");
        return email;
    }

}