import { expect } from '@playwright/test';

import { captureFullPageScreenshot } from '../utils/screenshotHelper.js';

import { saveJsonResult } from '../utils/resultWriter.js';
import { appendToHistory, getPreviousEntry, extractScore } from '../utils/resultHistory.js';

/**
 * Page object for launching Quick Test suites and capturing their outcomes.
 */
export class QuickTestsPage {
    constructor(page) {
        this.page = page;

        this.skipButton = page.getByRole('button', {
            name: /Skip/i
        });

        this.quickTestsButton = page.getByRole('button', {
            name: /Quick Tests DEV/i
        });
    }

    /**
     * Opens the Quick Tests module from the dashboard.
     *
     * @returns {Promise<void>}
     */
    async openQuickTestsPage() {
        await this.page.waitForLoadState('networkidle');

        if (await this.skipButton.isVisible().catch(() => false)) {
            await this.skipButton.click();

            console.log('Skip popup handled');
        }

        await expect(this.quickTestsButton).toBeVisible({
            timeout: 30000
        });

        await this.quickTestsButton.scrollIntoViewIfNeeded();

        await this.quickTestsButton.click({
            force: true
        });

        console.log('Quick Tests page opened successfully');

        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Starts one Quick Test suite by its configured index.
     *
     * @param {object} data - One test case object from data/quickTests.data.json.
     * @returns {Promise<void>}
     */
    async runQuickTestSuite(data) {
        const runSuiteButton = this.page
            .getByRole('button', {
                name: /Run Suite/i
            })
            .nth(data.suiteIndex);

        await expect(runSuiteButton).toBeVisible({
            timeout: 30000
        });

        await runSuiteButton.click();

        console.log('Quick Test Suite started');
    }

    /**
     * Waits for suite completion, verifies the expected result, and captures evidence.
     *
     * @param {object} data - Current Quick Tests test case.
     * @param {import('@playwright/test').TestInfo} testInfo - Current test metadata.
     * @returns {Promise<void>}
     */
    async verifyQuickTestCompleted(data, testInfo) {
        // Step 1: wait for the app's own completion text instead of sleeping.
        console.log('Waiting for suite completion');

        await expect
            .poll(async () => this.page.locator('body').innerText(), {
                message: 'Quick Test Suite did not report completion.',
                timeout: 300000
            })
            .toMatch(/Complete\s+—\s+\d+\/\d+\s+(?:passed|failed)/i);

        console.log('Suite execution completed');

        const uiText = await this.page.locator('body').innerText();

        // Step 2: compare the full page text with the scenario-specific pattern.
        expect(
            uiText,
            `Quick Test Suite did not meet the expected result: ${data.expectedResultPattern}`
        ).toMatch(new RegExp(data.expectedResultPattern, 'i'));

        // Step 3: attach screenshot/JSON evidence and record score drift if present.
        const screenshotPath = await captureFullPageScreenshot(
            this.page,
            testInfo,
            `${data.testCaseId}-quick-tests-result`
        );

        const resultData = {
            testCaseId: data.testCaseId,
            testCaseName: data.testCaseName,
            module: 'Quick Tests',
            expectedResultPattern: data.expectedResultPattern,
            screenshotPath,
            capturedAt: new Date().toISOString(),
            uiText
        };

        const resultPath = saveJsonResult(`${data.testCaseId}-quick-tests-result.json`, resultData);

        await testInfo.attach('Quick Tests UI Result JSON', {
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
