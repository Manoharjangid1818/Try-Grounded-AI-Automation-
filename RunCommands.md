# RunCommands.md

This file is the command cheat sheet. Keep architecture and folder explanations in `PROJECT_DOCUMENTATION.md`, and keep CI-specific steps in `RunJenkins.md`.

## One-time setup

```bash
npm install
npx playwright install
npm run auth   # creates/updates auth/user.json
```

## Run test suites

- Run all (complete framework):

```bash
npm test
# or
npx playwright test
```

- Run full Bulk Audit file (all BA_00x):

```bash
npm run test:bulk
# or
npx playwright test tests/bulkAudit.spec.js
```

## Run individual test cases

- Response Audit:

```bash
npx playwright test tests/responseAudit.spec.js --grep "RA_001"
npx playwright test tests/responseAudit.spec.js --grep "RA_002"
npx playwright test tests/responseAudit.spec.js --grep "RA_003"
npx playwright test tests/responseAudit.spec.js --grep "RA_004"
npx playwright test tests/responseAudit.spec.js --grep "RA_005"
npx playwright test tests/responseAudit.spec.js --grep "RA_006"
npx playwright test tests/responseAudit.spec.js --grep "RA_007"
npx playwright test tests/responseAudit.spec.js --grep "RA_008"
```

- Bulk Audit:

```bash
npx playwright test tests/bulkAudit.spec.js --grep "BA_001"
npx playwright test tests/bulkAudit.spec.js --grep "BA_002"
npx playwright test tests/bulkAudit.spec.js --grep "BA_003"
npx playwright test tests/bulkAudit.spec.js --grep "BA_004"
npx playwright test tests/bulkAudit.spec.js --grep "BA_005"
npx playwright test tests/bulkAudit.spec.js --grep "BA_006"
npx playwright test tests/bulkAudit.spec.js --grep "BA_007"
npx playwright test tests/bulkAudit.spec.js --grep "BA_008"
npx playwright test tests/bulkAudit.spec.js --grep "BA_009"
npx playwright test tests/bulkAudit.spec.js --grep "BA_010"
npx playwright test tests/bulkAudit.spec.js --grep "BA_011"
npx playwright test tests/bulkAudit.spec.js --grep "BA_012"
npx playwright test tests/bulkAudit.spec.js --grep "BA_013"
npx playwright test tests/bulkAudit.spec.js --grep "BA_014"
npx playwright test tests/bulkAudit.spec.js --grep "BA_015"
npx playwright test tests/bulkAudit.spec.js --grep "BA_016"
npx playwright test tests/bulkAudit.spec.js --grep "BA_018"
npx playwright test tests/bulkAudit.spec.js --grep "BA_019"
npx playwright test tests/bulkAudit.spec.js --grep "BA_021"
npx playwright test tests/bulkAudit.spec.js --grep "BA_022"
npx playwright test tests/bulkAudit.spec.js --grep "BA_024"
npx playwright test tests/bulkAudit.spec.js --grep "BA_025"
```

- Conversation Analysis:

```bash
npx playwright test tests/conversationAnalysis.spec.js --grep "CA_001"
npx playwright test tests/conversationAnalysis.spec.js --grep "CA_002"
npx playwright test tests/conversationAnalysis.spec.js --grep "CA_003"
npx playwright test tests/conversationAnalysis.spec.js --grep "CA_004"
npx playwright test tests/conversationAnalysis.spec.js --grep "CA_005"
npx playwright test tests/conversationAnalysis.spec.js --grep "CA_006"
npx playwright test tests/conversationAnalysis.spec.js --grep "CA_007"
npx playwright test tests/conversationAnalysis.spec.js --grep "CA_008"
npx playwright test tests/conversationAnalysis.spec.js --grep "CA_009"
```

- Custom Rules:

```bash
npx playwright test tests/customRules.spec.js --grep "CR_001"
```

- Model Intelligence:

```bash
npx playwright test tests/modelIntelligence.spec.js --grep "MI_001"
```

- Regression Monitor:

```bash
npx playwright test tests/regressionMonitor.spec.js --grep "RM_001"
```

- Run multiple IDs directly:

```bash
npx playwright test --grep "BA_001|BA_003"
```

## Run by tags

```bash
npx playwright test --grep "@smoke"
npm run test:regression
npx playwright test --grep "@regression"
npx playwright test --grep "@bulk"
```

## Run one module-wise

```bash
npm run test:bulk
npm run test:custom
npm run test:model
npm run test:quick
npm run test:monitor
npm run test:response
```

## Selected test cases from JSON

Edit `test-plans/selected-tests.json`:

```json
{
    "testIds": ["BA_001", "BA_003"]
}
```

Run:

```bash
npm run test:selected
```

## Selected files from JSON

Edit `test-plans/selected-files.json`:

```json
{
    "files": ["tests/bulkAudit.spec.js", "tests/responseAudit.spec.js"]
}
```

Run:

```bash
npm run test:files
```

## UI / headed / debug

```bash
npm run test:ui
npx playwright test --ui

npm run test:headed
npx playwright test --headed

npx playwright test tests/bulkAudit.spec.js --debug
```

## Browsers

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Reports

```bash
npm run report
npx playwright show-report
```
