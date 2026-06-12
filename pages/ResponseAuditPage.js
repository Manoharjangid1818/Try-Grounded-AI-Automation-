import { expect } from '@playwright/test';

import { captureFullPageScreenshot } from '../utils/screenshotHelper.js';

import { saveJsonResult } from '../utils/resultWriter.js';

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
            .filter({ hasText: /^response audit$/i })
            .first();


        // Get response button
        this.getResponseButton = page.getByRole('button', {
            name: /Get response/i
        });

        // Run audit button
        this.runAuditButton = page.getByRole('button', {
            name: /Run audit/i
        });

        // Audit running loader
        this.auditLoadingText = page.getByText(
            /Running 10-Layer Audit/i
        );

        // Final result screen
        this.auditResultSection = page.getByRole('button', {
            name: /Score breakdown/i
        });
    }

    async openAuditPage() {

        // Always land on dashboard (script runner may set BASE_URL)
        await this.page.goto('/dashboard');


        await this.page.waitForLoadState('networkidle');

        if (
            await this.skipButton
                .isVisible()
                .catch(() => false)
        ) {

            await this.skipButton.click();

            console.log('Skip popup handled');
        }

        await expect(this.responseAuditButton).toBeVisible({
            timeout: 30000
        });

        await this.responseAuditButton.click({
            force: true
        });

        console.log('Response Audit page opened');

        await this.page.waitForLoadState('networkidle');
    }

    async performConnectedSourceAudit(data) {

        await this.selectConnectedSource(data.source);

        await this.selectRecordType(data.recordType);

        await this.selectRecord(data.recordName);

        // Give UI time to finish rendering the record-specific actions (Get response button).
        await this.page.waitForLoadState('networkidle').catch(() => {});
        await this.page.waitForTimeout(1000);

        await this.clickGetResponse(data.getResponseButtonText);

        await this.clickRunAudit(data.runAuditButtonText);
    }

    async selectConnectedSource(sourceName) {

        const sourceOption = this.page.getByText(
            sourceName,
            {
                exact: true
            }
        );

        await expect(sourceOption).toBeVisible({
            timeout: 30000
        });

        await sourceOption.click();

        console.log(`${sourceName} selected`);
    }

    async selectRecordType(recordType) {

        const recordTypeButton = this.page.getByRole('button', {
            name: new RegExp(`^${recordType}`, 'i')
        });

        await expect(recordTypeButton).toBeVisible({
            timeout: 30000
        });

        await recordTypeButton.click();

        console.log(`${recordType} selected`);
    }

    async selectRecord(recordName) {

        const record = this.page
            .getByText(recordName, {
                exact: true
            })
            .first();

        await expect(record).toBeVisible({
            timeout: 30000
        });

        await record.click();

        console.log(`${recordName} selected`);
    }

    async clickGetResponse(getResponseButtonText) {

        // UI may re-render after selecting source/record; try multiple selector strategies.
        const textRe = new RegExp(getResponseButtonText.replace(/\s+/g, '\\s+'), 'i');

        // 1) Best: actual <button> role
        const btnByRole = this.page.getByRole('button', { name: textRe }).first();
        const isRoleVisible = await btnByRole
            .isVisible({ timeout: 8000 })
            .catch(() => false);

        if (isRoleVisible) {
            await btnByRole.scrollIntoViewIfNeeded();
            await btnByRole.click({ force: true });
            console.log('Get response clicked (role=button)');
            await this.waitForGeneratedResponse();
            return;
        }

        // 2) Fallback: click the first clickable element that matches the text anywhere.
        // Some UI variants render as non-button elements; also allow small text variations.
        const clickableByText = this.page
            .locator('text=/Get\\s*response/i')
            .first();

        // Avoid scrollIntoViewIfNeeded (can hang while layout/overlays change).
        await clickableByText.click({ force: true });

        console.log('Get response clicked (fallback by any text)');

        await this.waitForGeneratedResponse();
    }




    async waitForGeneratedResponse() {

        const generatingText = this.page.getByText(
            /Generating|Getting response|Loading/i
        );

        const isGeneratingVisible = await generatingText
            .isVisible({
                timeout: 5000
            })
            .catch(() => false);

        if (isGeneratingVisible) {

            await generatingText.waitFor({
                state: 'hidden',
                timeout: 120000
            });

            console.log('Generated response completed');
        }

        await this.page.waitForTimeout(2000);
    }

    async clickRunAudit(runAuditButtonText) {

        const runAuditButton = this.page.getByRole('button', {
            name: new RegExp(runAuditButtonText, 'i')
        });

        await expect(runAuditButton).toBeVisible({
            timeout: 30000
        });

        await expect(runAuditButton).toBeEnabled({
            timeout: 60000
        });

        await runAuditButton.click();

        console.log('Run Audit clicked');
    }

    async verifyAuditCompleted(data, testInfo) {

        const isLoaderVisible = await this.auditLoadingText
            .isVisible({
                timeout: 15000
            })
            .catch(() => false);

        if (isLoaderVisible) {

            console.log('Audit started successfully');

            await this.auditLoadingText.waitFor({
                state: 'hidden',
                timeout: 180000
            });

            console.log('Audit completed successfully');
        }

        else {

            console.log('Audit loader not visible, checking result screen');
        }

        const resultSection = this.page.getByRole('button', {
            name: new RegExp(data.expectedResultText, 'i')
        });

        await expect(resultSection).toBeVisible({
            timeout: 60000
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

        await this.page.waitForTimeout(3000);
    }
}