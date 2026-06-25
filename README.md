# Grounded AI Automation

[![Playwright Tests](https://github.com/Manoharjangid1818/Try-Grounded-AI-Automation-/actions/workflows/playwright.yml/badge.svg)](https://github.com/Manoharjangid1818/Try-Grounded-AI-Automation-/actions/workflows/playwright.yml)

Playwright/JavaScript ESM UI test suite for the Grounded AI dashboard at `grounded-topaz.vercel.app`. The suite uses the Page Object Model: spec files stay focused on test intent, page objects own UI interaction quirks, and JSON files drive most scenario data.

## Quick Start

```bash
git clone <repo-url>
cd Try-Grounded-AI-Automation--main
npm install
npx playwright install --with-deps
```

Create a local `.env` from the safe template and fill in real credentials:

```bash
cp .env.example .env
```

Then authenticate and run the suite:

```bash
npm run auth
npm test
npm run report
```

`npm run auth` waits for manual OTP and writes `auth/user.json`. Treat both `.env` and `auth/user.json` as secrets.

## Project Structure

```text
pages/               Page Object Model classes for each product area
tests/               Playwright spec files
data/                JSON test data and committed file-upload fixtures
utils/               Shared data, locator, result, screenshot, and history helpers
config/              Environment and framework config helpers
scripts/             Selected-test and selected-file runners
test-plans/          JSON inputs for selected execution scripts
auth/                Local storageState output, ignored by Git
results/             JSON/JUnit/history output, ignored by Git
playwright-report/   HTML report output, ignored by Git
```

## Module Map

| Page object                         | Spec file                            | Data file                             |
| ----------------------------------- | ------------------------------------ | ------------------------------------- |
| `pages/BulkAuditPage.js`            | `tests/bulkAudit.spec.js`            | `data/bulkAudit.data.json`            |
| `pages/ConversationAnalysisPage.js` | `tests/conversationAnalysis.spec.js` | `data/conversationAnalysis.data.json` |
| `pages/CustomRulesPage.js`          | `tests/customRules.spec.js`          | `data/customRules.data.json`          |
| `pages/LoginPage.js`                | `tests/auth.setup.spec.js`           | `.env`                                |
| `pages/ModelIntelligencePage.js`    | `tests/modelIntelligence.spec.js`    | `data/modelIntelligence.data.json`    |
| `pages/QuickTestsPage.js`           | `tests/quickTests.spec.js`           | `data/quickTests.data.json`           |
| `pages/RegressionMonitorPage.js`    | `tests/regressionMonitor.spec.js`    | `data/regressionMonitor.data.json`    |
| `pages/ResponseAuditPage.js`        | `tests/responseAudit.spec.js`        | `data/responseAudit.data.json`        |

## How Tests Run

Most specs load their module's `data/*.json` file, loop over test case objects, and route each object by `scenarioType`. The page object performs the UI flow, using resilient locators and deterministic waits for app-ready signals instead of arbitrary sleeps. Evidence is captured through screenshots and JSON result records, then attached to the Playwright test output.

## Add A Test Case

For an existing scenario type, add a new object to the matching `data/*.json` file with a unique `testCaseId`, readable `testCaseName`, and the fields already used by that scenario. No spec or page-object change is needed when the scenario type already exists.

Code changes are needed when you add a new `scenarioType`, when the app changes static button or label text that locators depend on, or when a workflow needs new assertions.

## Commands And Docs

Use `RunCommands.md` for npm scripts, tag-based runs, and selective execution. Use `PROJECT_DOCUMENTATION.md` for per-module behavior details. Use `RunJenkins.md` only for Jenkins setup.

## Security

`.env`, `.env.*`, `auth/user.json`, Playwright reports, test output, and result folders are ignored by Git. Husky blocks commits that stage `.env` or `auth/user.json`. If either secret was ever pushed, rotate the password and invalidate the browser session outside this repo.
