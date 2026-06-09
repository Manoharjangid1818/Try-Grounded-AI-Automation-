import { expect } from '@playwright/test';

import { captureFullPageScreenshot } from '../utils/screenshotHelper.js';

import { saveJsonResult } from '../utils/resultWriter.js';

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

    async openQuickTestsPage() {

        await this.page.waitForLoadState('networkidle');

        if (
            await this.skipButton
                .isVisible()
                .catch(() => false)
        ) {
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

    async verifyQuickTestCompleted(data, testInfo) {

        console.log('Waiting for suite completion');

        const resultCard = this.page
            .getByText(
                new RegExp(data.expectedResultPattern, 'i')
            )
            .first();

        await expect(resultCard).toBeVisible({
            timeout: 300000
        });

        console.log('Suite execution completed');

        await resultCard.click();

        console.log('Result opened successfully');

        const screenshotPath = await captureFullPageScreenshot(
            this.page,
            testInfo,
            `${data.testCaseId}-quick-tests-result`
        );

        const uiText = await this.page.locator('body').innerText();

        const resultData = {
            testCaseId: data.testCaseId,
            testCaseName: data.testCaseName,
            module: 'Quick Tests',
            expectedResultPattern: data.expectedResultPattern,
            screenshotPath,
            capturedAt: new Date().toISOString(),
            uiText
        };

        const resultPath = saveJsonResult(
            `${data.testCaseId}-quick-tests-result.json`,
            resultData
        );

        await testInfo.attach('Quick Tests UI Result JSON', {
            path: resultPath,
            contentType: 'application/json'
        });

        await this.page.waitForTimeout(3000);
    }
}