# File Upload P0 Tests - Bug Fixes Summary

## Overview
This document summarizes all the fixes applied to resolve test failures in the P0 (Critical) file upload test suite.

## Test Execution Summary

**Initial Run**: 5 failures out of 7 tests  
**Final Run**: All 7 tests passing ✅

## Issues Fixed

### Issue 1: Strict Mode Violation - Multiple Elements Matching
**Error**: `getByText(/upload/i)` matched 4 elements causing strict mode violation

**Root Cause**: The regex `/upload/i` was too broad and matched:
- Sidebar menu "Upload File"
- Page heading "Upload File"  
- "Files to Upload (1)" heading
- "Upload All" button

**Solution**:
- Added specific locators to `UploadPage` class:
  - `$uploadAllButton` - for the "Upload All" button
  - `$filesToUploadHeading` - for the files queue heading
- Created `verifyFilesQueued()` method to check for file selection success
- Updated all test assertions to use specific locators instead of generic text search

**Files Modified**:
- `pages/upload-page.ts` - Added new locators and validation methods
- `tests/critical/file-upload-p0.spec.ts` - Updated assertions in tests 1.1, 1.2, 4.1, 4.2

### Issue 2: File Cleanup Race Condition
**Error**: `ENOENT: no such file or directory, unlink` when cleaning up test files

**Root Cause**: 
- Tests running in parallel (4 workers)
- `afterAll` hook trying to delete files that another test already deleted
- No error handling in cleanup function

**Solution**:
- Changed cleanup from `test.afterAll()` to `test.afterEach()`
- Added try-catch error handling in `cleanupTestFiles()` function
- Gracefully ignore files that don't exist during cleanup
- Tests should run with `--workers=1` for file upload tests to avoid conflicts

**Files Modified**:
- `utils/file-utils.ts` - Added error handling to `cleanupTestFiles()`
- `tests/critical/file-upload-p0.spec.ts` - Changed to `afterEach` hook

### Issue 3: Viewer Role Test - Incorrect Assumptions
**Error**: Test expected Upload File menu to be visible for Viewer, but it was hidden

**Root Cause**:
- Initial test assumed Viewer role would see the Upload File menu
- Actual behavior: Upload File menu is correctly hidden from Viewer role
- Test logic was too complex with nested conditionals

**Solution**:
- Simplified test to verify Upload File menu is NOT visible
- Test direct URL access to `/upload` 
- Verify either redirect OR permission error is shown
- Application correctly shows "Access Denied" page when Viewer tries to access /upload

**Files Modified**:
- `tests/critical/file-upload-p0.spec.ts` - Complete rewrite of Viewer restriction test

### Issue 4: Another Strict Mode Violation in Viewer Test
**Error**: `getByText(/permission|not allowed|access denied|don't have permission/i)` matched 2 elements

**Root Cause**:
- "Access Denied" page has both an `<h2>` heading and a `<p>` paragraph with matching text
- Both elements matched the regex pattern

**Solution**:
- Added `.first()` to select only the first matching element
- This is acceptable since we just need to verify the error message is displayed

**Files Modified**:
- `tests/critical/file-upload-p0.spec.ts` - Added `.first()` to permission error check

## Code Changes Summary

### New Methods Added to `UploadPage`:
```typescript
async verifyFilesQueued(): Promise<void>
async verifyUploadSuccess(successMessage?: string): Promise<void>
```

### New Locators Added to `UploadPage`:
```typescript
readonly $uploadAllButton: Locator;
readonly $filesToUploadHeading: Locator;
```

### Enhanced Error Handling in `file-utils.ts`:
```typescript
// Added try-catch in cleanupTestFiles()
try {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
} catch (error) {
  console.warn(`Could not delete file ${filePath}:`, error);
}
```

## Test Execution Recommendations

### For Local Development:
```bash
# Run with single worker to avoid file conflicts
npx playwright test tests/critical/file-upload-p0.spec.ts --workers=1
```

### For CI/CD:
```bash
# Run with retries for flaky network scenarios
npx playwright test tests/critical/file-upload-p0.spec.ts --workers=1 --retries=2
```

### For Specific Browser:
```bash
npx playwright test tests/critical/file-upload-p0.spec.ts --project "Google Chrome" --workers=1
```

## Test Results After Fixes

| Test ID | Test Name                      | Status |
| ------- | ------------------------------ | ------ |
| 1.1     | Upload Single File (Admin)     | ✅ PASS |
| 1.2     | Upload via Drag & Drop (Admin) | ✅ PASS |
| 2.1     | Reject Oversized File          | ✅ PASS |
| 4.1     | Administrator Access           | ✅ PASS |
| 4.2     | Contributor Access             | ✅ PASS |
| 4.3     | Viewer Restrictions            | ✅ PASS |
| 9.1     | No Unauthenticated Access      | ✅ PASS |

**Total**: 7/7 tests passing (100%)

## Lessons Learned

1. **Be Specific with Locators**: Avoid broad regex patterns that can match multiple elements
2. **Handle Parallel Execution**: Consider file cleanup strategies when tests run in parallel
3. **Don't Assume Application Behavior**: Test what the application actually does, not what you think it should do
4. **Use Strict Mode to Advantage**: Playwright's strict mode catches ambiguous selectors early

## Future Improvements

1. **Unique File Names**: Generate unique filenames with timestamps to avoid conflicts
2. **Dedicated Test Fixtures**: Create beforeEach fixtures for file generation
3. **API-Level Cleanup**: Use API calls to clean up uploaded files from the database
4. **Isolated File Directories**: Each test worker gets its own test-data directory

## Verification

All tests now pass successfully when run with:
```bash
npx playwright test tests/critical/file-upload-p0.spec.ts --project Chromium --workers 1
```

**Final Status**: ✅ All P0 Critical Tests Fixed and Passing
