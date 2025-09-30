import { decrypt } from '../utils/encryption-utils';
import permissionsData from './role-permissions.json';
import usersData from './users.json';

/** Type representing all available user roles in the system */
export type Role = keyof typeof usersData;

/**
 * Interface representing raw user data from JSON configuration.
 * Contains basic user information including credentials.
 */
export interface UserData {
  /** User's email address for authentication */
  emailAddress: string;
  /** User's password (encrypted by default) */
  password: string;
  /** User's full display name */
  fullName: string;
  /** Flag indicating if password is stored in plain text (for testing) */
  unencrypted?: boolean;
}

/**
 * Extended interface for test users with role-based permissions.
 * Combines user data with role information and permission checking capabilities.
 */
export interface TestUser extends UserData {
  /** User's assigned role in the system */
  role: Role;
  /** Array of permissions granted to this user's role */
  permissions: string[];

  /**
   * Checks if the user has a specific permission.
   * @param permission - The permission string to check
   * @returns True if user has the permission, false otherwise
   */
  hasPermission(permission: string): boolean;
}

/**
 * Implementation class that combines user data with role-based permissions.
 * Handles password decryption and permission lookup based on user role.
 */
class UserWithPermissions implements TestUser {
  emailAddress: string;
  password: string;
  fullName: string;
  role: Role;
  permissions: string[];

  /**
   * Creates a new user instance with permissions based on role.
   *
   * @param userData - Raw user data from configuration
   * @param role - User's role for permission lookup
   */
  constructor(userData: UserData, role: Role) {
    this.emailAddress = userData.emailAddress;
    this.password = userData.unencrypted === true ? userData.password : decrypt(userData.password);
    this.fullName = userData.fullName;
    this.role = role;
    this.permissions = permissionsData[role as keyof typeof permissionsData] || [];
  }

  /**
   * Checks if the user has a specific permission.
   *
   * @param permission - The permission string to verify
   * @returns True if the user's role includes this permission
   */
  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }
}

/** Cache for storing instantiated test users to avoid recreating them */
const userCache = {} as Record<Role, TestUser>;

/**
 * Proxy object that provides lazy-loaded access to test users.
 * Users are created on first access and cached for subsequent requests.
 *
 * @example
 * ```typescript
 * const adminUser = testUsers.Administrator;
 * const contributorUser = testUsers.Contributor;
 * ```
 */
export const testUsers = new Proxy(userCache, {
  get(target, role: Role): TestUser {
    if (!target[role]) {
      target[role] = new UserWithPermissions(usersData[role] as UserData, role);
    }
    return target[role];
  },
});

/**
 * Creates a new TestUser instance for the specified role.
 * Unlike testUsers proxy, this always creates a fresh instance.
 *
 * @param role - The user role to create
 * @returns A new TestUser instance with the specified role
 */
export const getUserByRole = (role: Role): TestUser => new UserWithPermissions(usersData[role] as UserData, role);

/**
 * Gets all available user roles from the configuration.
 *
 * @returns Array of all configured user roles
 */
export const getAvailableRoles = (): Role[] => Object.keys(usersData) as Role[];

/**
 * Creates a new user instance with timestamp-based unique identifiers.
 * Useful for tests that require unique user data (e.g., registration tests).
 *
 * @returns TestUser with timestamp-replaced email and full name
 * @throws Error if 'newUser' template is not found in configuration
 */
export const getNewUser = (): TestUser => {
  const baseUser = testUsers.newUser;
  if (!baseUser) {
    throw new Error('newUser not found in testUsers');
  }

  const timestamp = Date.now().toString();
  const placeholder = '{{timestamp}}';
  // Create a new object to avoid mutating the original
  return {
    ...baseUser,
    emailAddress: baseUser.emailAddress.replace(placeholder, timestamp),
    fullName: baseUser.fullName.replace(placeholder, timestamp),
  };
};
