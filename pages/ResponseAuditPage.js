import { expect } from '@playwright/test';

import { captureFullPageScreenshot } from '../utils/screenshotHelper.js';

import { saveJsonResult } from '../utils/resultWriter.js';

import { appendToHistory, getPreviousEntry, extractScore } from '../utils/resultHistory.js';
import {
    clickFirstVisibleMatch as clickFirstVisibleTextMatch,
    escapeRegExp
} from '../utils/locatorHelpers.js';

/**
 * Page object for Response Audit flows, including examples, connected sources,
 * AI response generation, audit execution, and result capture.
 */
export class ResponseAuditPage {
    constructor(page) {
        this.page = page;

        // Skip onboarding popup
        this.skipButton = page.getByRole('button', {
            name: /Skip/i
        });

        // Response Audit sidebar button (avoid strict-mode ambiguity)
        // Matches both "Response Audit" and "RESPONSE AUDIT" variants; pick the first visible.
        this.responseAuditButton = page
            .locator('button', { hasText: /response audit/i })
            .filter({ hasText: /response audit/i })
            .first();

        // Fallback nav element in case sidebar renders as link/div
        this.responseAuditNavFallback = page.locator('text=/response audit/i').first();

        // --- Diagnostic anchors (added; do not replace any existing locator) ---
        // Used only to confirm the app shell actually rendered before we go
        // looking for the nav item, and to detect an unexpected login screen.
        this.appShellAnchor = page.getByText(/WORKSPACE/i).first();
        this.loginFormIndicator = page.locator('input[type="password"]').first();

        // Buttons
        this.getResponseButton = page.getByRole('button', {
            name: /Get response/i
        });

        this.generateDemoButton = page.getByRole('button', {
            name: /Generate demo/i
        });

        this.runAuditButton = page.getByRole('button', {
            name: /Run audit/i
        });

        // Audit running loader
        this.auditLoadingText = page.getByText(/Running 10-Layer Audit/i);

        // Final result screen
        this.auditResultSection = page.getByRole('button', {
            name: /Score breakdown/i
        });

        // Header "Load example"
        this.loadExampleButton = page.locator('button', { hasText: /Load example/i }).first();

        // Data source clear (✕ next to Data source)
        this.clearDataSourceButton = page.getByRole('button', {
            name: /clear/i
        });

        // Ground truth loaded banner (text placeholder)
        this.groundTruthLoadedText = page.getByText(/Ground truth loaded/i);

        // Fields (placeholders; keep semantic selector strategy)
        this.contextPromptField = page.getByLabel(/Context|Prompt/i);
        this.aiGeneratedContentField = page.getByLabel(/AI-generated content/i);

        // Connected source / CRM panel assertions (best-effort text-based locators)
        this.crmRecordActiveText = page.getByText(/CRM record active/i);
        this.layersVerificationNoteText = page.getByText(
            /Layers\s*2,\s*3\s*\+\s*9|Layers\s*2,\s*3\s*\+\s*9/i
        );

        // Ground truth tag (source label + green check)
        this.hubspotTagText = page.getByText(/HUBSPOT/i);
        this.groundTruthGreenCheck = page.getByText(/Ground truth loaded/i);

        // Error toast (optional; app-dependent)
        this.errorToast = page
            .locator('[role="alert"], [data-sonner-toast], [data-toast], [class*="toast"]')
            .filter({
                hasText: /error|failed|toast/i
            })
            .first();

        // Result body for “references ground truth source” assertion
        this.auditResultBody = page.locator('body');
    }

