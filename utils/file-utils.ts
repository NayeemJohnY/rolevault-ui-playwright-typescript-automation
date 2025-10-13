/**
 * File generation utilities for test automation.
 * Provides functions to create test files with specific sizes and content.
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Directory where test files are stored.
 */
const TEST_FILES_DIR = path.join(process.cwd(), 'test-data', 'files');

/**
 * Ensures the test files directory exists.
 */
function ensureTestFilesDir(): void {
  if (!fs.existsSync(TEST_FILES_DIR)) {
    fs.mkdirSync(TEST_FILES_DIR, { recursive: true });
  }
}

/**
 * Creates a file with specified size in megabytes.
 *
 * @param fileName - Name of the file to create
 * @param sizeInMB - Size of the file in megabytes
 * @returns Absolute path to the created file
 *
 * @example
 * ```typescript
 * const filePath = createFileWithSize('test.pdf', 5);
 * console.log(filePath); // Returns full path to created 5MB file
 * ```
 */
export function createFileWithSize(fileName: string, sizeInMB: number): string {
  ensureTestFilesDir();
  const filePath = path.join(TEST_FILES_DIR, fileName);

  // Create buffer with specified size
  const sizeInBytes = sizeInMB * 1024 * 1024;
  const buffer = Buffer.alloc(sizeInBytes, 'A');

  fs.writeFileSync(filePath, buffer);
  return filePath;
}

/**
 * Creates a small text file with specified content.
 *
 * @param fileName - Name of the file to create
 * @param content - Content to write to the file
 * @returns Absolute path to the created file
 *
 * @example
 * ```typescript
 * const filePath = createTextFile('sample.txt', 'Hello World');
 * ```
 */
export function createTextFile(fileName: string, content: string): string {
  ensureTestFilesDir();
  const filePath = path.join(TEST_FILES_DIR, fileName);
  fs.writeFileSync(filePath, content);
  return filePath;
}

/**
 * Creates an empty file (0 bytes).
 *
 * @param fileName - Name of the empty file to create
 * @returns Absolute path to the created file
 */
export function createEmptyFile(fileName: string): string {
  ensureTestFilesDir();
  const filePath = path.join(TEST_FILES_DIR, fileName);
  fs.writeFileSync(filePath, '');
  return filePath;
}

/**
 * Creates a file with special characters in the name.
 *
 * @param baseFileName - Base name without special characters
 * @param extension - File extension
 * @returns Object containing the file path and sanitized filename
 */
export function createFileWithSpecialCharsName(
  baseFileName: string,
  extension: string
): { filePath: string; fileName: string } {
  ensureTestFilesDir();
  const fileName = `${baseFileName}@#$%^&().${extension}`;
  const filePath = path.join(TEST_FILES_DIR, fileName);
  fs.writeFileSync(filePath, 'Sample content');
  return { filePath, fileName };
}

/**
 * Cleans up all test files in the test files directory.
 */
export function cleanupTestFiles(): void {
  if (fs.existsSync(TEST_FILES_DIR)) {
    const files = fs.readdirSync(TEST_FILES_DIR);
    for (const file of files) {
      const filePath = path.join(TEST_FILES_DIR, file);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        // Ignore errors if file is already deleted (parallel execution)
        console.warn(`Could not delete file ${filePath}:`, error);
      }
    }
  }
}

/**
 * Gets the absolute path for a test file.
 *
 * @param fileName - Name of the test file
 * @returns Absolute path to the file
 */
export function getTestFilePath(fileName: string): string {
  return path.join(TEST_FILES_DIR, fileName);
}

/**
 * Checks if a test file exists.
 *
 * @param fileName - Name of the file to check
 * @returns True if file exists, false otherwise
 */
export function testFileExists(fileName: string): boolean {
  return fs.existsSync(getTestFilePath(fileName));
}
