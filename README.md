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
3. View the HTML report:
   ```bash
   npx playwright show-report
   ```


## Project Structure
- `tests/` - Playwright test specs
- `pages/` - Page Object Model classes
- `playwright.config.ts` - Playwright configuration

## Notes
- Reports and logs are not published publicly by default.