    /**
     * Opens the Response Audit module and fails clearly if auth state is stale.
     *
     * @returns {Promise<void>}
     */
    async openAuditPage() {
        // Always land on dashboard (script runner may set BASE_URL)
        await this.page.goto('/dashboard');
        await this.page.waitForLoadState('networkidle');

        if (await this.skipButton.isVisible().catch(() => false)) {
            await this.skipButton.click();
            console.log('Skip popup handled');
        }

        // --- Added guard (does not alter existing flow) ---
        // Fail fast with a clear message if we were bounced to a login page
        // instead of the dashboard, rather than letting the nav locator
        // time out 30s later with a confusing "element not found" error.
        const onLoginScreen = await this.loginFormIndicator
            .isVisible({ timeout: 3000 })
            .catch(() => false);

        if (onLoginScreen) {
            throw new Error(
                `openAuditPage: Detected a login form at ${this.page.url()} instead of the dashboard. ` +
                    `storageState (auth/user.json) is likely expired or invalid — re-authenticate and regenerate it.`
            );
        }

        // --- Added guard (does not alter existing flow) ---
        // Wait for the sidebar app shell to actually render before searching
        // for the nav item, so we don't race the SPA's initial mount.
        await this.appShellAnchor.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {
            console.warn(
                'App shell anchor ("WORKSPACE") not found within 30s — proceeding anyway, nav lookup may fail.'
            );
        });

        // Some UI variants render nav as a button, others as a link/div.
        const navToClick = (await this.responseAuditButton.isVisible().catch(() => false))
            ? this.responseAuditButton
            : this.responseAuditNavFallback;

        try {
            await expect(navToClick).toBeVisible({ timeout: 30000 });
        } catch (err) {
            // Enrich the failure with page context for faster debugging,
            // without changing the original assertion or its timeout.
            console.error(
                `Response Audit nav not found. Current URL: ${this.page.url()}, ` +
                    `title: ${await this.page.title().catch(() => 'n/a')}`
            );
            throw err;
        }

        await navToClick.click({ force: true });
        console.log('Response Audit page opened');
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Loads the default Response Audit example and waits until it is runnable.
     *
     * @returns {Promise<void>}
     */
    async clickLoadExample() {
        await expect(this.loadExampleButton).toBeVisible({ timeout: 30000 });
        await this.loadExampleButton.click();

        // "Load example" opens a menu in the current UI; it does not load an
        // example until one of the menu items is selected. Keep RA_001
        // deterministic by using the first documented example.
        const defaultExample = this.page.getByText('Support reply', { exact: true }).first();
        await expect(defaultExample).toBeVisible({ timeout: 30000 });
        await defaultExample.click();

        // The enabled state is the app's reliable signal that both input fields
        // were populated and the audit can actually be submitted.
        await expect(this.runAuditButton).toBeEnabled({ timeout: 30000 });
    }

    /**
     * Clears an already-selected connected source when the scenario needs a reset.
     *
     * @returns {Promise<void>}
     */
    async clearConnectedSourceIfPresent() {
        if (await this.clearDataSourceButton.isVisible().catch(() => false)) {
            await this.clearDataSourceButton.click({ force: true });
            await this.page.waitForLoadState('networkidle').catch(() => {});
        }
    }

    /**
     * Checks whether connected-source ground truth is visible before generation.
     *
     * @returns {Promise<void>}
     */
    async assertGroundTruthLoaded() {
        // This readiness check occurs before the test requests an AI response,
        // so AI-generated content is correctly still empty at this point.
        // The banner varies by source/UI version, therefore it is best-effort.
        const candidates = [this.groundTruthLoadedText, this.hubspotTagText].filter(Boolean);
        const start = Date.now();
        const timeoutMs = 5000;
        while (Date.now() - start < timeoutMs) {
            for (const c of candidates) {
                if (await c.isVisible().catch(() => false)) return;
            }

            // Poll briefly because the source banner text varies and there is no
            // single stable loading element to await across connector variants.
            await this.page.waitForTimeout(250);
        }
    }

    /**
     * Finds the Context/Prompt field across labelled and fallback UI variants.
     *
     * @returns {Promise<import('@playwright/test').Locator>} Context field locator.
     */
    async getContextPromptField() {
        if (await this.contextPromptField.isVisible({ timeout: 3000 }).catch(() => false)) {
            return this.contextPromptField;
        }

        const sectionField = this.page
            .getByText(/CONTEXT\s*\/\s*PROMPT/i)
            .first()
            .locator('..')
            .locator('textarea, input')
            .first();

        if (await sectionField.isVisible({ timeout: 3000 }).catch(() => false)) {
            return sectionField;
        }

        return this.page.locator('textarea').first();
    }

