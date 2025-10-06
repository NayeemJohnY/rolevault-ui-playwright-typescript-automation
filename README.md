# RoleVault Playwright TypeScript Automation

## Overview
This repository contains Playwright end-to-end tests for the RoleVault UI, written in TypeScript. The framework focuses on readable Page Object Models (POM), reusable fixtures, cross-browser coverage, and rich reporting (Playwright HTML report + Allure).

## Key Features

### Framework Architecture
- **Professional-grade E2E test framework** using Playwright + TypeScript
- **Page Object Model (POM)** with clear, reusable page classes and helpers
- **Smart fixtures** for session/auth management, automatic screenshots on failure, and optional video recording
- **Component and E2E test patterns** with consistent fixtures and utilities

### Cross-Browser & Multi-Environment Support
- **Cross-browser testing**: Chromium (Google Chrome), Firefox, WebKit (Safari) and mobile emulation
- **Multi-environment support**: dynamic base URLs, env-specific timeouts/retries
- **Configurable retries and timeouts** per environment and CI

### Visual Testing & Reporting
- **Visual testing support**: screenshots and video capture on failures
- **Built-in reporting**: Playwright HTML report and Allure analytics (if configured)
- **CI-friendly**: easy to preserve artifacts (reports, videos, traces) for pipeline debugging
- **Simple local demo site** (see `github-pages/index.html`) that summarizes architecture and links to generated reports

## Project Structure

Below is a tree view of the repository layout with descriptions of each component:

```
rolevault-ui-playwright-typescript-automation/
│
├── 📄 Configuration Files
│   ├── constants.ts              # Project-wide constants (URLs, test credentials, etc.)
│   ├── eslint.config.mjs         # ESLint configuration for TypeScript codebase
│   ├── package.json              # npm scripts and dependencies
│   ├── playwright.config.ts      # Playwright runner configuration (projects, timeouts, reporters)
│   ├── tsconfig.json             # TypeScript compiler settings
│   └── README.md                 # Project documentation
│
├── 🧪 Test Framework
│   ├── fixtures/                 # Test fixtures & shared test setup
│   │   └── base.ts               # Base fixtures and helpers used by tests
│   │
│   ├── pages/                    # Page Object Model classes
│   │   └── common/               # Shared locators, components, and helpers
│   │
│   ├── tests/                    # Playwright test specifications
│   │   ├── components/           # Component-level or small-unit UI tests
│   │   └── e2e/                  # Full end-to-end user flows
│   │
│   ├── test-data/                # Test data fixtures, sample users and inputs
│   └── utils/                    # Utility helpers (formatters, retry helpers, crypto)
│
├── 📊 Reports & Artifacts
│   ├── allure-report/            # Generated Allure HTML report (artifact folder)
│   ├── allure-results/           # Raw Allure results (JSON, attachments)
│   ├── playwright-report/        # Generated Playwright HTML report (artifact folder)
│   ├── screenshots/              # Saved screenshots from test runs
│   └── test-results/             # Test runner outputs and structured results
│
└── 🌐 Documentation Site
    └── github-pages/             # Static demo/overview site
        └── index.html            # Project overview page (architecture, features, report links)
```

## How to Run Tests

1. Install dependencies:
   ```bash
   npm ci
   ```
2. Run all tests:
   ```bash
   npx playwright test
   ```
3. Run last-failed tests for a specific project (example: Google Chrome):
   ```bash
   npx playwright test --project "Google Chrome" --last-failed
   ```
4. Repeat each test multiple times (helpful for flaky-checks):
   ```bash
   npx playwright test --repeat-each=5
   ```
5. Run tests in UI mode (headed) with a single worker:
   ```bash
   npx playwright test --ui --headed --workers=1
   ```
6. Open the Playwright HTML report locally:
   ```bash
   npx playwright show-report
   ```