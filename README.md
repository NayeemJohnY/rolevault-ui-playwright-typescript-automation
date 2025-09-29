# RoleVault Playwright TypeScript Automation

## Overview
This project contains Playwright end-to-end tests for the RoleVault UI, written in TypeScript.

## How to Run Tests

1. Install dependencies:
   ```bash
   npm ci
   ```
2. Run all tests:
   ```bash
   npx playwright test
   ```
3. Run Last failed test on specific project:
   ```bash
   npx playwright test --project "Google Chrome" --last-failed
   ```
4. Run each test repeatedly multiple times:
   ```bash
   npx playwright test --repeat-each=5
   ```
5. Run each test UI Mode, Headed and One Worker:
   ```bash
   npx playwright test --ui --headed  --workers 1
   ```
6. View the HTML report:
   ```bash
   npx playwright show-report
   ```


## Project Structure
- `tests/` - Playwright test specs
- `pages/` - Page Object Model classes
- `playwright.config.ts` - Playwright configuration

## Notes
- Reports and logs are not published publicly by default.
