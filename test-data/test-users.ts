import permissionsData from './role-permissions.json';
import usersData from './users.json';

type Role = 'Administrator' | 'Contributor' | 'Viewer' | 'registerUser' | 'invalidPassword' | 'tooShortPassword';

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
        this.password = userData.password;
        this.fullName = userData.fullName;
        this.role = role;
        this.permissions = permissionsData[role as keyof typeof permissionsData] || [];
    }
    hasPermission(permission: string): boolean {
        return this.permissions.includes(permission);
    }

}

const createTestUsers = (): Record<Role, TestUser> => {
    const users = {} as Record<Role, TestUser>;

    // Loop through JSON entries and create users
    for (const [roleKey, userData] of Object.entries(usersData)) {
        const role = roleKey as Role; // Cast to Role type
        users[role] = new UserWithPermissions(userData as UserData, role);
    }

    return users;
};

export const testUsers = createTestUsers();

export const getUserByRole = (role: Role): TestUser | undefined => {
    return testUsers[role]
}

export const getAvailableRoles = (): Role[] => {
    return Object.keys(testUsers) as Role[];
}

const createRegistrationUser = (): TestUser => {
    const baseUser = testUsers.registerUser;
    if (!baseUser) {
        throw new Error('registerUser not found in testUsers');
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const placeholder = "{{timestamp}}";
    // Create a new object to avoid mutating the original
    return {
        ...baseUser,
        emailAddress: baseUser.emailAddress.replace(placeholder, timestamp),
        fullName: baseUser.fullName.replace(placeholder, timestamp),
    };
}

export const registerUser = createRegistrationUser();

