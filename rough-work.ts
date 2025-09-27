// export function step(stepName?: string) {
//     return function decorator(target: Function, context: ClassMethodDecoratorContext) {
//         return async function replacementMethod(this: any, ...args: any) {
//             const name = stepName ? stepName : `${this.constructor.name} + "." + ${String(context.name)}`
//             return await test.step(name, async () => {
//                 return await target.call(this, ...args);
//             })

//         }
//     }
// }

// import fs from "fs";
// import yaml from 'js-yaml';
// import path from 'path';

// const Roles = {
//     Administrator: 'Administrator',
//     Contributor: 'Contributor',
//     Viewer: 'Viewer'
// } as const

// type Role = keyof typeof Roles;

// type Permissions = string[]

// type RolePermissions = {
//     roles: {
//         [key: string]: Permissions
//     },
// }

// // Load role permissions from YAML
// const rolePermissionsFilePath = path.join(__dirname, '../resources/rolePermissions.yml')
// const rolePermissionsFileContent = fs.readFileSync(rolePermissionsFilePath, { encoding: 'utf-8' })
// const permissionsData = yaml.load(rolePermissionsFileContent) as RolePermissions

// type RoleUser = {
//     emailAddress: string,
//     password: string
//     permissions: Permissions
// }

// type RoleUsers = {
//     [key in Role]: RoleUser
// }

// // Load user credentials from YAML
// const credentialsFilePath = path.join(__dirname, '../resources/credentials.yml')
// const credentialsFileContent = fs.readFileSync(credentialsFilePath, { encoding: 'utf-8' })
// const usersData = yaml.load(credentialsFileContent) as { users: RoleUsers }
// const roleUsers = usersData.users

// const getRoleUser = (role: Role): RoleUser => {
//     const user = roleUsers[role]
//     return {
//         ...user,
//         permissions: permissionsData.roles[role] || []
//     };
// }

// export { getRoleUser, Roles, RoleUser }