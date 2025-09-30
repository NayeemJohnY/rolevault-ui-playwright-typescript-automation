import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base-page';
import type { UserData } from '../test-data/test-users';
import { step } from '../fixtures/base';
import { getRandomValue } from '../utils/helper';

/**
 * Page object for the RoleVault home page (login/registration page).
 * Provides methods for user authentication and account creation.
 */
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

  /**
   * Creates a new HomePage instance.
   *
   * @param page - Playwright page instance to interact with
   */
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

  /**
   * Logs in a user with provided credentials.
   *
   * @param user - User data containing email and password
   */
  public async login(user: UserData): Promise<void> {
    await this.$emailAddress.fill(user.emailAddress);
    await this.$password.fill(user.password);
    await this.$login.click();
  }

  /**
   * Logs in using a randomly selected test account from the UI.
   * Useful for quick testing without hardcoded credentials.
   */
  public async loginUsingTestAccount(): Promise<void> {
    const testAccount = await this.getRandomTestAccountLocator();
    await testAccount.click();
    await this.$login.click();
  }

  /**
   * Registers a new user account by filling the registration form.
   *
   * @param registerUser - User data for registration including full name, email, and password
   */
  @step('Fill user registration form and create account')
  public async register(registerUser: UserData): Promise<void> {
    await this.$registerTab.click();
    await this.$fullName.fill(registerUser.fullName);
    await this.$emailAddress.fill(registerUser.emailAddress);
    await this.$password.fill(registerUser.password);
    await this.$confirmPassword.fill(registerUser.password);
    await this.$createAccount.click();
  }

  /**
   * Gets a randomly selected test account locator from the UI.
   * Shows test accounts first, then selects one randomly.
   *
   * @returns Locator for a random test account element
   */
  public async getRandomTestAccountLocator(): Promise<Locator> {
    await this.$showTestAccounts.click();
    const testAccounts = await this.$testAccounts.all();
    const randomTestAccount = getRandomValue(testAccounts);
    return randomTestAccount;
  }

  /**
   * Extracts email address from a randomly selected test account.
   * Useful for testing scenarios that require existing email addresses.
   *
   * @returns Email address string from a random test account
   */
  public async getRandomTestAccountEmail(): Promise<string> {
    const $testAccount = await this.getRandomTestAccountLocator();
    const innerTexts = await $testAccount.allInnerTexts();
    const [, email] = innerTexts[0].split('\n');
    return email;
  }
}
