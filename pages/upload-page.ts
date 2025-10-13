import type { Locator, Page } from '@playwright/test';
import { expect, step } from '../fixtures/base';
import { BasePage } from './base-page';

/**
 * Page object for the RoleVault file upload page.
 * Provides methods for file upload operations and validation.
 */
export class UploadPage extends BasePage {
  readonly $uploadZone: Locator;
  readonly $chooseFileButton: Locator;
  readonly $fileInput: Locator;
  readonly $uploadPageHeading: Locator;
  readonly $uploadInstructions: Locator;
  readonly $maxFileSizeText: Locator;
  readonly $uploadAllButton: Locator;
  readonly $filesToUploadHeading: Locator;

  /**
   * Creates a new UploadPage instance.
   *
   * @param page - Playwright page instance to interact with
   */
  constructor(page: Page) {
    super(page);
    this.$uploadZone = page.getByTestId('file-upload-zone');
    this.$chooseFileButton = page.getByRole('button', { name: 'Choose File' });
    this.$fileInput = page.locator('input[type="file"]');
    this.$uploadPageHeading = page.getByRole('heading', { name: 'Upload File', level: 1 });
    this.$uploadInstructions = page.getByText('Drag and drop files here, or click to select files');
    this.$maxFileSizeText = page.getByText('Maximum file size: 10MB');
    this.$uploadAllButton = page.getByTestId('upload-all-btn');
    this.$filesToUploadHeading = page.getByRole('heading', { name: /Files to Upload/ });
  }

  /**
   * Verifies that the upload page is properly loaded and visible.
   * Checks URL, heading, and upload zone visibility.
   */
  @step('Verify upload page is visible')
  async assertIsVisible(): Promise<void> {
    await expect(this.page).toHaveURL(/upload/);
    await expect(this.$uploadPageHeading).toBeVisible();
    await expect(this.$uploadZone).toBeVisible();
    await expect(this.$uploadInstructions).toBeVisible();
    await expect(this.$maxFileSizeText).toBeVisible();
  }

  /**
   * Uploads a file by clicking the choose file button and selecting the file.
   *
   * @param filePath - Path to the file to upload (can be absolute or relative)
   */
  @step('Upload file via click')
  async uploadFileByClick(filePath: string): Promise<void> {
    await this.$fileInput.setInputFiles(filePath);
  }

  /**
   * Uploads a file using drag and drop simulation.
   *
   * @param filePath - Path to the file to upload
   */
  @step('Upload file via drag and drop')
  async uploadFileByDragDrop(filePath: string): Promise<void> {
    // Simulate drag and drop by setting files on the input element
    await this.$fileInput.setInputFiles(filePath);
  }

  /**
   * Uploads multiple files at once.
   *
   * @param filePaths - Array of file paths to upload
   */
  @step('Upload multiple files')
  async uploadMultipleFiles(filePaths: string[]): Promise<void> {
    await this.$fileInput.setInputFiles(filePaths);
  }

  /**
   * Verifies that an error message is displayed for file upload.
   *
   * @param errorMessage - Expected error message text
   */
  @step('Verify upload error message')
  async verifyUploadError(errorMessage: string): Promise<void> {
    await expect(this.page.getByText(errorMessage)).toBeVisible();
  }

  /**
   * Verifies that a success message is displayed after file upload.
   *
   * @param successMessage - Expected success message text (optional)
   */
  @step('Verify upload success')
  async verifyUploadSuccess(successMessage?: string): Promise<void> {
    if (successMessage) {
      await expect(this.page.getByText(successMessage)).toBeVisible();
    } else {
      // Check for upload button or files to upload heading which appears after file selection
      await expect(this.$uploadAllButton).toBeVisible({ timeout: 5000 });
    }
  }

  /**
   * Verifies that files are queued for upload.
   */
  @step('Verify files are queued')
  async verifyFilesQueued(): Promise<void> {
    await expect(this.$filesToUploadHeading).toBeVisible();
    await expect(this.$uploadAllButton).toBeVisible();
  }

  /**
   * Checks if the upload file menu option is visible in the sidebar.
   *
   * @returns True if upload menu is visible, false otherwise
   */
  async isUploadMenuVisible(): Promise<boolean> {
    return await this.ui.$sidebarMenu('Upload File').isVisible();
  }

  /**
   * Navigates to the upload page from any page.
   */
  @step('Navigate to Upload page')
  async navigateToUploadPage(): Promise<void> {
    await this.navigateToMenu('Upload File');
    await this.assertIsVisible();
  }
}
