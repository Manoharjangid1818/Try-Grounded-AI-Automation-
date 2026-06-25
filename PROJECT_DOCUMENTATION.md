# Project Documentation - Grounded AI Automation

This document explains the **automation project** in simple words. It is written for anyone who needs to **install the project**, **run tests**, **understand the folder structure**, or **add new test cases**.

## 1. Project Overview

This project contains **Playwright end-to-end UI automation tests** for the **Grounded AI** web application.

**Default application URL:**

```text
https://grounded-topaz.vercel.app
```

**Default dashboard URL used by tests:**

```text
https://grounded-topaz.vercel.app/dashboard
```

The tests open the real web app in a browser, perform **user actions**, verify the **result on the screen**, and save **test evidence** such as screenshots and JSON result data.

## 2. Main Goal

The goal of this framework is to test important **Grounded AI features** such as:

- **Response Audit**
- **Bulk Audit**
- **Conversation Analysis**
- **Custom Rules**
- **Model Intelligence**
- **Regression Monitor**
- **Quick Tests**
- **Authentication**

## 3. Technology Used

| Item                   | Usage                                           |
| ---------------------- | ----------------------------------------------- |
| **JavaScript**         | Test code language                              |
| **Playwright**         | Browser automation and test runner              |
| **`@playwright/test`** | Playwright test framework                       |
| **`dotenv`**           | Reads values from `.env` file                   |
| **Page Object Model**  | Keeps UI actions inside page classes            |
| **JSON test data**     | Stores test case details outside the spec files |
| **Jenkins**            | CI pipeline support                             |

## 4. Important Project Folders

| Path                     | Meaning                                                                  |
| ------------------------ | ------------------------------------------------------------------------ |
| **`tests/`**             | Playwright spec files. Each file contains tests for one module.          |
| **`pages/`**             | Page Object files. These files contain reusable UI actions.              |
| **`data/`**              | Test data files in JSON format.                                          |
| **`utils/`**             | Common helper files for reading data, screenshots, results, and history. |
| **`config/`**            | Small config helper files.                                               |
| **`scripts/`**           | Node scripts for running selected tests or selected files.               |
| **`test-plans/`**        | JSON files used by selected test execution scripts.                      |
| **`auth/`**              | Stores the logged-in browser session in `auth/user.json`.                |
| **`results/`**           | Stores JSON, JUnit, and UI result output after test execution.           |
| **`playwright-report/`** | Stores the Playwright HTML report.                                       |
| **`test-results/`**      | Stores Playwright artifacts like screenshots, traces, and videos.        |

## 5. Important Root Files

| File                           | Meaning                                    |
| ------------------------------ | ------------------------------------------ |
| **`package.json`**             | NPM scripts and project dependencies.      |
| **`playwright.config.js`**     | Main Playwright configuration.             |
| **`RunCommands.md`**           | Quick command reference for running tests. |
| **`RunJenkins.md`**            | Jenkins running guide.                     |
| **`Jenkinsfile`**              | Jenkins pipeline definition.               |
| **`PROJECT_DOCUMENTATION.md`** | This project guide.                        |

## 6. Setup Steps

Run these steps from the **project root folder**.

### Step 1: Install Node Packages

```bash
npm install
```

### Step 2: Install Playwright Browsers

```bash
npx playwright install
```

### Step 3: Create `.env` File

Create a **`.env`** file in the project root.

**Example:**

```env
EMAIL=your-email@example.com
PASSWORD=your-password
BASE_URL=https://grounded-topaz.vercel.app/dashboard
HEADLESS=false
```

**Notes:**

- **`EMAIL`** is used during login.
- **`PASSWORD`** is used during login.
- **`BASE_URL`** is optional. If it is not added, the framework uses the default dashboard URL.
- **`HEADLESS=false`** means the browser is visible.
- **`HEADLESS=true`** means the browser runs in the background.

### Step 4: Create Login Session

**Run:**

```bash
npm run auth
```

**What happens:**

1. The browser opens the login page.
2. The framework fills email and password from `.env`.
3. You enter OTP manually.
4. The test waits until the dashboard opens.
5. The logged-in session is saved to:

```text
auth/user.json
```

**Important:**

- Most tests need **`auth/user.json`**.
- If login expires, run **`npm run auth`** again.
- Treat **`auth/user.json`** like sensitive data because it stores a logged-in browser session.

## 7. How Authentication Works

**Authentication is handled by:**

```text
tests/auth.setup.spec.js
```

**The login steps are inside:**

```text
pages/LoginPage.js
```

