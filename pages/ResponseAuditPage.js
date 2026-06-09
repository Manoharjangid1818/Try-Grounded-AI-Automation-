import { expect } from '@playwright/test';

import { captureFullPageScreenshot } from '../utils/screenshotHelper.js';

import { saveJsonResult } from '../utils/resultWriter.js';

export class ResponseAuditPage {

    constructor(page) {

        this.page = page;

        this.skipButton = page.getByRole('button', {
            name: 'Skip →'
        });

        this.responseAuditButton = page.getByRole('button', {
            name: 'Response Audit'
        });

        this.pasteManuallyOption = page.getByText('Paste manually');

        this.questionTextbox = page.getByRole('textbox', {
            name: 'What was the AI asked? Paste'
        });

        this.aiResponseTextbox = page.getByRole('textbox', {
            name: 'Paste the AI response to'
        });

        this.expectedTextbox = page.getByRole('textbox', {
            name: 'Type the known-correct'
        });

        this.runAuditButton = page.getByRole('button', {
            name: 'Run audit →'
        });

        this.auditLoadingText = page.getByText(
            /Running 10-Layer Audit/i
        );

        this.auditResultSection = page.getByRole('button', {
            name: 'Score breakdown'
        });
    }

    async openAuditPage() {

        await this.page.goto('/');

        await this.page.waitForLoadState('networkidle');

        try {

            await this.skipButton.waitFor({
                state: 'visible',
                timeout: 5000
            });

            await this.skipButton.click();

            console.log('Skip popup handled');

        } catch {

            console.log('Skip popup not visible');
        }

        await this.responseAuditButton.click();

        await this.page.waitForLoadState('networkidle');

        await this.pasteManuallyOption.click();

        console.log('Paste manually selected');
    }

    async performAudit(question, aiResponse, expectedResponse) {

        await this.questionTextbox.waitFor({
            state: 'visible',
            timeout: 10000
        });

        await this.questionTextbox.fill(question);

        console.log('Question entered');

        await this.page.waitForTimeout(1000);

        await this.aiResponseTextbox.fill(aiResponse);

        console.log('AI response entered');

        await this.page.waitForTimeout(1000);

        await this.expectedTextbox.fill(expectedResponse);

        console.log('Expected response entered');

        await this.page.waitForTimeout(1000);

        await this.runAuditButton.waitFor({
            state: 'visible',
            timeout: 10000
        });

        await this.runAuditButton.click();

        console.log('Run Audit clicked');
    }

    async verifyAuditCompleted(data, testInfo) {

        await expect(this.auditLoadingText).toBeVisible({
            timeout: 15000
        });

        console.log('Audit started successfully');

        await this.auditLoadingText.waitFor({
            state: 'hidden',
            timeout: 120000
        });

        console.log('Audit completed successfully');

        await expect(this.auditResultSection).toBeVisible({
            timeout: 30000
        });

        console.log('Result screen visible');

        const screenshotPath = await captureFullPageScreenshot(
            this.page,
            testInfo,
            `${data.testCaseId}-response-audit-result`
        );

        const uiText = await this.page.locator('body').innerText();

        const resultData = {
            testCaseId: data.testCaseId,
            testCaseName: data.testCaseName,
            module: 'Response Audit',
            question: data.question,
            aiResponse: data.aiResponse,
            expectedResponse: data.expectedResponse,
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

        await this.page.waitForTimeout(3000);
    }
}