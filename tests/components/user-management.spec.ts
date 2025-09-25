import { USER_MANAGEMENT } from '../../constants';
import { expect, test } from '../../fixtures/base';
import { getNewUser, Role, TestUser } from '../../test-data/test-users';
import { getRandomValue, getSearchString } from '../../utils/helper';


export const ROLES = ['admin', 'contributor', 'viewer'];

test.describe("User management ", { tag: '@component' }, () => {
    let users: TestUser[] = []
    test.beforeAll('Create new users to enable pagination on the users table', async ({ app, session, request }) => {
        await session({ role: 'Administrator' });
        const authToken = await app.page.evaluate(() => localStorage.getItem('token'));
        for (let i = 0; i < 10; i++) {
            const user = getNewUser();
            user.role = getRandomValue(ROLES) as Role
            users.push(user)
            const { fullName: name, emailAddress: email, password, role } = user
            const response = await request.post("/api/users", {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                data: { name, email, password, role },

            });
            expect(response.status()).toBe(201);
        }

    });

    test('Filter users by role', async ({ app, session }) => {
        await session({ role: 'Administrator' });
        await app.dashboardPage.navigateToMenu(USER_MANAGEMENT);
        const filteredRole = (await app.usersPage.filterUsersByRole()).toLowerCase();
        const uniqueColumValues = new Set(await app.usersPage.getColumnValues('Role'));
        expect(uniqueColumValues.size).toEqual(1);
        expect(uniqueColumValues.has(filteredRole)).toBeTruthy();
    });

    const searchFieldKey = { name: 'fullName', role: 'role', email: 'emailAddress' };
    for (const [field, key] of Object.entries(searchFieldKey)) {
        test(`Search users by ${field}`, async ({ app, session }) => {
            await session({ role: 'Administrator' });
            await app.dashboardPage.navigateToMenu(USER_MANAGEMENT);
            const searchString = getSearchString(String(getRandomValue(users)[key as keyof TestUser]));
            const rowsTextContents = await app.usersPage.searchUsersBy(searchString);
            expect(rowsTextContents.length).toBeGreaterThan(0);
            const q = searchString.toLowerCase();
            expect(rowsTextContents.every(rowText => rowText.toLowerCase().includes(q))).toBeTruthy();
        });
    }

});