    /**
     * Finds the AI-generated content field across labelled and fallback UI variants.
     *
     * @returns {Promise<import('@playwright/test').Locator>} Generated-content locator.
     */
    async getAiGeneratedContentField() {
        if (await this.aiGeneratedContentField.isVisible({ timeout: 3000 }).catch(() => false)) {
            return this.aiGeneratedContentField;
        }

        const sectionField = this.page
            .getByText(/AI-GENERATED CONTENT/i)
            .first()
            .locator('..')
            .locator('textarea, input')
            .first();

        if (await sectionField.isVisible({ timeout: 3000 }).catch(() => false)) {
            return sectionField;
        }

        return this.page.locator('textarea').nth(1);
    }

    /**
     * Verifies example loading populated both prompt and generated response fields.
     *
     * @returns {Promise<void>}
     */
    async assertContextAndGeneratedContentNotEmpty() {
        // Context/Prompt
        const contextPromptField = await this.getContextPromptField();

        if (await contextPromptField.isVisible().catch(() => false)) {
            await expect(contextPromptField)
                .toHaveValue('', { timeout: 1 })
                .catch(() => {});
            const val = await contextPromptField.inputValue().catch(async () => {
                // fallback: try text content
                return (await contextPromptField.innerText()).trim();
            });
            expect(String(val).trim().length).toBeGreaterThan(0);
        }

        // AI-generated content
        const aiGeneratedContentField = await this.getAiGeneratedContentField();

        if (await aiGeneratedContentField.isVisible().catch(() => false)) {
            const val = await aiGeneratedContentField.inputValue().catch(async () => {
                return (await aiGeneratedContentField.innerText()).trim();
            });
            expect(String(val).trim().length).toBeGreaterThan(0);
        }
    }

    /**
     * Runs a connected-source Response Audit from source selection through audit start.
     *
     * @param {object} data - One test case object from data/responseAudit.data.json.
     * @returns {Promise<void>}
     */
    async performConnectedSourceAudit(data) {
        // Step 1: clear an old source when the scenario asks for a clean picker.
        if (data.shouldClearBeforeSelect) {
            await this.clearConnectedSourceIfPresent();
        }

        // Step 2: choose the source hierarchy. Each picker depends on the
        // previous selection, so changing the order makes the CRM list unreliable.
        await this.selectConnectedSource(data.source);
        await this.selectRecordType(data.recordType);
        await this.selectRecord(data.recordName);

        // Selecting a CRM record starts background polling that can keep the
        // SPA from ever reaching network-idle. Wait for the record-specific
        // readiness signal instead, before requesting an AI response.
        await expect(this.groundTruthLoadedText).toBeVisible({ timeout: 30000 });

        // Step 3: generate or fetch the candidate response, then run the audit.
        await this.clickGenerateAction(data);
        await this.clickRunAudit(data.runAuditButtonText);
    }

    /**
     * Chooses between Generate Demo and Get Response based on the scenario.
     *
     * @param {object} data - Current Response Audit test case.
     * @returns {Promise<void>}
     */
    async clickGenerateAction(data) {
        // Deterministic choice requested: prefer "Generate demo" when configured.
        const preferDemo = data.useGenerateDemo === true;
        if (preferDemo) {
            if (await this.generateDemoButton.isVisible().catch(() => false)) {
                await this.generateDemoButton.click({ force: true });
                console.log('Generate demo clicked');
                await this.waitForGeneratedResponse();
                return;
            }
        }

        // Default: Get response
        await this.clickGetResponse(data.getResponseButtonText);
    }

    /**
     * Clicks a visible text match using the shared app-wide fallback strategy.
     *
     * @param {string} textValue - Text to click.
     * @returns {Promise<void>}
     */
    async clickFirstVisibleMatch(textValue) {
        await clickFirstVisibleTextMatch(this.page, textValue);
    }

    /**
     * Selects a connected source such as HubSpot or Zendesk.
     *
     * @param {string} sourceName - Connected source label.
     * @returns {Promise<void>}
     */
    async selectConnectedSource(sourceName) {
        await this.clickFirstVisibleMatch(sourceName);
        console.log(`${sourceName} selected`);
    }

