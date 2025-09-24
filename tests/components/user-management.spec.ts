import { expect, test } from '../../fixtures/base';


test.describe("User management", { tag: '@component' }, () => {

    test('Filter users by role', async ({ app, session }) => {
        await session({ role: 'Administrator' });
        await app.dashboardPage.navigateToMenu('User Management');
        const filteredRole = (await app.usersPage.filterUsersByRole()).toLowerCase();
        expect(Array.from(new Set(await app.usersPage.getColumnValues('Role')))).toEqual([filteredRole])
    });
});