import { type Page } from '@playwright/test';
import { CommonAssertions } from './common/assertions';
import { commonLocators } from './common/locators';
import { DashboardPage } from './dashboard-page';
import { HomePage } from './home-page';
import { UploadPage } from './upload-page';
import { UsersPage } from './users-page';

/**
 * Main application class that provides access to all page objects and utilities.
 * Implements lazy initialization pattern for efficient resource usage.
 */
export class App {
  /**
   * Creates a new App instance.
   *
   * @param page - Playwright page instance to interact with
   */
  constructor(public readonly page: Page) {}

  private _homePage?: HomePage;
  private _dashboardPage?: DashboardPage;
  private _usersPage?: UsersPage;
  private _uploadPage?: UploadPage;
  private _assert?: CommonAssertions;
  private _ui?: ReturnType<typeof commonLocators>;

  /**
   * Gets the home page instance (login/registration page).
   * Creates instance on first access and caches it.
   */
  get homePage(): HomePage {
    return (this._homePage ??= new HomePage(this.page));
  }

  /**
   * Gets the dashboard page instance.
   * Creates instance on first access and caches it.
   */
  get dashboardPage(): DashboardPage {
    return (this._dashboardPage ??= new DashboardPage(this.page));
  }

  /**
   * Gets the users management page instance.
   * Creates instance on first access and caches it.
   */
  get usersPage(): UsersPage {
    return (this._usersPage ??= new UsersPage(this.page));
  }

  /**
   * Gets the file upload page instance.
   * Creates instance on first access and caches it.
   */
  get uploadPage(): UploadPage {
    return (this._uploadPage ??= new UploadPage(this.page));
  }

  /**
   * Gets the common assertions utility.
   * Creates instance on first access and caches it.
   */
  get assert(): CommonAssertions {
    return (this._assert ??= new CommonAssertions(this.page));
  }

  /**
   * Gets the common UI locators utility.
   * Creates instance on first access and caches it.
   */
  get ui(): ReturnType<typeof commonLocators> {
    return (this._ui ??= commonLocators(this.page));
  }
}