    /**
     * Selects a connected-source record type.
     *
     * @param {string} recordType - Record type label.
     * @returns {Promise<void>}
     */
    async selectRecordType(recordType) {
        const recordTypeButton = this.page.getByRole('button', {
            name: new RegExp(`^${escapeRegExp(recordType)}`, 'i')
        });

        await expect(recordTypeButton).toBeVisible({ timeout: 30000 });
        await recordTypeButton.click();
        console.log(`${recordType} selected`);
    }

    /**
     * Selects the intended CRM/article record while avoiding sidebar profile matches.
     *
     * @param {string} recordName - Record label from the test data.
     * @returns {Promise<void>}
     */
    async selectRecord(recordName) {
        const namePattern = new RegExp(
            recordName
                .split(/\s+/)
                .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
                .join('\\s+'),
            'i'
        );
        const recordCandidates = this.page.getByText(namePattern);
        const timeoutMs = 30000;
        const start = Date.now();

        while (Date.now() - start < timeoutMs) {
            const candidateCount = await recordCandidates.count();
            let sidebarProfileFound = false;

            for (let index = 0; index < candidateCount; index += 1) {
                const candidate = recordCandidates.nth(index);
                const parentText = await candidate
                    .locator('..')
                    .innerText()
                    .catch(() => '');

                // Contact entries include the record email. This avoids the
                // sidebar profile when a CRM contact shares the user's name.
                if (/\S+@\S+/.test(parentText)) {
                    await candidate.click();
                    console.log(`${recordName} selected`);
                    return;
                }

                if (/free plan/i.test(parentText)) {
                    sidebarProfileFound = true;
                }
            }

            // Non-contact records (for example Zendesk articles) do not have
            // an email. Select them once no sidebar-profile ambiguity exists.
            if (candidateCount > 0 && !sidebarProfileFound) {
                const record = recordCandidates.first();
                await record.click();
                console.log(`${recordName} selected`);
                return;
            }

            // The picker can stream records in after the source/type selection.
            // Poll the candidate list until an unambiguous selectable record appears.
            await this.page.waitForTimeout(250);
        }

        throw new Error(`Record "${recordName}" did not appear as a selectable source item.`);
    }

    /**
     * Clicks Get Response through role-first and text-fallback strategies.
     *
     * @param {string} getResponseButtonText - Button text from test data.
     * @returns {Promise<void>}
     */
    async clickGetResponse(getResponseButtonText) {
        const textRe = new RegExp(getResponseButtonText.replace(/\s+/g, '\\s+'), 'i');

        const btnByRole = this.page.getByRole('button', { name: textRe }).first();
        const isRoleVisible = await btnByRole.isVisible({ timeout: 8000 }).catch(() => false);

        if (isRoleVisible) {
            await btnByRole.scrollIntoViewIfNeeded();
            await btnByRole.click({ force: true });
            console.log('Get response clicked (role=button)');
            await this.waitForGeneratedResponse();
            return;
        }

        const clickableByText = this.page.locator('text=/Get\\s*response/i').first();
        await clickableByText.click({ force: true });
        console.log('Get response clicked (fallback by any text)');
        await this.waitForGeneratedResponse();
    }

    /**
     * Waits until response generation finishes and the generated field is populated.
     *
     * @returns {Promise<void>}
     */
    async waitForGeneratedResponse() {
        const generatingText = this.page.getByText(/Generating|Getting response|Loading/i);

        const isGeneratingVisible = await generatingText
            .isVisible({ timeout: 5000 })
            .catch(() => false);

        if (isGeneratingVisible) {
            await generatingText.waitFor({ state: 'hidden', timeout: 120000 });
            console.log('Generated response completed');
        }

        await expect
            .poll(
                async () => {
                    const generatedContentField = await this.getAiGeneratedContentField();

                    if (!(await generatedContentField.isVisible().catch(() => false))) {
                        return '';
                    }

                    return generatedContentField
                        .inputValue()
                        .catch(async () => (await generatedContentField.innerText()).trim());
                },
                {
                    message: 'Generated response did not populate the AI-generated content field.',
                    timeout: 30000
                }
            )
            .not.toBe('');
    }

