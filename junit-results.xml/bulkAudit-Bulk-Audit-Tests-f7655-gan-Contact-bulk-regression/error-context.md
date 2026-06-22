# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bulkAudit.spec.js >> Bulk Audit Tests @bulk @regression >> BA_002 - Verify Bulk Audit with Brian Halligan Contact @bulk @regression
- Location: tests\bulkAudit.spec.js:17:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/ALL RESULTS/i)
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 300000ms
  - waiting for getByText(/ALL RESULTS/i)

```

```yaml
- text: Try Grounded · AI
- navigation:
  - text: WORKSPACE
  - button "Home":
    - img
    - text: Home
  - text: RUN A TEST
  - button "Response Audit":
    - img
    - text: Response Audit
  - button "Bulk Audit":
    - img
    - text: Bulk Audit
  - button "Conversation":
    - img
    - text: Conversation
  - button "Quick Tests DEV":
    - img
    - text: Quick Tests DEV
  - text: MONITOR
  - button "Regression monitor":
    - img
    - text: Regression monitor
  - button "Agent Monitor NEW":
    - img
    - text: Agent Monitor NEW
  - button "Model Intelligence":
    - img
    - text: Model Intelligence
  - text: REVIEW RESULTS
  - button "Test history":
    - img
    - text: Test history
  - button "Risk profile":
    - img
    - text: Risk profile
  - text: TOOLS & CONFIG
  - button "Connectors":
    - img
    - text: Connectors
  - button "Custom rules":
    - img
    - text: Custom rules
  - button "Knowledge Base":
    - img
    - text: Knowledge Base
  - button "API keys":
    - img
    - text: API keys
  - button "Team":
    - img
    - text: Team
  - button "GR badge":
    - img
    - text: GR badge
  - text: SUPPORT
  - button "Get help":
    - img
    - text: Get help
  - button "User guide":
    - img
    - text: User guide
  - button "API docs":
    - img
    - text: API docs
- text: Manohar Jangid free plan
- img
- paragraph: Scores are a guide only. Always apply human judgement before deployment.
- text: © 2026 KiwiQA Services · trygrounded.ai AI QUALITY AUDIT SUITE Bulk Audit — CSV Connect any CRM or data source to auto-enrich rows with ground truth, choose factual or adversarial questions, and select your AI agent as the response source. Or upload a CSV with your own AI responses. All 10 layers run — Layers 2, 3 + 9 activate automatically when ground truth data is loaded. INPUT MODE
- button "CSV UPLOAD"
- button "LIVE AGENT"
- text: BULK AUDIT
- button "↺ Reset"
- button "Load example →"
- text: TEST RUN NAME REQUIRED
- textbox "e.g. GPT-4o Healthcare Regression — Q2 2026": Bulk Audit 2
- text: CONNECTED SOURCE Layers 2 · 3 · 9 ACTIVE STEP 1 — SELECT CONNECTOR HS HubSpot Selected ZD Zendesk Click to select API Generic REST Click to select STEP 2 — SELECT RECORD TYPE AI RECOMMENDED
- button "DEALS"
- button "CONTACTS 3"
- button "COMPANIES"
- button "TICKETS"
- img
- text: "AI INTELLIGENCE — 3 contacts (0 with AI content). Recommended:"
- strong: contacts
- text: Fetches contact records — name, email, job title, company, lifecycle stage. HS HUBSPOT CONTACTS
- textbox "Search Contacts…"
- text: Maria Johnson (Sample Contact) emailmaria@hubspot.com
- img
- text: Brian Halligan (Sample Contact) bh@hubspot.com
- img
- text: Manohar Jangid manohar.jangid@project-kiwiqa.com
- img
- text: BULK AUTO-ENRICH Pull all Contacts → auto-generate questions + ground truth CSV
- combobox:
  - option "Factual" [selected]
  - option "Adversarial"
  - option "Mixed"
