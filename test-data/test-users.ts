
import { decrypt } from '../utils/encryption-utils';
import permissionsData from './role-permissions.json';
import usersData from './users.json';

export type Role = keyof typeof usersData

export interface UserData {
    emailAddress: string;
    password: string;
    fullName: string;
    unencrypted?: boolean
}

export interface TestUser extends UserData {
    role: Role;
    permissions: string[];

    hasPermission(permission: string): boolean;
}

class UserWithPermissions implements TestUser {
    emailAddress: string;
    password: string;
    fullName: string;
    role: Role;
    permissions: string[];

    constructor(userData: UserData, role: Role) {
        this.emailAddress = userData.emailAddress;
        this.password = userData.unencrypted === true ? userData.password : decrypt(userData.password);
        this.fullName = userData.fullName;
        this.role = role;
        this.permissions = permissionsData[role as keyof typeof permissionsData] || [];
    }
    hasPermission(permission: string): boolean {
        return this.permissions.includes(permission);
    }

}

const userCache = {} as Record<Role, TestUser>;

export const testUsers = new Proxy(userCache, {
    get(target, role: Role): TestUser {
        if (!target[role]) {
            target[role] = new UserWithPermissions(usersData[role] as UserData, role);
        }
        return target[role];
    }
});

export const getUserByRole = (role: Role): TestUser => new UserWithPermissions(usersData[role] as UserData, role);

export const getAvailableRoles = (): Role[] => Object.keys(usersData) as Role[];

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

