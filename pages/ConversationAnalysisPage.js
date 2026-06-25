import path from 'path';

import { expect } from '@playwright/test';

import { captureFullPageScreenshot } from '../utils/screenshotHelper.js';

import { saveJsonResult } from '../utils/resultWriter.js';

/**
 * Page object for Conversation Analysis flows, including reference-document
 * uploads, transcript entry, validation checks, and evidence capture.
 */
export class ConversationAnalysisPage {
    constructor(page) {
        this.page = page;

        this.skipButton = page.getByRole('button', {
            name: /Skip/i
        });

        this.conversationButton = page.getByRole('button', {
            name: /^Conversation$/i
        });

        this.conversationNavFallback = page.getByText(/^Conversation$/i).first();

        this.conversationNameTextbox = page.getByRole('textbox', {
            name: /e\.g\.\s*Support Chatbot Test/i
        });

        this.referenceDocumentSection = page
            .getByText(/TXT\s*·\s*PDF\s*·\s*MD\s*·\s*CSV\s*·\s*JSON/i)
            .first();

        this.transcriptTextbox = page.getByRole('textbox', {
            name: /User:\s*\[customer message\]/i
        });

        this.loadExampleButton = page.getByRole('button', {
            name: /Load Example/i
        });

        this.summaryCheckbox = page.getByRole('checkbox', {
            name: /Also check summary/i
        });

        this.analysisLoader = page.getByText(/Analyzing|Running|Processing|Loading/i).first();

        this.analysisResultSection = page
            .getByText(
                /What gets checked|Per-turn GR score|Cross-turn consistency|Drift detection|Summary accuracy|All standard checks|RAG validation|Overall GR score|Detection layer results|Not certified|Certified/i
            )
            .first();
    }