After login, Playwright saves browser storage into **`auth/user.json`**.

**Other spec files reuse this session with:**

```js
test.use({
    storageState: 'auth/user.json'
});
```

This means normal tests **do not need to log in again** every time.

## 8. How the Framework Is Designed

The framework uses **Page Object Model**.

**Simple meaning:**

- **Spec files** decide what test should run.
- **Data files** provide input values.
- **Page files** perform clicks, typing, waits, and checks.
- **Utility files** save screenshots and result data.

**Example flow:**

1. A spec file reads a JSON data file.
2. The spec creates one test for each test case in that JSON file.
3. The test opens the correct page.
4. The page object performs the user actions.
5. The page object verifies the expected result.
6. After the test, the framework captures evidence.

## 9. Current Test Modules

| Module                    | Spec File                            | Data File                             | Page Object                         | NPM Command                     |
| ------------------------- | ------------------------------------ | ------------------------------------- | ----------------------------------- | ------------------------------- |
| **Authentication**        | `tests/auth.setup.spec.js`           | `.env`                                | `pages/LoginPage.js`                | **`npm run auth`**              |
| **Response Audit**        | `tests/responseAudit.spec.js`        | `data/responseAudit.data.json`        | `pages/ResponseAuditPage.js`        | **`npm run test:response`**     |
| **Bulk Audit**            | `tests/bulkAudit.spec.js`            | `data/bulkAudit.data.json`            | `pages/BulkAuditPage.js`            | **`npm run test:bulk`**         |
| **Conversation Analysis** | `tests/conversationAnalysis.spec.js` | `data/conversationAnalysis.data.json` | `pages/ConversationAnalysisPage.js` | **`npm run test:conversation`** |
| **Custom Rules**          | `tests/customRules.spec.js`          | `data/customRules.data.json`          | `pages/CustomRulesPage.js`          | **`npm run test:custom`**       |
| **Model Intelligence**    | `tests/modelIntelligence.spec.js`    | `data/modelIntelligence.data.json`    | `pages/ModelIntelligencePage.js`    | **`npm run test:model`**        |
| **Regression Monitor**    | `tests/regressionMonitor.spec.js`    | `data/regressionMonitor.data.json`    | `pages/RegressionMonitorPage.js`    | **`npm run test:monitor`**      |
| **Quick Tests**           | `tests/quickTests.spec.js`           | `data/quickTests.data.json`           | `pages/QuickTestsPage.js`           | **`npm run test:quick`**        |

**Note:**

- **`data/quickTests.data.json`** is currently empty, so **Quick Tests** has no active data-driven test cases right now.

## 10. Current Test Case IDs

### Response Audit

| ID           | What It Checks                                           |
| ------------ | -------------------------------------------------------- |
| **`RA_001`** | Load example and run audit.                              |
| **`RA_002`** | HubSpot contact audit for Maria Johnson.                 |
| **`RA_003`** | HubSpot contact audit for Brian Halligan.                |
| **`RA_004`** | HubSpot contact audit for Manohar Jangid.                |
| **`RA_005`** | Response Audit with Zendesk article.                     |
| **`RA_006`** | Load example and run audit with extra direct assertions. |
| **`RA_007`** | Data-driven HubSpot contact audit for multiple contacts. |
| **`RA_008`** | Load example dropdown options.                           |

### Bulk Audit

| ID           | What It Checks                                 |
| ------------ | ---------------------------------------------- |
| **`BA_001`** | Bulk Audit with Manohar Jangid contact.        |
| **`BA_002`** | Bulk Audit with Brian Halligan contact.        |
| **`BA_003`** | Bulk Audit with Maria Johnson contact.         |
| **`BA_004`** | Run button is disabled before rows are loaded. |
| **`BA_005`** | Empty audit name validation.                   |
| **`BA_006`** | Reset button clears the Bulk Audit form.       |
| **`BA_007`** | Load Example works in Bulk Audit.              |
| **`BA_008`** | Upload or paste reference document option.     |
| **`BA_009`** | CSV Upload tab is selected by default.         |
| **`BA_010`** | Live Agent tab opens successfully.             |
| **`BA_011`** | User can enter Test Run Name.                  |
| **`BA_012`** | Download Sample CSV works.                     |
| **`BA_013`** | Format Guide opens.                            |
| **`BA_014`** | Valid CSV file upload works.                   |
| **`BA_015`** | Invalid file type validation.                  |
| **`BA_016`** | CSV file size validation for file over 2 MB.   |
| **`BA_018`** | Paste JSON ground truth option expands.        |
| **`BA_019`** | Valid JSON ground truth can be pasted.         |
| **`BA_021`** | Active Layers panel is visible.                |
| **`BA_022`** | Status card before file upload.                |
| **`BA_024`** | Reference document file upload works.          |
| **`BA_025`** | Reference document size validation over 5 MB.  |

