import { decrypt } from '../utils/EncryptionUtils';
import permissionsData from './role-permissions.json';
import usersData from './users.json';

type Role = keyof typeof usersData

export interface UserData {
    emailAddress: string;
    password: string;
    fullName: string;
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
        this.password = decrypt(userData.password);
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
    get(target, role: Role) {
        if (!target[role]) {
            target[role] = new UserWithPermissions(usersData[role] as UserData, role);
        }
        return target[role];
    }
});


export const getUserByRole = (role: Role): TestUser => {
    return new UserWithPermissions(usersData[role] as UserData, role);
}

export const getAvailableRoles = (): Role[] => {
    return Object.keys(usersData) as Role[];
}

export const getNewUser = (): TestUser => {
    const baseUser = getUserByRole('newUser')
    if (!baseUser) {
        throw new Error('newUser not found in testUsers');
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const placeholder = "{{timestamp}}";
    // Create a new object to avoid mutating the original
    return {
        ...baseUser,
        emailAddress: baseUser.emailAddress.replace(placeholder, timestamp),
        fullName: baseUser.fullName.replace(placeholder, timestamp),
    };
};

