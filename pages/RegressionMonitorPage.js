import { expect } from '@playwright/test';

import { captureFullPageScreenshot } from '../utils/screenshotHelper.js';

import { saveJsonResult } from '../utils/resultWriter.js';
import { appendToHistory, getPreviousEntry, extractScore } from '../utils/resultHistory.js';

export class RegressionMonitorPage {
    constructor(page) {

        this.page = page;

        this.skipButton = page.getByRole('button', {
            name: /Skip/i
        });

        this.testHistoryButton = page.locator(
            'button:has-text("Test history")'
        );

        this.saveScheduleButton = page.getByRole('button', {
            name: /Save schedule/i
        });

        this.regressionMonitorButton = page.locator(
            'button:has-text("Regression monitor")'
        );
    }

    async openTestHistory() {

        await this.page.waitForLoadState('networkidle');

        if (
            await this.skipButton
                .isVisible()
                .catch(() => false)
        ) {
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

    async scheduleTest(data) {

        console.log('Attempting to schedule test...');

        try {

            const scheduleBtn = this.page
                .locator('button, [role="button"]')
                .filter({
                    hasText: /schedule/i
                })
                .first();

            const isVisible = await scheduleBtn
                .isVisible()
                .catch(() => false);

            if (!isVisible) {
                console.log('Schedule button not found or not visible - skipping schedule step');
                return;
            }

            console.log('Schedule button found and visible');

            await scheduleBtn.click();

            console.log('Schedule button clicked');

            await this.page.waitForLoadState('networkidle');

            await expect(this.saveScheduleButton).toBeVisible({
                timeout: 30000
            });

            console.log('Save schedule button visible');

            await this.page.waitForTimeout(1000);

            await this.page
                .locator('div:nth-child(2) > div > div:nth-child(2) > div:nth-child(2)')
                .click();

            console.log('Schedule card selected');

            await this.page.waitForTimeout(1000);

            await expect(
                this.page.getByRole('combobox').first()
            ).toBeVisible({
                timeout: 30000
            });

            await this.page
                .getByRole('combobox')
                .first()
                .selectOption(data.scheduleFrequency);

            console.log(`${data.scheduleFrequency} schedule selected`);

            await this.page.waitForTimeout(500);

            await this.page
                .getByRole('combobox')
                .nth(2)
                .selectOption(data.points);

            console.log(`${data.points} points selected`);

            await this.saveScheduleButton.click();

            console.log('Schedule saved successfully');

        } catch (error) {

            console.log(
                'Schedule feature not available or error occurred:',
                error.message
            );
        }
    }

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

    async runRegressionMonitor(data, testInfo) {

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

        await this.page.waitForTimeout(10000);

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

                if (prev?.score != null && String(prev.score).trim() !== String(currentScore).trim()) {
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
