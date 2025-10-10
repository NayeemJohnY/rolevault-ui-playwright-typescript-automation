# RoleVault Playwright TypeScript Automation

[![Code Analysis](https://github.com/NayeemJohnY/rolevault-ui-playwright-typescript-automation/actions/workflows/code-analysis.yml/badge.svg)](https://github.com/NayeemJohnY/rolevault-ui-playwright-typescript-automation/actions/workflows/code-analysis.yml)
[![Test Execution - Playwright](https://github.com/NayeemJohnY/rolevault-ui-playwright-typescript-automation/actions/workflows/playwright-ci.yml/badge.svg)](https://github.com/NayeemJohnY/rolevault-ui-playwright-typescript-automation/actions/workflows/playwright-ci.yml)

🌐 **Live Report:** [nayeemjohny.github.io/rolevault-ui-playwright-typescript-automation](https://nayeemjohny.github.io/rolevault-ui-playwright-typescript-automation/)

## Table of Contents
- [Overview](#overview)
- [Tech Stack](#-tech-stack)
- [Key Features](#key-features)
- [Code Quality & Standards](#-code-quality--standards)
- [Advanced Test Fixtures](#advanced-test-fixtures)
- [Project Structure](#project-structure)
- [How to Run Tests](#how-to-run-tests)

## Overview
This repository contains Playwright end-to-end tests for the RoleVault UI, written in **TypeScript**. The framework focuses on readable Page Object Models (POM), reusable fixtures, cross-browser coverage, and rich reporting (Playwright HTML report + Allure).



## 🛠️ Tech Stack
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![Allure](https://img.shields.io/badge/Allure-FF6C37?style=for-the-badge&logo=qameta&logoColor=white)

## Key Features

### 🏗️ Framework Architecture
- **Professional-grade E2E test framework** using **Playwright** + **TypeScript**
- **Page Object Model (POM)** with clear, reusable page classes and helpers
- **Smart fixtures** for session/auth management, automatic screenshots on failure, and optional video recording
- **Storage state management** - Authentication state persistence with role-based caching for optimized test execution
- **Enhanced network monitoring** - Per-page network request tracking with detailed reports and automatic attachment
- **Component and E2E test patterns** with consistent fixtures and utilities

### 🌐 Cross-Browser & Multi-Environment Support
- **Cross-browser testing**: Chromium (Google Chrome), Firefox, WebKit (Safari) and mobile emulation
- **Multi-environment support**: dynamic base URLs, env-specific timeouts/retries
- **Configurable retries and timeouts** per environment and CI
- **CI/CD Integration**: Seamless integration with **GitHub Actions**, **Jenkins**, and other CI/CD pipelines

### 🚀 CI/CD Automation
This framework includes production-ready GitHub Actions workflows for automated testing:

**Workflows Available:**
- **[Code Analysis](.github/workflows/code-analysis.yml)** - Automated ESLint validation on PRs with auto-fix
- **[Test Execution](.github/workflows/playwright-ci.yml)** - Full test suite execution with scheduled runs
- **[Sharded Execution](.github/workflows/playwright-ci-sharding.yml)** - Parallel test execution with configurable sharding

**Key CI Features:**
- Scheduled test runs (Monday-Friday at 5:30 AM UTC)
- Manual workflow triggers with environment selection (staging/prod)
- Docker-based test environment (MongoDB + RoleVault application)
- Automated report generation (Playwright HTML + Allure)
- GitHub Pages deployment for test reports
- Test artifact retention (30 days)
- Parallel execution support with customizable shard percentage

**Workflow Capabilities:**
```yaml
# Test Execution Options
- Environment: staging | prod
- CLI Arguments: Custom Playwright CLI options
- Report Publishing: Automatic deployment to GitHub Pages
- Sharding: Configurable work distribution (e.g., 25% = 4 shards)
```

**CI Artifacts:**
All test runs automatically generate and preserve artifacts for 30 days:
- Playwright HTML reports
- Allure analytics reports
- Screenshots (on failures)
- Network request/response logs
- Test execution traces
- Application logs

Access artifacts via the GitHub Actions workflow run summary page.

### 📊 Advanced Testing & Reporting
- **Visual testing support**: screenshots and video capture on failures
- **Rich reporting**: Playwright HTML report and **Allure** analytics with detailed insights
- **Network monitoring**: Comprehensive HTTP request/response tracking with JSON reports for debugging
- **Session isolation**: Each test session runs in independent browser contexts for reliable test execution
- **CI-friendly**: easy to preserve artifacts (reports, videos, traces) for pipeline debugging
- **Simple local demo site** (see `github-pages/index.html`) that summarizes architecture and links to generated reports

## 🎨 Code Quality & Standards

This framework enforces high code quality through automated linting and formatting:

### ESLint Configuration
- **TypeScript-specific rules**: Prevents common async/await pitfalls and type issues
- **Consistent code style**: Enforces curly braces, strict equality, and clean arrow functions
- **Best practices**: Complexity limits, explicit return types, and proper error handling
- **Pre-test validation**: Automatically runs ESLint before test execution via `pretest` script

### Prettier Integration
- **Integrated with ESLint**: Prettier runs as an ESLint rule for seamless formatting
- **Consistent formatting**: Single quotes, semicolons, 2-space indentation, 120 character line width
- **Auto-fixable**: Most style issues can be automatically corrected

### Code Quality Rules
```typescript
// TypeScript Best Practices
- No floating promises (all async operations handled)
- Consistent type imports (import type for types)
- Explicit function return types
- No misused promises in conditionals

// Style Consistency
- Single quotes, semicolons required
- Max 1 empty line between code blocks
- No trailing spaces
- Complexity limit: 10 per function
```

### Running Linting
```bash
# Automatic linting before tests
npm pretest

# Manual linting with auto-fix
npx eslint . --fix
```

## Advanced Test Fixtures

This framework implements a sophisticated fixture system that provides powerful capabilities for test execution:

### 🔧 Core Fixtures

- **`app` fixture**: Pre-initialized application instance for simple test scenarios
- **`session` fixture**: Advanced session factory for creating isolated test contexts with role-based authentication

### ⚡ Key Features

**Storage State Management**
- Automatically caches authentication state by role (Administrator, Manager, Viewer)
- Reuses saved sessions across tests, eliminating redundant login operations
- Dramatically reduces test execution time (first login saved, subsequent tests reuse state)
- STORAGE_STATE_DIR: .auth (authentication storage states are saved under the `.auth` folder; configure via constants.STORAGE_STATE_DIR)

**Per-Page Network Monitoring**
- Captures all HTTP requests/responses for every page and session
- Generates detailed JSON reports with timing, headers, status codes, and payloads
- Automatically attached to test reports for debugging

**Automatic Screenshot Capture**
- Takes full-page screenshots on test failures
- Captures screenshots for all active sessions (main page + additional sessions)
- Properly named and attached to test reports

**Session Isolation**
- Each `session()` call creates an independent browser context
- Perfect for multi-user scenarios (e.g., Admin creates user, new user logs in)
- No cross-contamination between test sessions

### 💡 Usage Example

```typescript
test('Multi-user workflow', async ({ session }) => {
  // Admin session with cached auth
  const admin = await session({ role: 'Administrator' });
  
  // Create a new user
  await admin.usersPage.addUser(newUser);
  
  // New user session (independent context)
  const newUserApp = await session();
  await newUserApp.homePage.login(newUser);
});
```

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
├── 🤖 CI/CD Workflows
│   └── .github/workflows/
│       ├── code-analysis.yml           # ESLint validation & auto-fix on PRs
│       ├── playwright-ci.yml           # Scheduled & manual test execution
│       └── playwright-ci-sharding.yml  # Parallel test execution with sharding
│
├── 🧪 Test Framework
│   ├── fixtures/                 # Test fixtures & shared test setup
│   │   ├── base.ts               # Base fixtures and helpers used by tests
│   │   └── storageState.ts       # Storage state management for auth persistence
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
│       ├── helper.ts             # General utility functions
│       └── networkMonitor.ts     # Network request/response tracking
│
├── 📊 Reports & Artifacts
│   ├── .auth/                    # Cached authentication storage states (gitignored)
│   ├── allure-report/            # Generated Allure HTML report (artifact folder)
│   ├── allure-results/           # Raw Allure results (JSON, attachments)
│   ├── playwright-report/        # Generated Playwright HTML report (artifact folder)
│   ├── screenshots/              # Saved screenshots from test runs
│   ├── test-results/             # Test runner outputs and structured results
│   └── network-reports/          # HTTP request/response logs with timing data
│
└── 🌐 Documentation Site
    └── github-pages/             # Static demo/overview site
        ├── index.html            # Project overview page (architecture, features, report links)
        └── styles.css            # Custom styles for documentation site
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