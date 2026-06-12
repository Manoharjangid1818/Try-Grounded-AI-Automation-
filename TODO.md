# TODO

## Bulk Audit BA_008 referenceDocument step order
- [ ] Update `pages/BulkAuditPage.js` `verifyReferenceDocumentOption` to click **Pull all** (using `this.pullAllRecords()`) after selecting source/recordType/contact and before clicking the reference option text.
- [ ] Run Playwright for BA_008 (`tests/bulkAudit.spec.js --grep BA_008`) and ensure it passes.
- [ ] Confirm evidence capture still works (screenshot + JSON attachment).