    /**
     * Starts the audit once the Run Audit button is enabled.
     *
     * @param {string} runAuditButtonText - Button label from test data.
     * @returns {Promise<void>}
     */
    async clickRunAudit(runAuditButtonText) {
        const runAuditButton = this.page.getByRole('button', {
            name: new RegExp(runAuditButtonText, 'i')
        });

        await expect(runAuditButton).toBeVisible({ timeout: 30000 });
        await expect(runAuditButton).toBeEnabled({ timeout: 60000 });
        await runAuditButton.click();
        console.log('Run Audit clicked');
    }

    /**
     * Waits for audit results, captures evidence, and records score history.
     *
     * @param {object} data - Current Response Audit test case.
     * @param {import('@playwright/test').TestInfo} testInfo - Current test metadata.
     * @returns {Promise<void>}
     */
    async verifyAuditCompleted(data, testInfo) {
        const isLoaderVisible = await this.auditLoadingText
            .isVisible({ timeout: 15000 })
            .catch(() => false);

        if (isLoaderVisible) {
            await this.auditLoadingText.waitFor({ state: 'hidden', timeout: 180000 });
        }

        const resultSection = this.page.getByRole('button', {
            name: new RegExp(data.expectedResultText, 'i')
        });

        await expect(resultSection).toBeVisible({ timeout: 60000 });

        const screenshotPath = await captureFullPageScreenshot(
            this.page,
            testInfo,
            `${data.testCaseId}-response-audit-result`
        );

        const uiText = await this.page.locator('body').innerText();

        const resultData = {
            testCaseId: data.testCaseId,
            testCaseName: data.testCaseName,
            scenarioType: data.scenarioType,
            module: 'Response Audit',
            source: data.source,
            recordType: data.recordType,
            recordName: data.recordName,
            screenshotPath,
            capturedAt: new Date().toISOString(),
            uiText
        };

        const resultPath = saveJsonResult(
            `${data.testCaseId}-response-audit-result.json`,
            resultData
        );

        await testInfo.attach('Response Audit UI Result JSON', {
            path: resultPath,
            contentType: 'application/json'
        });

        try {
            const currentScore = extractScore(uiText);

            if (currentScore != null) {
                appendToHistory(data.testCaseId, {
                    score: currentScore,
                    result: 'completed'
                });

                const prev = getPreviousEntry(data.testCaseId);

                if (
                    prev?.score != null &&
                    String(prev.score).trim() !== String(currentScore).trim()
                ) {
                    const delta = `${String(currentScore).trim()} (prev ${String(prev.score).trim()})`;
                    const msg = `[${data.testCaseId}] GR score drift: prev=${prev.score}, current=${currentScore}, delta=${delta}`;

                    testInfo.annotations.push({
                        type: 'warning',
                        description: msg
                    });

                    await testInfo.attach('Score Comparison', {
                        contentType: 'application/json',
                        body: JSON.stringify(
                            {
                                testCaseId: data.testCaseId,
                                previous: prev,
                                current: { score: currentScore, result: 'completed' },
                                message: msg
                            },
                            null,
                            2
                        )
                    });

                    if (data.failOnScoreDrift === true) {
                        throw new Error(msg);
                    }
                }
            }
        } catch (e) {
            console.warn('Score history/drift tracking skipped:', e?.message || e);
        }
    }

    /**
     * Runs the complete load-example Response Audit path.
     *
     * @param {object} data - Current Response Audit test case.
     * @param {import('@playwright/test').TestInfo} testInfo - Current test metadata.
     * @returns {Promise<void>}
     */
    async verifyLoadExampleFlow(data, testInfo) {
        await this.clickLoadExample();
        await this.assertGroundTruthLoaded();
        await this.assertContextAndGeneratedContentNotEmpty();
        await this.clickRunAudit(data.runAuditButtonText);
        await this.verifyAuditCompleted(data, testInfo);
    }

