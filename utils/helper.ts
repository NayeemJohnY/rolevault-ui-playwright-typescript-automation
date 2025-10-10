/**
 * Utility helper functions for test automation.
 * Provides common functionality for random selection and string manipulation.
 */

import type { Page, TestInfo } from '@playwright/test';

/**
 * Selects a random element from an array.
 *
 * @param iterable - Array of elements to choose from
 * @returns A randomly selected element from the array
 * @throws Error if the array is empty or not an array
 *
 * @example
 * ```typescript
 * const colors = ['red', 'blue', 'green'];
 * const randomColor = getRandomValue(colors); // Returns 'red', 'blue', or 'green'
 * ```
 */
export function getRandomValue<T>(iterable: T[]): T {
  if (!Array.isArray(iterable) || iterable.length === 0) {
    throw Error('iterable is Empty');
  }
  return iterable[Math.floor(Math.random() * iterable.length)];
}

/**
 * Generates a random substring from the input string for search testing.
 * Ensures minimum length of 4 characters for meaningful search queries.
 *
 * @param str - The source string to extract a substring from
 * @returns A random substring in lowercase, minimum 4 characters or the full string if shorter
 *
 * @example
 * ```typescript
 * const searchTerm = getSearchString('John Doe Administrator');
 * console.log(searchTerm); // Might return 'john', 'doe', 'admin', etc.
 * ```
 */
export function getSearchString(str: string): string {
  const lowerStr = str.toLowerCase();
  if (lowerStr.length <= 4) {
    return lowerStr;
  }
  const start = Math.floor(Math.random() * (lowerStr.length - 4));
  const end = Math.floor(Math.random() * (lowerStr.length - start)) + 4;
  return lowerStr.slice(start, start + end);
}

export function getArg(str: string): string | undefined {
  return process.argv.find((arg) => arg.includes(str));
}

export async function captureScreenshot(testInfo: TestInfo, page: Page, screenshotName: string): Promise<void> {
  try {
    const screenshot = await page.screenshot({
      path: `screenshots/${screenshotName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`,
      fullPage: true,
      scale: 'css',
    });
    await testInfo.attach(screenshotName, {
      body: screenshot,
      contentType: 'image/png',
    });
  } catch (error) {
    console.warn(`Could not capture screenshot with name ${screenshotName}:`, error);
  }
}