    /**
     * Opens the Conversation Analysis module from dashboard navigation.
     *
     * @returns {Promise<void>}
     */
    async openConversationAnalysisPage() {
        await this.page.waitForLoadState('networkidle').catch(() => {});
        await this.page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});

        if (await this.skipButton.isVisible().catch(() => false)) {
            await this.skipButton.click();
            console.log('Skip popup handled');
        }

        const navigationCandidates = [this.conversationButton, this.conversationNavFallback];

        let clicked = false;

        for (const candidate of navigationCandidates) {
            if (await candidate.isVisible({ timeout: 5000 }).catch(() => false)) {
                await candidate.scrollIntoViewIfNeeded();
                await candidate.click({ force: true });
                clicked = true;
                break;
            }
        }

        await expect(
            clicked,
            'Conversation navigation was not visible on the dashboard.'
        ).toBeTruthy();

        await this.conversationNameTextbox.waitFor({
            state: 'visible',
            timeout: 30000
        });

        console.log('Conversation Analysis page opened successfully');
    }

    /**
     * Verifies the core Conversation Analysis form fields are visible.
     *
     * @returns {Promise<void>}
     */
    async verifyPageOpened() {
        await expect(this.conversationNameTextbox).toBeVisible({
            timeout: 30000
        });

        await expect(this.referenceDocumentSection).toBeVisible({
            timeout: 30000
        });

        await expect(this.transcriptTextbox).toBeVisible({
            timeout: 30000
        });

        console.log('Conversation Analysis page fields are visible');
    }

    /**
     * Enters and verifies the conversation name.
     *
     * @param {string} conversationName - Name to enter in the form.
     * @returns {Promise<void>}
     */
    async enterConversationName(conversationName) {
        await expect(this.conversationNameTextbox).toBeVisible({
            timeout: 30000
        });

        await this.conversationNameTextbox.fill(conversationName);
        await expect(this.conversationNameTextbox).toHaveValue(conversationName);

        console.log('Conversation name entered');
    }

    /**
     * Uploads a reference document fixture for conversation grounding.
     *
     * @param {string} filePath - Fixture path relative to the project root.
     * @returns {Promise<void>}
     */
    async uploadReferenceDocument(filePath) {
        await expect(this.referenceDocumentSection).toBeVisible({
            timeout: 30000
        });

        const fileInputs = this.page.locator('input[type="file"]');
        const fileInputCount = await fileInputs.count();

        expect(
            fileInputCount,
            'Conversation Analysis did not expose a reference-document file input.'
        ).toBeGreaterThan(0);

        const fileInput = fileInputs.last();
        const resolvedFilePath = path.resolve(filePath);

        await fileInput.setInputFiles(resolvedFilePath);

        const selectedFileCount = await fileInput.evaluate((input) => input.files?.length || 0);

        expect(selectedFileCount).toBeGreaterThan(0);
        await expect(fileInput).toHaveValue(new RegExp(path.basename(filePath)));

        console.log(`Reference document uploaded: ${path.basename(filePath)}`);
    }

    /**
     * Pastes a conversation transcript and verifies it was accepted.
     *
     * @param {string} transcript - Transcript text from test data.
     * @returns {Promise<void>}
     */
    async pasteTranscript(transcript) {
        await expect(this.transcriptTextbox).toBeVisible({
            timeout: 30000
        });

        await this.transcriptTextbox.fill(transcript);
        await expect(this.transcriptTextbox).toHaveValue(transcript);

        console.log('Conversation transcript pasted');
    }

    /**
     * Clicks Load Example for Conversation Analysis.
     *
     * @returns {Promise<void>}
     */
    async clickLoadExample() {
        await expect(this.loadExampleButton).toBeVisible({
            timeout: 30000
        });

        await this.loadExampleButton.click();

        console.log('Load Example clicked');
    }

    /**
     * Waits until Load Example populates the transcript textbox.
     *
     * @returns {Promise<void>}
     */
    async verifyLoadExampleWorked() {
        await expect
            .poll(async () => (await this.transcriptTextbox.inputValue()).trim(), {
                message: 'Load Example did not populate the conversation transcript.',
                timeout: 30000
            })
            .not.toBe('');

        console.log('Load Example populated the conversation transcript');
    }

    /**
     * Verifies the supported reference-document formats are listed.
     *
     * @returns {Promise<void>}
     */
    async verifySupportedFormatsVisible() {
        await expect(this.referenceDocumentSection).toBeVisible({
            timeout: 30000
        });

        const pageText = await this.page.locator('body').innerText();

        for (const format of ['TXT', 'PDF', 'MD', 'CSV', 'JSON', 'DOCX']) {
            expect(
                pageText,
                `Supported reference-document format ${format} was not visible.`
            ).toMatch(new RegExp(`\\b${format}\\b`, 'i'));
        }

        console.log('Supported reference-document formats are visible');
    }

    /**
     * Selects the optional summary checkbox when the current UI renders it.
     *
     * @returns {Promise<boolean>} True when the checkbox was selected.
     */
    async selectSummaryCheckboxIfVisible() {
        if (!(await this.summaryCheckbox.isVisible({ timeout: 5000 }).catch(() => false))) {
            console.log('Also check summary checkbox is not available in this UI version');
            return false;
        }

        await this.summaryCheckbox.check();
        await expect(this.summaryCheckbox).toBeChecked();

        console.log('Also check summary checkbox selected');
        return true;
    }

    /**
     * Gets the current Run/Analyze button across label variants.
     *
     * @returns {import('@playwright/test').Locator} Run button locator.
     */
    getRunAnalysisButton() {
        return this.page
            .getByRole('button', {
                name: /Run analysis|Analyze conversation|Analyse conversation|Analyze|Analyse|Run|Start analysis/i
            })
            .last();
    }

    /**
     * Scrolls to the lower form area where the run button is rendered.
     *
     * @returns {Promise<void>}
     */
    async scrollToRunAnalysisButton() {
        await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await this.page.mouse.wheel(0, 2000);
    }

    /**
     * Clicks Run/Analyze, optionally accepting a disabled or absent validation state.
     *
     * @param {object} [options] - Click behavior options.
     * @param {boolean} [options.allowDisabled=false] - Whether blocked execution is valid.
     * @returns {Promise<{clicked: boolean, disabled: boolean, notRendered?: boolean}>}
     */
    async clickRunAnalysis({ allowDisabled = false } = {}) {
        // Step 1: scroll first because this button can render below the fold.
        const runButton = this.getRunAnalysisButton();

        await this.scrollToRunAnalysisButton();

        const isVisible = await runButton
            .isVisible({ timeout: allowDisabled ? 5000 : 30000 })
            .catch(() => false);

        if (!isVisible && allowDisabled) {
            console.log('Run/Analyze button is not rendered before validation, as expected');
            return {
                clicked: false,
                disabled: true,
                notRendered: true
            };
        }

        await expect(runButton).toBeVisible({
            timeout: 30000
        });

        const isEnabled = await runButton.isEnabled();

        // Step 2: validation scenarios intentionally accept a disabled run state.
        if (!isEnabled && allowDisabled) {
            console.log('Run/Analyze button is disabled before validation, as expected');
            return {
                clicked: false,
                disabled: true
            };
        }

        await expect(runButton).toBeEnabled({
            timeout: 60000
        });

        const buttonText = await runButton.innerText();
        await runButton.click();

        console.log(`${buttonText} clicked`);

        return {
            clicked: true,
            disabled: false
        };
    }

    /**
     * Waits for Conversation Analysis processing to finish.
     *
     * @returns {Promise<void>}
     */
    async waitForAnalysisCompletion() {
        const loaderVisible = await this.analysisLoader
            .isVisible({ timeout: 15000 })
            .catch(() => false);

        if (loaderVisible) {
            await this.analysisLoader.waitFor({
                state: 'hidden',
                timeout: 180000
            });
        }

        console.log('Conversation analysis processing completed');
    }

    /**
     * Verifies analysis results and captures evidence.
     *
     * @param {object} data - Current Conversation Analysis test case.
     * @param {import('@playwright/test').TestInfo} testInfo - Current test metadata.
     * @returns {Promise<void>}
     */
    async verifyAnalysisCompleted(data, testInfo) {
        const expectedResultSection = data.expectedResultText
            ? this.page.getByText(new RegExp(data.expectedResultText, 'i')).first()
            : null;

        const expectedResultVisible = expectedResultSection
            ? await expectedResultSection.isVisible({ timeout: 5000 }).catch(() => false)
            : false;

        if (!expectedResultVisible) {
            await expect(this.analysisResultSection).toBeVisible({
                timeout: 180000
            });
        }

        console.log('Conversation analysis result section is visible');

        await this.captureConversationAnalysisEvidence(
            data,
            testInfo,
            'conversation-analysis-result'
        );
    }

    /**
     * Verifies empty transcript validation or a safely blocked run attempt.
     *
     * @param {object} data - Current Conversation Analysis test case.
     * @param {object} [runAttempt={}] - Result from clickRunAnalysis.
     * @returns {Promise<void>}
     */
    async verifyEmptyTranscriptValidation(data, runAttempt = {}) {
        const validationMessage = this.page
            .getByText(new RegExp(data.expectedValidationText, 'i'))
            .first();

        const validationVisible = await validationMessage
            .isVisible({ timeout: 5000 })
            .catch(() => false);

        const nativeValidationMessage = await this.transcriptTextbox.evaluate(
            (textbox) => textbox.validationMessage || ''
        );

        const loaderVisible = await this.analysisLoader
            .isVisible({ timeout: 3000 })
            .catch(() => false);

        const resultVisible = await this.analysisResultSection
            .isVisible({ timeout: 3000 })
            .catch(() => false);

        expect(
            validationVisible ||
                Boolean(nativeValidationMessage) ||
                runAttempt.disabled === true ||
                (!loaderVisible && !resultVisible),
            'Expected a transcript validation message or a blocked Conversation Analysis run.'
        ).toBeTruthy();

        console.log('Empty transcript validation or blocked run verified');
    }

    /**
     * Captures screenshot and JSON evidence for Conversation Analysis.
     *
     * @param {object} data - Current Conversation Analysis test case.
     * @param {import('@playwright/test').TestInfo} testInfo - Current test metadata.
     * @param {string} fileNamePrefix - Logical evidence name suffix.
     * @returns {Promise<string>} Path to the consolidated result file.
     */
    async captureConversationAnalysisEvidence(data, testInfo, fileNamePrefix) {
        const screenshotPath = await captureFullPageScreenshot(
            this.page,
            testInfo,
            `${data.testCaseId}-${fileNamePrefix}`
        );

        const uiText = await this.page.locator('body').innerText();

        const resultData = {
            testCaseId: data.testCaseId,
            testCaseName: data.testCaseName,
            scenarioType: data.scenarioType,
            module: 'Conversation Analysis',
            conversationName: data.conversationName || null,
            referenceFilePath: data.referenceFilePath || null,
            expectedResultText: data.expectedResultText || null,
            screenshotPath,
            capturedAt: new Date().toISOString(),
            uiText
        };

        const resultPath = saveJsonResult(`${data.testCaseId}-${fileNamePrefix}.json`, resultData);

        await testInfo.attach(`${data.testCaseId} Conversation Analysis Evidence JSON`, {
            path: resultPath,
            contentType: 'application/json'
        });

        return resultPath;
    }
}
