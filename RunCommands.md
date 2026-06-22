# RunCommands.md

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

- Run by ID:
```bash
npx playwright test tests/bulkAudit.spec.js --grep "BA_001"
npx playwright test tests/bulkAudit.spec.js --grep "BA_002"
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
  "files": [
    "tests/bulkAudit.spec.js",
    "tests/responseAudit.spec.js"
  ]
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
