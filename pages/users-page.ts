import type { Locator, Page } from '@playwright/test';
import { expect, step } from '../fixtures/base';
import type { TestUser, UserData } from '../test-data/test-users';
import { BasePage } from './base-page';
import { getRandomValue } from '../utils/helper';

/**
 * Page object for the RoleVault users management page.
 * Provides methods for user creation, deletion, filtering, and searching.
 */
export class UsersPage extends BasePage {
  readonly $addNewUser: Locator;
  readonly $userName: Locator;
  readonly $email: Locator;
  readonly $password: Locator;
  readonly role: Locator;
  readonly $createUser: Locator;
  readonly $userRow: (user: TestUser) => Locator;
  readonly $delete: (user: TestUser) => Locator;

  /**
   * Creates a new UsersPage instance.
   *
   * @param page - Playwright page instance to interact with
   */
  constructor(page: Page) {
    super(page);
    this.$addNewUser = this.page.getByRole('button', { name: 'Add New User' });
    this.$userName = this.page.locator('input[name="name"]');
    this.$email = this.page.locator('input[name="email"]');
    this.$password = this.page.locator('input[name="password"]');
    this.role = this.page.locator('select[name="role"]');
    this.$createUser = this.page.getByRole('button', { name: 'Create User' });
    this.$userRow = (user): Locator =>
      this.page.locator(`//tr[td[text()="${user.fullName}"] and td[text()="${user.emailAddress.toLowerCase()}"]
         and td/span[text()="${user.role.toLowerCase()}"]]`);
    this.$delete = (user): Locator => this.$userRow(user).getByRole('button', { name: 'Delete' });
    this.page.locator('button.nav-button:nth-of-type(2)');
  }

  /**
   * Creates a new user by filling the add user form.
   *
   * @param newUser - User data for the new user including name, email, and password
   */
  @step('Add new user')
  public async addNewUser(newUser: UserData): Promise<void> {
    await this.$addNewUser.click();
    await this.$userName.fill(newUser.fullName);
    await this.$email.fill(newUser.emailAddress);
    await this.$password.fill(newUser.password);
    await this.$createUser.click();
  }

  /**
   * Deletes a user from the users table with confirmation.
   *
   * @param newUser - User to delete from the system
   */
  public async deleteUser(newUser: TestUser): Promise<void> {
    await this.$delete(newUser).click();
    await expect(this.ui.$paragraph('Are you sure you want to delete this user?')).toBeVisible();
    await this.ui.$confirmPopup.click();
  }

  /**
   * Filters users by selecting a random role from the dropdown.
   *
   * @returns The selected role name that was used for filtering
   */
  @step('Filter users by role')
  public async filterUsersByRole(): Promise<string> {
    const roles = await this.ui.$comboboxSelect().getByRole('option', { selected: false }).allTextContents();
    const randomOption = getRandomValue(roles);
    await this.ui.$comboboxSelect().selectOption({ label: randomOption });
    return randomOption;
  }

  /**
   * Searches for users by name or email across first 5 pages.
   * Sets pagination to 50 items per page and collects all matching results.
   *
   * @param search - Search term to filter users by name or email
   * @returns Array of table row text content containing the search term
   */
  @step('Search users by name/email')
  public async searchUsersBy(search: string): Promise<string[]> {
    await this.ui.$comboboxSelect(1).selectOption({ value: '50' });
    await this.ui.$searchInput.fill(search);
    const tableValues: string[] = [];
    let counter = 5;
    while (counter > 0) {
      await expect(this.ui.$tableRow.filter({ hasNotText: search }).last()).not.toBeVisible();
      await expect(this.ui.$tableRow.filter({ hasText: search }).first()).toBeVisible();
      for (const locator of await this.ui.$tableRow.all()) {
        tableValues.push((await locator.textContent()) ?? '');
      }
      if (await this.ui.$nextPageNavButton.isDisabled()) {
        break;
      }
      await this.ui.$nextPageNavButton.click();
      counter--;
    }
    return tableValues;
  }
}