**Note:**

- Some numbers are skipped because those test cases are not active in the current data file.

### Conversation Analysis

| ID           | What It Checks                                          |
| ------------ | ------------------------------------------------------- |
| **`CA_001`** | Conversation Analysis page opens successfully.          |
| **`CA_002`** | User can enter conversation name.                       |
| **`CA_003`** | Reference document file upload works.                   |
| **`CA_004`** | User can paste conversation transcript.                 |
| **`CA_005`** | Complete analysis flow with file upload and transcript. |
| **`CA_006`** | Load Example button works.                              |
| **`CA_007`** | Empty transcript validation.                            |
| **`CA_008`** | Supported file formats text is visible.                 |
| **`CA_009`** | Optional summary checkbox can be selected.              |

### Other Modules

| ID           | Module                 | What It Checks                                             |
| ------------ | ---------------------- | ---------------------------------------------------------- |
| **`CR_001`** | **Custom Rules**       | Custom rule creation and analytics.                        |
| **`MI_001`** | **Model Intelligence** | Model Intelligence opens and comparison button is visible. |
| **`RM_001`** | **Regression Monitor** | Regression Monitor schedule and run flow.                  |

## 11. NPM Commands

| Command                         | Meaning                                             |
| ------------------------------- | --------------------------------------------------- |
| **`npm run auth`**              | Create or update `auth/user.json`.                  |
| **`npm test`**                  | Run all Playwright tests.                           |
| **`npm run test:ui`**           | Open Playwright UI mode.                            |
| **`npm run test:list`**         | List all discovered tests.                          |
| **`npm run test:headed`**       | Run tests with browser visible.                     |
| **`npm run test:smoke`**        | Run tests tagged `@smoke`.                          |
| **`npm run test:regression`**   | Run tests tagged `@regression`.                     |
| **`npm run test:bulk`**         | Run Bulk Audit tests.                               |
| **`npm run test:custom`**       | Run Custom Rules tests.                             |
| **`npm run test:model`**        | Run Model Intelligence tests.                       |
| **`npm run test:quick`**        | Run Quick Tests.                                    |
| **`npm run test:monitor`**      | Run Regression Monitor tests.                       |
| **`npm run test:response`**     | Run Response Audit tests.                           |
| **`npm run test:conversation`** | Run Conversation Analysis tests.                    |
| **`npm run test:selected`**     | Run test IDs from `test-plans/selected-tests.json`. |
| **`npm run test:files`**        | Run files from `test-plans/selected-files.json`.    |
| **`npm run report`**            | Open the Playwright HTML report.                    |

## 12. Common Run Commands

**Run all tests:**

```bash
npm test
```

**Run one module:**

```bash
npm run test:response
```

**Run one spec file:**

```bash
npx playwright test tests/responseAudit.spec.js
```

**Run one test case by ID:**

```bash
npx playwright test tests/responseAudit.spec.js --grep "RA_005"
```

**Run multiple IDs:**

```bash
npx playwright test --grep "BA_001|BA_003|RA_005"
```

**Run smoke tests:**

```bash
npm run test:smoke
```

**Run regression tests:**

```bash
npm run test:regression
```

**Open report:**

```bash
npm run report
```

For a full list of **independent test case commands**, use:

```text
RunCommands.md
```

## 13. Run Selected Tests From JSON

**File:**

```text
test-plans/selected-tests.json
```

**Example:**

```json
{
    "testIds": ["BA_001", "BA_003", "RA_005"]
}
```

**Run:**

```bash
npm run test:selected
```

**Important:**

- Only use IDs that exist in the **current test list**.
- You can check available IDs with **`npm run test:list`**.

## 14. Run Selected Files From JSON

**File:**

```text
test-plans/selected-files.json
```

**Example:**

```json
{
    "files": ["tests/bulkAudit.spec.js", "tests/responseAudit.spec.js"]
}
```

**Run:**

```bash
npm run test:files
```

## 15. Playwright Configuration

**Main config file:**

```text
playwright.config.js
```

**Important settings:**

