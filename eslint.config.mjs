// @ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
        ignores: [
            "eslint.config.mjs",
            ".github",
            "github-pages",
            "node_modules",
            "playwright-report",
            "test-results",
        ]
    },
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            /** --- TypeScript Best Practices --- **/
            '@typescript-eslint/no-floating-promises': 'error',       // Prevent unhandled async operations
            '@typescript-eslint/await-thenable': 'error',             // Ensure only awaitable values are awaited
            '@typescript-eslint/no-misused-promises': 'error',        // Prevent accidentally using promises in conditionals
            '@typescript-eslint/consistent-type-imports': 'error',    // Use `import type` for type-only imports
            '@typescript-eslint/no-explicit-any': 'warn',             // Discourage use of `any`
            '@typescript-eslint/explicit-function-return-type': 'warn', // Optional: Make return types explicit for better maintainability

            /* General code quality */
            'eqeqeq': ['error', 'always'],             // Enforce strict equality
            'prefer-const': 'warn',                    // Suggest `const` where possible
        }
    }
]);
