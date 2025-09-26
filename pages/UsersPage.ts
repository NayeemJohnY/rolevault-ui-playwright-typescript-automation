import { Locator, Page } from "@playwright/test";
import { expect, step } from '../fixtures/base';
import { TestUser, UserData } from "../test-data/test-users";
import { BasePage } from "./BasePage";
import { getRandomValue } from "../utils/helper";

export class UsersPage extends BasePage {

  readonly $addNewUser: Locator;
  readonly $userName: Locator
  readonly $email: Locator;
  readonly $password: Locator;
  readonly role: Locator;
  readonly $createUser: Locator;
  readonly $userRow: (user: TestUser) => Locator;
  readonly $delete: (user: TestUser) => Locator;


  constructor(page: Page) {
    super(page);
    this.$addNewUser = this.page.getByRole('button', { name: 'Add New User' });
    this.$userName = this.page.locator('input[name="name"]');
    this.$email = this.page.locator('input[name="email"]');
    this.$password = this.page.locator('input[name="password"]');
    this.role = this.page.locator('select[name="role"]');
    this.$createUser = this.page.getByRole('button', { name: 'Create User' });
    this.$userRow = (user) =>
      this.page.locator(`//tr[td[text()="${user.fullName}"] and td[text()="${user.emailAddress.toLowerCase()}"] and td/span[text()="${user.role.toLowerCase()}"]]`);
    this.$delete = (user) => this.$userRow(user).getByRole('button', { name: "Delete" });
    this.page.locator('button.nav-button:nth-of-type(2)')
  }

  @step('Add new user')
  public async addNewUser(newUser: UserData) {
    await this.$addNewUser.click();
    await this.$userName.fill(newUser.fullName);
    await this.$email.fill(newUser.emailAddress);
    await this.$password.fill(newUser.password);
    await this.$createUser.click();
  }

  public async deleteUser(newUser: TestUser) {
    await this.$delete(newUser).click();
    await expect(this.ui.$paragraph('Are you sure you want to delete this user?')).toBeVisible();
    await this.ui.$confirmPopup.click();
  }

  @step('Filter users by role')
  public async filterUsersByRole(): Promise<string> {
    const roles = await this.ui.$comboboxSelect().getByRole('option', { selected: false }).allTextContents();
    const randomOption = getRandomValue(roles);
    await this.ui.$comboboxSelect().selectOption({ label: randomOption });
    return randomOption;
  }

  @step('Search users by name/email')
  public async searchUsersBy(search: string): Promise<string[]> {
    await this.ui.$comboboxSelect(1).selectOption({ value: '50' })
    await this.ui.$searchInput.fill(search);
    await this.ui.$tableRow.first().waitFor({ state: "visible" });
    let tableValues: string[] = []
    while (true) {
      const rowsNotMatch = this.ui.$tableRow.filter({ hasNotText: search });
      await expect(rowsNotMatch).toHaveCount(0);
      (await this.ui.$tableRow.all()).forEach(async (locator) => {
        tableValues.push((await locator.textContent()) ?? "");
      })
      if (await this.ui.$nextPageNavButton.isDisabled()) {
        break;
      }
      await this.ui.$nextPageNavButton.click();
      await this.ui.$tableRow.first().waitFor({ state: "visible" });
    }
    return tableValues;
  }


}   
