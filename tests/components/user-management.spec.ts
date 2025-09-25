import { expect, test } from '../../fixtures/base';
import { getNewUser } from '../../test-data/test-users';


test.describe("User management ", { tag: '@component' }, () => {
    test.beforeAll('Create new users to enable pagination on the users table', async ({ app, session, request }) => {
        await session({ role: 'Administrator' });
        const authToken = await app.page.evaluate(() => localStorage.getItem('token'));
        for (let i = 0; i < 10; i++) {
            const { fullName: name, emailAddress: email, password } = getNewUser();
            const response = await request.post("/api/users", {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                data: { name, email, password, role: 'viewer' },

            });
            expect(response.status()).toBe(201);
        }

    });

    test('Filter users by role', async ({ app, session }) => {
        await session({ role: 'Administrator' });
        await app.dashboardPage.navigateToMenu('User Management');
        const filteredRole = (await app.usersPage.filterUsersByRole()).toLowerCase();
        expect([...new Set(await app.usersPage.getColumnValues('Role'))]).toEqual([filteredRole])
    });
});