| Setting              | Value                                         |
| -------------------- | --------------------------------------------- |
| **Test folder**      | `./tests`                                     |
| **Test timeout**     | `300000` ms                                   |
| **Expect timeout**   | `30000` ms                                    |
| **Default base URL** | `https://grounded-topaz.vercel.app/dashboard` |
| **Default browser**  | Chromium                                      |
| **Headless locally** | `true` only when `HEADLESS=true`              |
| **Headless in CI**   | `true` when `CI=true`                         |
| **Viewport**         | `1440 x 900`                                  |
| **Screenshots**      | Only on failure                               |
| **Video**            | Retained on failure                           |
| **Trace**            | On first retry                                |
| **Retries locally**  | `0`                                           |
| **Retries in CI**    | `1`                                           |
| **Workers locally**  | `1`                                           |
| **Workers in CI**    | `2`                                           |

**Reporters:**

| Reporter  | Output                            |
| --------- | --------------------------------- |
| **List**  | Terminal output                   |
| **HTML**  | `playwright-report/`              |
| **JSON**  | `results/playwright-results.json` |
| **JUnit** | `results/junit-results.xml`       |

## 16. Environment Variables

| Variable       | Required         | Meaning                                    |
| -------------- | ---------------- | ------------------------------------------ |
| **`EMAIL`**    | **Yes for auth** | Login email.                               |
| **`PASSWORD`** | **Yes for auth** | Login password.                            |
| **`BASE_URL`** | No               | Overrides default app URL.                 |
| **`HEADLESS`** | No               | Use `true` to run without visible browser. |
| **`CI`**       | No               | Jenkins sets this to `true`.               |

**Recommended local method:**

```text
.env
```

**PowerShell one-time example:**

```powershell
$env:HEADLESS="true"
npx playwright test
```

**Command Prompt one-time example:**

```cmd
set HEADLESS=true && npx playwright test
```

## 17. Test Data Files

| File                                      | Used By                     |
| ----------------------------------------- | --------------------------- |
| **`data/responseAudit.data.json`**        | Response Audit tests        |
| **`data/bulkAudit.data.json`**            | Bulk Audit tests            |
| **`data/conversationAnalysis.data.json`** | Conversation Analysis tests |
| **`data/customRules.data.json`**          | Custom Rules tests          |
| **`data/modelIntelligence.data.json`**    | Model Intelligence tests    |
| **`data/regressionMonitor.data.json`**    | Regression Monitor tests    |
| **`data/quickTests.data.json`**           | Quick Tests                 |

**Supporting files:**

| Path                                                         | Usage                                |
| ------------------------------------------------------------ | ------------------------------------ |
| **`data/bulk-audit-files/valid-bulk-audit.csv`**             | Valid CSV upload test.               |
| **`data/bulk-audit-files/invalid-file.png`**                 | Invalid file upload test.            |
| **`data/bulk-audit-files/large-file.csv`**                   | Large file validation test.          |
| **`data/bulk-audit-files/more-than-50-rows.csv`**            | Row limit validation data.           |
| **`data/reference-documents/KiwiQA Reference Document.txt`** | Reference document upload tests.     |
| **`data/reference-documents/large-reference-doc.txt`**       | Large reference document validation. |

## 18. Evidence and Results

The framework saves **evidence after tests**.

**Playwright outputs:**

| Output                          | Location                          |
| ------------------------------- | --------------------------------- |
| **HTML report**                 | `playwright-report/`              |
| **JSON report**                 | `results/playwright-results.json` |
| **JUnit report**                | `results/junit-results.xml`       |
| **Screenshots, videos, traces** | `test-results/`                   |

**Custom UI result capture:**

```text
results/ui-results/all-ui-results.json
```

**What custom result capture stores:**

- **Test case ID**
- **Test case name**
- **Module name**
- **Scenario type**
- **Screenshot path**
- **Captured page text**
- **Short result summary**
- **Test status**
- **Score** when available
- **Error details** when the test fails

The result capture runs after each test. If result capture fails, it logs a warning but **does not hide the real test pass or fail result**.

## 19. Jenkins CI

**Jenkins is configured by:**

```text
Jenkinsfile
```

**Simple CI flow:**

1. Checkout code.
2. Install dependencies with `npm ci || npm install`.
3. Install Playwright browsers with `npx playwright install --with-deps`.
4. Check that `auth/user.json` exists.
5. Run all Playwright tests.
6. Archive reports and artifacts.

**Important CI notes:**

- Jenkins runs with **`CI=true`**.
- Jenkins runs with **`HEADLESS=true`**.
- Jenkins does **not** run **`npm run auth`**.
- Because OTP is manual, CI must already have **`auth/user.json`**.
- Provide **`auth/user.json`** through Jenkins credentials, secret files, or artifacts.

