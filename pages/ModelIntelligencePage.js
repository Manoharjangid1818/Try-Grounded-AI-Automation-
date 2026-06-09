import { expect } from '@playwright/test';

import { captureFullPageScreenshot } from '../utils/screenshotHelper.js';

import { saveJsonResult } from '../utils/resultWriter.js';

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

    async openModelIntelligence() {

        await this.page.waitForLoadState('networkidle');

        if (
            await this.skipButton
                .isVisible()
                .catch(() => false)
        ) {
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

    async configureComparison(data) {

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

        await expect(this.auditDropdown).toBeVisible({
            timeout: 30000
        });

        await this.auditDropdown.selectOption(data.auditName);

        console.log(`${data.auditName} selected`);
    }

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

        await this.page.waitForTimeout(3000);
    }
}