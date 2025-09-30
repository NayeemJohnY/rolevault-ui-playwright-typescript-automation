import { type Page } from '@playwright/test';
import { CommonAssertions } from './common/assertions';
import { commonLocators } from './common/locators';
import { DashboardPage } from './dashboard-page';
import { HomePage } from './home-page';
import { UsersPage } from './users-page';

export class App {
  constructor(public readonly page: Page) {}

  private _homePage?: HomePage;
  private _dashboardPage?: DashboardPage;
  private _usersPage?: UsersPage;
  private _assert?: CommonAssertions;
  private _ui?: ReturnType<typeof commonLocators>;

  get homePage(): HomePage {
    return (this._homePage ??= new HomePage(this.page));
  }

  get dashboardPage(): DashboardPage {
    return (this._dashboardPage ??= new DashboardPage(this.page));
  }

  get usersPage(): UsersPage {
    return (this._usersPage ??= new UsersPage(this.page));
  }

  get assert(): CommonAssertions {
    return (this._assert ??= new CommonAssertions(this.page));
  }

  get ui(): ReturnType<typeof commonLocators> {
    return (this._ui ??= commonLocators(this.page));
  }
}