For more **Jenkins details**, see:

```text
RunJenkins.md
```

## 20. How To Add a New Test Case

Use this process when adding a new **data-driven test**.

### Step 1: Choose the Module

**Example:**

```text
Response Audit
```

### Step 2: Open the Correct Data File

**Example:**

```text
data/responseAudit.data.json
```

### Step 3: Add a New JSON Object

**Example:**

```json
{
    "testCaseId": "RA_009",
    "scenarioType": "loadExample",
    "testCaseName": "Verify new Response Audit scenario",
    "source": "Load example",
    "runAuditButtonText": "Run audit",
    "expectedResultText": "Score breakdown"
}
```

### Step 4: Check the Spec File

**Open:**

```text
tests/responseAudit.spec.js
```

Make sure the spec supports the **`scenarioType`** you added.

### Step 5: Update the Page Object If Needed

**Open:**

```text
pages/ResponseAuditPage.js
```

Add or update methods only if the new test needs **new UI actions**.

### Step 6: List Tests

```bash
npm run test:list
```

### Step 7: Run the New Test

```bash
npx playwright test tests/responseAudit.spec.js --grep "RA_009"
```

## 21. Naming Rules

Use **clear test case IDs**.

| Prefix           | Module                |
| ---------------- | --------------------- |
| **`AUTH_SETUP`** | Authentication        |
| **`RA_`**        | Response Audit        |
| **`BA_`**        | Bulk Audit            |
| **`CA_`**        | Conversation Analysis |
| **`CR_`**        | Custom Rules          |
| **`MI_`**        | Model Intelligence    |
| **`RM_`**        | Regression Monitor    |
| **`QT_`**        | Quick Tests           |

**Good test name style:**

```text
RA_009 - Verify Response Audit with new example
```

## 22. Useful Debug Commands

**Run with browser visible:**

```bash
npm run test:headed
```

**Open Playwright UI mode:**

```bash
npm run test:ui
```

**Debug one test:**

```bash
npx playwright test tests/responseAudit.spec.js --grep "RA_005" --debug
```

**Run Chromium only:**

```bash
npx playwright test --browser=chromium
```

**Run Firefox only:**

```bash
npx playwright test --browser=firefox
```

**Run WebKit only:**

```bash
npx playwright test --browser=webkit
```

**Note:**

- This project does **not** define named Playwright projects in **`playwright.config.js`**.
- Use **`--browser=chromium`**, **`--browser=firefox`**, or **`--browser=webkit`**.
- Do **not** use **`--project=chromium`** unless named projects are added later.

## 23. Common Problems and Fixes

| Problem                               | Fix                                                                 |
| ------------------------------------- | ------------------------------------------------------------------- |
| **`auth/user.json` is missing**       | Run **`npm run auth`** and complete OTP.                            |
| **Login session expired**             | Run **`npm run auth`** again.                                       |
| **Test says no tests found**          | Check the ID with **`npm run test:list`**.                          |
| **`npm run test:quick` has no tests** | **`data/quickTests.data.json`** is currently empty. Add data first. |
| **Browser opens during local run**    | This is expected unless **`HEADLESS=true`**.                        |
| **Browser does not open in Jenkins**  | Jenkins uses **`HEADLESS=true`**.                                   |
| **App URL changed**                   | Set **`BASE_URL`** in **`.env`** or environment variables.          |
| **UI locator fails**                  | The app UI may have changed. Update the page object locator.        |
| **Report is not visible**             | Run **`npm run report`** after tests finish.                        |
| **Selected test does not run**        | Make sure the ID exists and is spelled correctly.                   |

## 24. Best Practices

- Keep **test data** in **`data/`** whenever possible.
- Keep **UI actions** in **`pages/`**.
- Keep **spec files** short and easy to read.
- Use **unique test case IDs**.
- Use clear **`testCaseName`** values.
- Do **not** hard-code secrets in test files.
- Refresh **`auth/user.json`** when login expires.
- Run **`npm run test:list`** after adding new data.
- Run **one test first** before running the full suite.
- Check **reports and screenshots** after failures.

## 25. Quick Start Summary

Use these commands for a **fresh local setup:**

```bash
npm install
npx playwright install
npm run auth
npm test
```

Use this command to run **one test case:**

```bash
npx playwright test tests/responseAudit.spec.js --grep "RA_005"
```

Use this command to open the **report:**

```bash
npm run report
```
