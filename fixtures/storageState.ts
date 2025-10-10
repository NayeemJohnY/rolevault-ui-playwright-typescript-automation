import * as fs from 'fs';
import { STORAGE_STATE_DIR } from '../constants';
import path from 'path';
import type { Role } from '../test-data/test-users';
import type { BrowserContext } from '@playwright/test';

/**
 * Ensures the storage state directory exists
 */
function ensureStorageStateDir(): void {
  if (!fs.existsSync(STORAGE_STATE_DIR)) {
    fs.mkdirSync(STORAGE_STATE_DIR, { recursive: true });
  }
}

/**
 * Gets the storage state file path for a specific role
 */
export function getStorageStatePath(role: Role): string {
  return path.join(STORAGE_STATE_DIR, `${role}.json`);
}

/**
 * Checks if storage state file exists for a role
 */
export function hasStorageState(role: Role): boolean {
  return fs.existsSync(getStorageStatePath(role));
}

/**
 * storage state for a specific role
 */
export async function saveStorageState(context: BrowserContext, role: Role): Promise<void> {
  ensureStorageStateDir();
  await context.storageState({ path: getStorageStatePath(role) });
}