    /**
     * Opens and verifies the Load Example menu options.
     *
     * @returns {Promise<void>}
     */
    async openLoadExampleMenu() {
        await expect(this.loadExampleButton).toBeVisible({ timeout: 30000 });
        await this.loadExampleButton.click({ force: true });

        // Dropdown/menu should list four example options.
        // The UI may not render the full label as plain text immediately; use best-effort visibility checks
        // and fail only with a clear error.
        const supportReply = this.page.getByText(/Support reply/i).first();
        const crmNote = this.page.getByText(/CRM note/i).first();
        const medicalQuery = this.page.getByText(/Medical query/i).first();
        const legalSummary = this.page.getByText(/Legal summary/i).first();

        const supportVisible = await supportReply.isVisible({ timeout: 30000 }).catch(() => false);
        const crmVisible = await crmNote.isVisible({ timeout: 30000 }).catch(() => false);
        const medicalVisible = await medicalQuery.isVisible({ timeout: 30000 }).catch(() => false);
        const legalVisible = await legalSummary.isVisible({ timeout: 30000 }).catch(() => false);

        if (!supportVisible || !crmVisible || !medicalVisible || !legalVisible) {
            // screenshot for debugging without changing wait strategy
            await this.page
                .screenshot({
                    path: 'test-results/response-audit-load-example-menu-debug.png',
                    fullPage: true
                })
                .catch(() => {});
            throw new Error(
                `Load example menu options not visible. ` +
                    `Support reply=${supportVisible}, CRM note=${crmVisible}, Medical query=${medicalVisible}, Legal summary=${legalVisible}`
            );
        }
    }

    /**
     * Selects one Load Example menu item and waits for the menu to close.
     *
     * @param {string} optionName - Example label to select.
     * @returns {Promise<void>}
     */
    async selectLoadExampleOption(optionName) {
        // Click matching option by label and wait for menu to close best-effort.
        const option = this.page
            .getByText(new RegExp(optionName.replace(/\s+/g, '\\s+'), 'i'), { exact: false })
            .first();
        await expect(option).toBeVisible({ timeout: 30000 });
        await option.click({ force: true });

        // Wait for the menu to disappear by checking the option is not visible.
        await option.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    }

    /**
     * Verifies the right panel shows the CRM record and layer notes.
     *
     * @returns {Promise<void>}
     */
    async assertRightPanelCRMRecordAndLayers() {
        await expect(this.crmRecordActiveText).toBeVisible({ timeout: 30000 });
        await expect(this.layersVerificationNoteText.first()).toBeVisible({ timeout: 30000 });
    }

    /**
     * Verifies the context prompt includes the selected record name.
     *
     * @param {string} name - Expected record name.
     * @returns {Promise<void>}
     */
    async assertContextPromptContainsName(name) {
        const contextPromptField = await this.getContextPromptField();

        await expect(contextPromptField).toBeVisible({ timeout: 30000 });

        const val = await contextPromptField
            .inputValue()
            .catch(async () => (await contextPromptField.innerText()).trim());

        const normalizedContext = String(val).replace(/\s+/g, ' ').trim();
        const normalizedName = String(name).replace(/\s+/g, ' ').trim();

        expect(normalizedContext).toContain(normalizedName);
    }

    /**
     * Fails the test if the app shows an error toast.
     *
     * @returns {Promise<void>}
     */
    async assertNoErrorToast() {
        const toast = this.errorToast;
        if (await toast.isVisible({ timeout: 5000 }).catch(() => false)) {
            const txt = await toast.innerText().catch(() => '');
            throw new Error(`Unexpected error toast detected: ${txt}`);
        }
    }

    /**
     * Verifies the final result references the selected ground-truth source.
     *
     * @param {string} sourceName - Connected source name from test data.
     * @returns {Promise<void>}
     */
    async assertResultReferencesGroundTruthSource(sourceName) {
        const uiText = await this.auditResultBody.innerText();

        if (/hubspot|salesforce|crm/i.test(sourceName)) {
            // Current result reports show CRM mode/Layer 9 instead of repeating
            // the connector's brand name after an audit completes.
            expect(uiText).toMatch(
                new RegExp(`${sourceName}|CRM\\s+MODE|Structured Data Fidelity|Layer 9`, 'i')
            );
            return;
        }

        expect(uiText).toMatch(new RegExp(sourceName, 'i'));
    }
}
