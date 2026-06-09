# TODO - Bulk Audit dynamic locators

## Steps
- [x] Inspect current Bulk Audit POM, spec, and data
- [x] Update `pages/BulkAuditPage.js`
  - [x] `runBulkAudit()` dynamic Run button locator using `/Run\s+\d+\s+tests?/i`
  - [x] `pullAllRecords()` dynamic rows loaded locator using `/\d+\s+rows?\s+loaded/i`
  - [x] `createBulkAudit(data)` remove expectedRowsText/runButtonText dependencies
  - [x] BA_005: disabled run button locator using `/Run/i` with `.last()`
  - [x] BA_010: rows loaded assertion dynamic regex (no exact `3 rows loaded`)
- [x] Update `data/bulkAudit.data.json`
  - [x] Remove `expectedRowsText` / `runButtonText` from happyFlow cases
  - [x] Remove `runButtonText` from BA_005
  - [x] Set BA_010 `expectedLoadedText` to `
