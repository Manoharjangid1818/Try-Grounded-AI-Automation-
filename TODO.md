# TODO

## Response Audit - Extend test coverage

- [ ] Study existing Response Audit test + page object (done)
- [ ] Append Test Case 1: Load example & run audit (tests/responseAudit.spec.js)
- [ ] Append Test Case 2: HubSpot contact audit data-driven for Maria Johnson, ContactB, ContactC (tests/responseAudit.spec.js)
- [ ] Extend pages/ResponseAuditPage.js with assertions/selectors needed for:
  - HUBSPOT tag + green check
  - “CRM record active” + “Layers 2, 3 + 9” note
  - Context/prompt contains contact name (post auto-fill)
  - Result references ground truth source (HubSpot)
  - No error toast validation
- [ ] Run Playwright tests for @response-audit @smoke and validate new evidence artifacts
- [ ] Provide diff-style summary of additions

