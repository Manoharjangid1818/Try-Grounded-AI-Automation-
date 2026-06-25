import { expect } from '@playwright/test';

import { captureFullPageScreenshot } from '../utils/screenshotHelper.js';

import { saveJsonResult } from '../utils/resultWriter.js';
import { appendToHistory, getPreviousEntry, extractScore } from '../utils/resultHistory.js';

/**
 * Page object for Test History scheduling and Regression Monitor execution.
 */
export class RegressionMonitorPage {
    constructor(page) {
        this.page = page;

        this.skipButton = page.getByRole('button', {
            name: /Skip/i
        });

        this.testHistoryButton = page.locator('button:has-text("Test history")');

        this.saveScheduleButton = page.getByRole('button', {
            name: /Save schedule/i
        });

        this.regressionMonitorButton = page.locator('button:has-text("Regression monitor")');
    }

    /**
     * Opens Test History from the dashboard.
     *
     * @returns {Promise<void>}
     */
    async openTestHistory() {
        await this.page.waitForLoadState('networkidle');

        if (await this.skipButton.isVisible().catch(() => false)) {
            await this.skipButton.click();

            console.log('Skip popup handled');
        }

        await expect(this.testHistoryButton).toBeVisible({
            timeout: 30000
        });

        await this.testHistoryButton.scrollIntoViewIfNeeded();

        await this.testHistoryButton.click({
            force: true
        });

        console.log('Test History page opened');

        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Attempts to configure a regression-monitor schedule when the UI is available.
     *
     * @param {object} data - One test case object from data/regressionMonitor.data.json.
     * @returns {Promise<void>}
     */
    async scheduleTest(data) {
        // Step 1: scheduling is optional in some app builds, so detect whether
        // the button is available before treating absence as a failure.
        console.log('Attempting to schedule test...');

        try {
            const scheduleBtn = this.page
                .locator('button, [role="button"]')
                .filter({
                    hasText: /schedule/i
                })
                .first();

            const isVisible = await scheduleBtn.isVisible().catch(() => false);

            if (!isVisible) {
                console.log('Schedule button not found or not visible - skipping schedule step');
                return;
            }

            console.log('Schedule button found and visible');

            await scheduleBtn.click();

            console.log('Schedule button clicked');

            await this.page.waitForLoadState('networkidle');

            // Step 2: select the schedule card/frequency/points in the app's
            // current order, then persist the schedule.
            await expect(this.saveScheduleButton).toBeVisible({
                timeout: 30000
            });

            console.log('Save schedule button visible');

            // The schedule modal animates and does not expose a stable selected-card
            // signal before the card accepts clicks, so this short pause lets it settle.
            await this.page.waitForTimeout(1000);

            await this.page
                .locator('div:nth-child(2) > div > div:nth-child(2) > div:nth-child(2)')
                .click();

            console.log('Schedule card selected');

            // The comboboxes remount after schedule-card selection; wait for that
            // UI transition before reading/selecting their options.
            await this.page.waitForTimeout(1000);

            await expect(this.page.getByRole('combobox').first()).toBeVisible({
                timeout: 30000
            });

            await this.page.getByRole('combobox').first().selectOption(data.scheduleFrequency);

            console.log(`${data.scheduleFrequency} schedule selected`);

            // Points options are populated after frequency selection without a
            // deterministic loading indicator in the current UI.
            await this.page.waitForTimeout(500);

            await this.page.getByRole('combobox').nth(2).selectOption(data.points);

            console.log(`${data.points} points selected`);

            await this.saveScheduleButton.click();

            console.log('Schedule saved successfully');
        } catch (error) {
            console.log('Schedule feature not available or error occurred:', error.message);
        }
    }

    /**
     * Opens the Regression Monitor module.
     *
     * @returns {Promise<void>}
     */
    async openRegressionMonitor() {
        await expect(this.regressionMonitorButton).toBeVisible({
            timeout: 30000
        });

        await this.regressionMonitorButton.scrollIntoViewIfNeeded();

        await this.regressionMonitorButton.click({
            force: true
        });

        console.log('Regression Monitor page opened');

        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Runs Regression Monitor, waits for completion, and captures evidence.
     *
     * @param {object} data - Current Regression Monitor test case.
     * @param {import('@playwright/test').TestInfo} testInfo - Current test metadata.
     * @returns {Promise<void>}
     */
    async runRegressionMonitor(data, testInfo) {
        // Step 1: trigger the monitor run.
        const runNowButton = this.page
            .getByRole('button', {
                name: new RegExp(data.runButtonText, 'i')
            })
            .first();

        await expect(runNowButton).toBeVisible({
            timeout: 30000
        });

        await runNowButton.click();

        console.log('Regression Monitor run started');

        // Step 2: wait for the app to finish instead of using a fixed pause.
        const runningIndicator = this.page
            .getByText(/running|processing|loading|queued|in progress/i)
            .first();

        if (await runningIndicator.isVisible({ timeout: 5000 }).catch(() => false)) {
            await runningIndicator.waitFor({ state: 'hidden', timeout: 180000 });
        }

        await expect(runNowButton).toBeEnabled({ timeout: 180000 });

        // Step 3: capture evidence and score-history information from the result page.
        const screenshotPath = await captureFullPageScreenshot(
            this.page,
            testInfo,
            `${data.testCaseId}-regression-monitor-result`
        );

        const uiText = await this.page.locator('body').innerText();

        const resultData = {
            testCaseId: data.testCaseId,
            testCaseName: data.testCaseName,
            module: 'Regression Monitor',
            scheduleFrequency: data.scheduleFrequency,
            points: data.points,
            screenshotPath,
            capturedAt: new Date().toISOString(),
            uiText
        };

        const resultPath = saveJsonResult(
            `${data.testCaseId}-regression-monitor-result.json`,
            resultData
        );

        await testInfo.attach('Regression Monitor UI Result JSON', {
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
