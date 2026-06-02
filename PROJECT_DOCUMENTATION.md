# Grounded Framework - Project Documentation

## 1) Overview
This repository contains **Playwright** end-to-end UI tests for the web application hosted at:

- `https://grounded-topaz.vercel.app/dashboard`

The project uses a **Page Object Model (POM)** approach:
- **Page objects** live in `pages/` (one class per area of the application)
- **Test specs** live in `tests/` (one spec file per test suite)
- Authentication is handled once via `tests/auth.setup.spec.js` and reused through `auth/user.json` (Playwright `storageState`).

---

## 2) Tech Stack
- **Language:** JavaScript (ES Modules)
- **Test Framework:** `@playwright/test`
- **Environment Variables:** `dotenv` (used in auth setup)
- **Browser Automation:** Playwright

---

## 3) Project Structure (Key Files)

### Root
- `package.json` – dependencies and (currently empty) scripts
- `playwright.config.js` – Playwright configuration (timeouts, viewport, baseURL, etc.)
- `auth/` – stored authenticated session(s)
- `pages/` – Page Object Model implementations
- `tests/` – test specifications

### Authentication
- `auth/user.json` – persisted storage state for a logged-in session

### Page Objects (`pages/`)
- `pages/LoginPage.js`
- `pages/ResponseAuditPage.js`
- `pages/QuickTestsPage.js`
- `pages/CustomRulesPage.js`
- `pages/BulkAuditPage.js`
- `pages/RegressionMonitorPage.js`
- `pages/ModelIntelligencePage.js`

### Tests (`tests/`)
- `tests/auth.setup.spec.js`
- `tests/responseAudit.spec.js`
- `tests/quickTests.spec.js`
- `tests/customRules.spec.js`
- `tests/bulkAudit.spec.js`
- `tests/regressionMonitor.spec.js`
- `tests/modelIntelligence.spec.js`

---

## 4) How Authentication Works (storageState)
The project avoids logging in during every test.

### Step A: Generate `auth/user.json`
Run:
- `tests/auth.setup.spec.js`

What it does:
1. Uses `dotenv` to load `process.env.EMAIL` and `process.env.PASSWORD`.
2. Navigates to the login page: `https://grounded-topaz.vercel.app/`
3. Performs sign-in steps:
   - Click **Sign in**
   - Fill email
   - Continue
   - Fill password
   - Continue
4. **Manual OTP entry is expected**:
   - It prints `Enter OTP manually` and does not auto-handle OTP.
5. Waits for the app dashboard URL pattern `**/dashboard`.
6. Saves the logged-in browser session to:
   - `auth/user.json`

### Step B: Reuse `auth/user.json`
Every spec uses:
```js
test.use({
  storageState: 'auth/user.json'
});
```
So pages start already authenticated.

---

## 5) How Tests Are Organized (POM + Suites)
Each test follows the same general workflow:
1. Create the corresponding page object.
2. Navigate to the dashboard.
3. Call page-object methods (actions and verifications).

---

## 6) Documentation: Run Steps for Each File

### 6.1 `tests/auth.setup.spec.js`
**Purpose:** Create/update authenticated session `auth/user.json`.

**Run steps (behavior):**
1. `page.goto('https://grounded-topaz.vercel.app/')`
2. Click sign in + fill email + proceed
3. Fill password + proceed
4. Wait for you to enter OTP manually
5. Wait for dashboard to load (`page.waitForURL('**/dashboard')`)
6. Save session:
   - `page.context().storageState({ path: 'auth/user.json' })`

**Prerequisites:**
- `.env` must exist or environment variables must be set with:
  - `EMAIL`
  - `PASSWORD`

---

### 6.2 `tests/responseAudit.spec.js`
**Purpose:** Verify Response Audit flow.

**Run steps (behavior):**
1. Uses `storageState: 'auth/user.json'`.
2. Instantiates `ResponseAuditPage`.
3. `openAuditPage()`:
   - Navigates to dashboard
   - Skips onboarding popup if visible
   - Clicks **Response Audit** sidebar button
   - Selects **Paste manually** option
4. `performAudit(question, aiResponse, expectedResponse)`:
   - Fills question textbox
   - Fills AI response textbox
   - Fills expected/known-correct textbox
   - Clicks **Run audit →**
5. `verifyAuditCompleted()`:
   - Waits for loader text: `Running 10-Layer Audit`
   - Waits until it becomes hidden
   - Confirms result section with **Score breakdown** is visible
   - Calls `page.pause()` (so you can inspect state)

---

### 6.3 `tests/quickTests.spec.js`
**Purpose:** Verify Quick Tests suite execution.

**Run steps (behavior):**
1. Uses `storageState: 'auth/user.json'`.
2. Instantiates `QuickTestsPage`.
3. Test directly goes to:
   - `https://grounded-topaz.vercel.app/dashboard`
4. `openQuickTestsPage()`:
   - Handles **Skip** popup if present
   - Scrolls to and opens **Quick Tests DEV** module
5. `runQuickTestSuite()`:
   - Clicks the first matching **Run Suite** button
6. `verifyQuickTestCompleted()`:
   - Waits for result card text matching `/PASSED.*FAILED/i`
   - Clicks the result card
   - Waits 10 seconds for observation

---

### 6.4 `tests/customRules.spec.js`
**Purpose:** Verify Custom Rules creation and analytics.

