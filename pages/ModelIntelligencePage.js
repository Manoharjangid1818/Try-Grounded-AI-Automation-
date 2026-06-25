import { expect } from '@playwright/test';

import { captureFullPageScreenshot } from '../utils/screenshotHelper.js';

import { saveJsonResult } from '../utils/resultWriter.js';
import { appendToHistory, getPreviousEntry, extractScore } from '../utils/resultHistory.js';

/**
 * Page object for Model Intelligence comparison setup and result evidence.
 */
export class ModelIntelligencePage {
    constructor(page) {
        this.page = page;

        this.skipButton = page.getByRole('button', {
            name: /Skip/i
        });

        this.modelIntelligenceButton = page.getByRole('button', {
            name: /Model Intelligence/i
        });

        this.auditDropdown = page.getByRole('combobox');

        this.runComparisonButton = page.getByRole('button', {
            name: /Run Comparison/i
        });
    }

    /**
     * Opens the Model Intelligence module from the dashboard.
     *
     * @returns {Promise<void>}
     */
    async openModelIntelligence() {
        await this.page.waitForLoadState('networkidle');

        if (await this.skipButton.isVisible().catch(() => false)) {
            await this.skipButton.click();

            console.log('Skip popup handled');
        }

        await expect(this.modelIntelligenceButton).toBeVisible({
            timeout: 30000
        });

        await this.modelIntelligenceButton.click({
            force: true
        });

        console.log('Model Intelligence page opened');
    }

    /**
     * Selects the model and audit run used for comparison.
     *
     * @param {object} data - One test case object from data/modelIntelligence.data.json.
     * @returns {Promise<void>}
     */
    async configureComparison(data) {
        // Step 1: choose the model option from the rendered card/list.
        const modelOption = this.page
            .locator('div')
            .filter({
                hasText: new RegExp(`^${data.modelName.replace('.', '\\.')}$`)
            })
            .nth(1);

        await expect(modelOption).toBeVisible({
            timeout: 30000
        });

        await modelOption.click();

        console.log(`${data.modelName} selected`);

        // Step 2: choose the audit result from the comparison dropdown.
        await expect(this.auditDropdown).toBeVisible({
            timeout: 30000
        });

        await this.auditDropdown.selectOption(data.auditName);

        console.log(`${data.auditName} selected`);
    }

    /**
     * Verifies comparison readiness state and captures evidence.
     *
     * @param {object} data - Current Model Intelligence test case.
     * @param {import('@playwright/test').TestInfo} testInfo - Current test metadata.
     * @returns {Promise<void>}
     */
    async verifyRunComparisonButton(data, testInfo) {
        await expect(this.runComparisonButton).toBeVisible({
            timeout: 30000
        });

        console.log('Run Comparison button visible');

        const disabled = await this.runComparisonButton.isDisabled();

        console.log(`Run Comparison disabled: ${disabled}`);

        const screenshotPath = await captureFullPageScreenshot(
            this.page,
            testInfo,
            `${data.testCaseId}-model-intelligence-result`
        );

        const uiText = await this.page.locator('body').innerText();

        const resultData = {
            testCaseId: data.testCaseId,
            testCaseName: data.testCaseName,
            module: 'Model Intelligence',
            modelName: data.modelName,
            auditName: data.auditName,
            runComparisonDisabled: disabled,
            screenshotPath,
            capturedAt: new Date().toISOString(),
            uiText
        };

        const resultPath = saveJsonResult(
            `${data.testCaseId}-model-intelligence-result.json`,
            resultData
        );

        await testInfo.attach('Model Intelligence UI Result JSON', {
            path: resultPath,
            contentType: 'application/json'
        });

        // Persist result history + optional GR drift warning (informational by default)
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

                    console.warn(msg);

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
}