- button "Pulling…" [disabled]
- text: "✓ 3 records loaded RUN:"
- button "1"
- button "2"
- button "5"
- button "10"
- button "All"
- img
- text: "Ground truth loaded: HubSpot contacts — 3 records"
- button "Clear"
- img
- text: HubSpot contacts — 3 records ▲ Paste a JSON object or array. Applied as ground truth to every row — enables Layer 9 CRM Fidelity verification.
- 'textbox "{\"dealname\":\"Acme\",\"amount\":50000,\"stage\":\"qualified\"}"': "[{\"company\":\"HubSpot\",\"createdate\":\"2026-04-20T06:34:14.324Z\",\"email\":\"emailmaria@hubspot.com\",\"firstname\":\"Maria\",\"hs_object_id\":\"473898474232\",\"jobtitle\":\"Salesperson\",\"lastmodifieddate\":\"2026-04-20T15:04:04.583Z\",\"lastname\":\"Johnson (Sample Contact)\",\"lifecyclestage\":\"opportunity\"},{\"company\":\"HubSpot\",\"createdate\":\"2026-04-20T06:34:14.749Z\",\"email\":\"bh@hubspot.com\",\"firstname\":\"Brian\",\"hs_object_id\":\"473899519694\",\"jobtitle\":\"Executive Chairperson\",\"lastmodifieddate\":\"2026-04-23T06:35:36.892Z\",\"lastname\":\"Halligan (Sample Contact)\",\"lifecyclestage\":\"opportunity\"},{\"createdate\":\"2026-04-20T06:36:33.903Z\",\"email\":\"manohar.jangid@project-kiwiqa.com\",\"firstname\":\"Manohar \",\"hs_lead_status\":\"OPEN\",\"hs_object_id\":\"473907634922\",\"jobtitle\":\"QA\",\"lastmodifieddate\":\"2026-04-20T13:54:20.251Z\",\"lastname\":\"Jangid\",\"lifecyclestage\":\"opportunity\",\"phone\":\"+916353843900\"}]"
- text: ✓ Ground truth active — Layers 2, 3 + 9 will run
- button "Clear"
- text: TEST FILE
- button "▼ Format guide"
- img
- text: hubspot_contacts.csv 3 rows loaded
- button "Change"
- text: REFERENCE DOCUMENT optional · applies to all rows · enables grounding
- img
- text: Upload or paste a reference document Applies to all rows · enables RAG grounding layer · .txt .pdf .doc .docx .md · max 5MB AI RESPONSE SOURCE Where should AI responses come from?
- img
- text: Generate demo response Claude Haiku generates a realistic but flawed response per record — perfect for testing Grounded.
- img
- text: Use registered agent Fire each record at your AI agent endpoint. Tests real responses from your production system. PREVIEW — 3 rows
- img
- text: "AI RESPONSES WILL BE AUTO-GENERATED Ground truth is loaded from HubSpot. Grounded will generate a test AI response for each row at run time and score it against the actual CRM data — no manual responses needed. # QUESTION AI RESPONSE 1 What is the job title of Maria Johnson (Sample Contact)? Auto-generated 2 What is the job title of Brian Halligan (Sample Contact)? Auto-generated 3 What is the job title of Manohar Jangid? Auto-generated RUNNING BULK AUDIT 1/3 85 GR-4 3 STATUS Running… 1/3 tests complete ACTIVE LAYERS KNOWLEDGE BASE ACTIVE 6 docs applied to all 3 rows CRM GROUND TRUTH ACTIVE HubSpot data loaded — Layers 2, 3 + 9 verify AI claims against actual CRM records Consistency Doc grounding RAG Citation Confidence audit Model consensus Semantic drift Domain rules Custom rules Structured data Source attribution"
- button "Running 1/3…" [disabled]
- text: Global reference doc and CRM data apply to every row. Per-row ref_doc in CSV takes precedence.
- alert
```

```
Error: browserContext.close: Target page, context or browser has been closed
```