**Run steps (behavior):**
1. Uses `storageState: 'auth/user.json'`.
2. Instantiates `CustomRulesPage`.
3. Navigates to dashboard.
4. `openCustomRulesPage()`:
   - Skips popup if visible
   - Clicks **Custom rules**
5. `createRule()`:
   - Fills expected/incorrect answers and source
   - Clicks **+ Add rule**, then **Save →**, then **Save rule set**
6. `verifyRuleAnalytics()`:
   - Clicks **Rule analytics**
   - Validates a specific card (`VERIFIED FACT CHECKING`) is visible
   - Clicks the card and waits 10 seconds

---

### 6.5 `tests/bulkAudit.spec.js`
**Purpose:** Verify Bulk Audit creation and completion.

**Run steps (behavior):**
1. Uses `storageState: 'auth/user.json'`.
2. Instantiates `BulkAuditPage`.
3. Navigates to dashboard.
4. `openBulkAuditPage()`:
   - Skips popup if visible
   - Scrolls and clicks **Bulk Audit**
5. `createBulkAudit()`:
   - Fills audit name (e.g., `Bulk Audit 1`)
   - Selects `HubSpot`
   - Selects `CONTACTS` and chooses contact `Manohar Jangid`
   - Clicks **Pull all**
   - Waits for `3 rows loaded`
   - Clicks **Run 3 tests**
6. `verifyBulkAuditCompleted()`:
   - Waits for `RUNNING BATCH AUDIT` to appear, then to be hidden
   - Confirms `ALL RESULTS` is visible
   - Waits 10 seconds

---

### 6.6 `tests/regressionMonitor.spec.js`
**Purpose:** Verify scheduling and running Regression Monitor.

**Run steps (behavior):**
1. Uses `storageState: 'auth/user.json'`.
2. Instantiates `RegressionMonitorPage`.
3. Navigates to dashboard.
4. `openTestHistory()`:
   - Skips popup if visible
   - Clicks **Test history**
5. `scheduleTest()`:
   - Looks for a **Schedule** button (by text `/schedule/i`)
   - If not found, logs and skips scheduling
   - If found:
     - Opens schedule flow
     - Selects a schedule card via CSS selector
     - Uses comboboxes:
       - Select `daily`
       - Select the `5` points option (3rd combobox)
     - Clicks **Save schedule**
6. `openRegressionMonitor()`:
   - Clicks **Regression monitor**
7. `runRegressionMonitor()`:
   - Clicks **Run now**
   - Waits 10 seconds (observation)

---

### 6.7 `tests/modelIntelligence.spec.js`
**Purpose:** Verify Model Intelligence page opening and comparison button state.

**Run steps (behavior):**
1. Uses `storageState: 'auth/user.json'`.
2. Instantiates `ModelIntelligencePage`.
3. Navigates to dashboard.
4. `openModelIntelligence()`:
   - Skips popup if visible
   - Clicks **Model Intelligence**
5. `configureComparison()`:
   - Selects `Claude Opus 4.5`
   - Selects audit dropdown value `Bulk Audit 1`
6. `verifyRunComparisonButton()`:
   - Confirms **Run Comparison** is visible
   - Logs whether the button is disabled
   - Waits 10 seconds

---

## 7) Playwright Configuration (`playwright.config.js`)
Key settings:
- `testDir: './tests'`
- `timeout: 300000` (per test)
- `expect.timeout: 30000`
- `use.headless: false` (browser visible)
- `use.viewport: { width: 1440, height: 900 }`
- `baseURL: 'https://grounded-topaz.vercel.app/dashboard'`
- Tracing:
  - `trace: 'on-first-retry'`
- Screenshots:
  - `only-on-failure`
- Video:
  - `retain-on-failure`

---

## 8) How the Page Objects Work (Common Pattern)
Each page object class typically:
- Stores `page` instance in constructor
- Defines locators using Playwright `getByRole`, `getByText`, and `locator()`
- Exposes methods that:
  - handle optional popups (Skip button) when visible
  - navigate within the application
  - fill forms and submit actions
  - verify results using `expect(...).toBeVisible()` and loader visibility

---

## 9) Notes / Known Behaviors
- **Skip popup handling** is defensive (wrapped in try/catch or `isVisible().catch(() => false)`), since UI may vary.
- OTP is **manual** during auth setup.
- Some tests call `page.pause()` (notably Response Audit) which will halt execution for inspection.

---

## 10) Running the Tests (Suggested Workflow)
1. Create/update session:
   - Run `tests/auth.setup.spec.js`
   - Enter OTP manually when prompted
2. Run suite specs as needed:
   - `tests/responseAudit.spec.js`
   - `tests/quickTests.spec.js`
   - `tests/customRules.spec.js`
   - `tests/bulkAudit.spec.js`
   - `tests/regressionMonitor.spec.js`
   - `tests/modelIntelligence.spec.js`

Example command (from project root):
```bash
npx playwright test
```
Or run a single spec:
```bash
npx playwright test tests/responseAudit.spec.js
```

---

## 11) Files Summary (Quick Reference)
- **Auth:** `tests/auth.setup.spec.js` + `auth/user.json`
- **POM pages:**
  - `LoginPage.js`
  - `ResponseAuditPage.js`
  - `QuickTestsPage.js`
  - `CustomRulesPage.js`
  - `BulkAuditPage.js`
  - `RegressionMonitorPage.js`
  - `ModelIntelligencePage.js`
- **Specs:** one `.spec.js` per module/suite in `tests/`

