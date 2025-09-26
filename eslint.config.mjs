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
        }
    }
]);
