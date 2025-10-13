/**
 * P0 (Critical) File Upload Tests for RoleVault application.
 * Tests core file upload functionality with different user roles.
 * Test Plan Reference: test-plans/file-upload-test-plan.md
 */

import { expect, test } from '../../fixtures/base';
import { createFileWithSize, cleanupTestFiles } from '../../utils/file-utils';

test.describe('File Upload - P0 Critical Tests', { tag: '@critical' }, () => {
  test.afterEach(async () => {
    // Cleanup test files after each test to avoid file conflicts
    cleanupTestFiles();
  });

  /**
   * Test ID: 1.1
   * Test: Upload Single File Within Size Limit (Admin)
   * Priority: P0 (Critical)
   */
  test('Should allow Administrator to upload single file within size limit', async ({ session }) => {
    const app = await session({ role: 'Administrator' });
    const testFile = createFileWithSize('test-document.pdf', 5);

    await test.step('Navigate to Upload File page', async () => {
      await app.uploadPage.navigateToUploadPage();
    });

    await test.step('Verify Upload File page is displayed', async () => {
      await app.uploadPage.assertIsVisible();
    });

    await test.step('Upload a 5MB PDF file', async () => {
      await app.uploadPage.uploadFileByClick(testFile);
    });

    await test.step('Verify file is queued for upload', async () => {
      await app.uploadPage.verifyFilesQueued();
    });
  });

  /**
   * Test ID: 1.2
   * Test: Upload File Using Drag and Drop (Admin)
   * Priority: P0 (Critical)
   */
  test('Should allow Administrator to upload file using drag and drop', async ({ session }) => {
    const app = await session({ role: 'Administrator' });
    const testFile = createFileWithSize('drag-drop-test.pdf', 3);

    await test.step('Navigate to Upload File page', async () => {
      await app.uploadPage.navigateToUploadPage();
    });

    await test.step('Upload file using drag and drop', async () => {
      await app.uploadPage.uploadFileByDragDrop(testFile);
    });

    await test.step('Verify file is queued for upload', async () => {
      await app.uploadPage.verifyFilesQueued();
    });
  });

  /**
   * Test ID: 2.1
   * Test: Attempt to Upload File Exceeding Size Limit
   * Priority: P0 (Critical)
   */
  test('Should reject file upload exceeding 10MB size limit', async ({ session }) => {
    const app = await session({ role: 'Administrator' });
    const oversizedFile = createFileWithSize('oversized-file.pdf', 11);

    await test.step('Navigate to Upload File page', async () => {
      await app.uploadPage.navigateToUploadPage();
    });

    await test.step('Attempt to upload 11MB file', async () => {
      await app.uploadPage.uploadFileByClick(oversizedFile);
    });

    await test.step('Verify error message for oversized file', async () => {
      // Check for error message - adjust text based on actual error message
      await expect(app.page.getByText(/exceeds maximum size|too large|10MB/i)).toBeVisible({ timeout: 5000 });
    });

    await test.step('Verify upload zone remains functional', async () => {
      await app.uploadPage.assertIsVisible();
    });
  });

  /**
   * Test ID: 4.1
   * Test: Upload File as Administrator
   * Priority: P0 (Critical)
   */
  test('Should allow Administrator to access and use upload functionality', async ({ session }) => {
    const app = await session({ role: 'Administrator' });
    const testFile = createFileWithSize('admin-upload-test.txt', 1);

    await test.step('Verify Administrator can access Upload File menu', async () => {
      await expect(app.uploadPage.ui.$sidebarMenu('Upload File')).toBeVisible();
    });

    await test.step('Navigate to Upload File page', async () => {
      await app.uploadPage.navigateToUploadPage();
    });

    await test.step('Verify Administrator has full access to upload interface', async () => {
      await app.uploadPage.assertIsVisible();
      await expect(app.uploadPage.$chooseFileButton).toBeVisible();
      await expect(app.uploadPage.$uploadZone).toBeEnabled();
    });

    await test.step('Upload file successfully as Administrator', async () => {
      await app.uploadPage.uploadFileByClick(testFile);
      await app.uploadPage.verifyFilesQueued();
    });
  });

  /**
   * Test ID: 4.2
   * Test: Upload File as Contributor
   * Priority: P0 (Critical)
   */
  test('Should allow Contributor to access and use upload functionality', async ({ session }) => {
    const app = await session({ role: 'Contributor' });
    const testFile = createFileWithSize('contributor-upload-test.docx', 2);

    await test.step('Verify Contributor can access Upload File menu', async () => {
      await expect(app.uploadPage.ui.$sidebarMenu('Upload File')).toBeVisible();
    });

    await test.step('Navigate to Upload File page', async () => {
      await app.uploadPage.navigateToUploadPage();
    });

    await test.step('Verify Contributor has access to upload interface', async () => {
      await app.uploadPage.assertIsVisible();
      await expect(app.uploadPage.$chooseFileButton).toBeVisible();
    });

    await test.step('Upload file successfully as Contributor', async () => {
      await app.uploadPage.uploadFileByClick(testFile);
      await app.uploadPage.verifyFilesQueued();
    });
  });

  /**
   * Test ID: 4.3
   * Test: Attempt Upload as Viewer (Should Fail or Be Restricted)
   * Priority: P0 (Critical)
   */
  test('Should restrict Viewer from uploading files', async ({ session }) => {
    const app = await session({ role: 'Viewer' });

    await test.step('Verify Upload File menu is NOT visible for Viewer role', async () => {
      // Viewer should not see the Upload File menu option
      await expect(app.uploadPage.ui.$sidebarMenu('Upload File')).not.toBeVisible();
    });

    await test.step('Verify direct URL access is blocked or restricted', async () => {
      // Try to access upload page directly
      await app.page.goto('/upload');

      // Should either redirect away from upload page OR show permission error
      const isStillOnUploadPage = app.page.url().includes('/upload');

      if (isStillOnUploadPage) {
        // If still on upload page, must show permission error
        await expect(
          app.page.getByText(/permission|not allowed|access denied|don't have permission/i).first()
        ).toBeVisible({
          timeout: 5000,
        });
      } else {
        // Redirected away from upload page (preferred behavior)
        await expect(app.page).not.toHaveURL(/upload/);
      }
    });
  });

  /**
   * Test ID: 9.1
   * Test: Upload File Without Authentication
   * Priority: P0 (Critical)
   */
  test('Should prevent unauthenticated users from accessing upload functionality', async ({ app }) => {
    await test.step('Attempt to access upload page URL directly without login', async () => {
      await app.page.goto('/upload');
    });

    await test.step('Verify user is redirected to login page', async () => {
      await expect(app.page).toHaveURL(/login/);
      await expect(app.homePage.$login).toBeVisible();
    });

    await test.step('Verify upload functionality is not accessible', async () => {
      await expect(app.page).not.toHaveURL(/upload/);
    });
  });
});
