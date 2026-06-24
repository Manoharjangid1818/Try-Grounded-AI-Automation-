import { expect } from '@playwright/test';

import { captureFullPageScreenshot } from '../utils/screenshotHelper.js';

import { saveJsonResult } from '../utils/resultWriter.js';
import { appendToHistory, getPreviousEntry, extractScore } from '../utils/resultHistory.js';

export class CustomRulesPage {
    constructor(page) {

        this.page = page;

        this.skipButton = page.getByRole('button', {
            name: /Skip/i
        });

        this.customRulesButton = page.getByRole('button', {
            name: /Custom rules/i
        });

        this.expectedAnswerTextbox = page.getByRole('textbox', {
            name: /KiwiQA was founded in 2010/i
        });

        this.incorrectAnswerTextbox = page.getByRole('textbox', {
            name: /KiwiQA was founded in 2020/i
        });

        this.sourceTextbox = page.getByRole('textbox', {
            name: /kiwiqa.ai\/about/i
        });

        this.addRuleButton = page.getByRole('button', {
            name: /\+ Add rule/i
        });

        this.saveButton = page.getByRole('button', {
            name: /^Save →$/i
        });

        this.saveRuleSetButton = page.getByRole('button', {
            name: /Save rule set/i
        });

        this.ruleAnalyticsButton = page.getByRole('button', {
            name: /Rule analytics/i
        });
    }

    async openCustomRulesPage() {

        await this.page.waitForLoadState('networkidle');

        if (
            await this.skipButton
                .isVisible()
                .catch(() => false)
        ) {
            await this.skipButton.click();

            console.log('Skip popup handled');
        }

        await expect(this.customRulesButton).toBeVisible({
            timeout: 30000
        });

        await this.customRulesButton.click({
            force: true
        });

        console.log('Custom Rules page opened');
    }

    async createRule(data) {

        await expect(this.expectedAnswerTextbox).toBeVisible({
            timeout: 30000
        });

        await this.expectedAnswerTextbox.fill(data.expectedAnswer);

        console.log('Expected answer entered');

        await this.incorrectAnswerTextbox.fill(data.incorrectAnswer);

        console.log('Incorrect answer entered');

        await this.sourceTextbox.fill(data.source);

        console.log('Source entered');

        await this.addRuleButton.click();

        console.log('Rule added');

        await this.saveButton.click();

        console.log('Save clicked');

        await this.saveRuleSetButton.click();

        console.log('Rule set saved');
    }

    async verifyRuleAnalytics(data, testInfo) {

        await expect(this.ruleAnalyticsButton).toBeVisible({
            timeout: 30000
        });

        await this.ruleAnalyticsButton.click();

        console.log('Rule Analytics opened');

        const ruleCard = this.page
            .locator('div')
            .filter({
                hasText: data.analyticsCardText
            })
            .nth(3);

        await expect(ruleCard).toBeVisible({
            timeout: 30000
        });

        await ruleCard.click();

        console.log('Rule card opened');

        const screenshotPath = await captureFullPageScreenshot(
            this.page,
            testInfo,
            `${data.testCaseId}-custom-rules-result`
        );

        const uiText = await this.page.locator('body').innerText();

        const resultData = {
            testCaseId: data.testCaseId,
            testCaseName: data.testCaseName,
            module: 'Custom Rules',
            expectedAnswer: data.expectedAnswer,
            incorrectAnswer: data.incorrectAnswer,
            source: data.source,
            analyticsCardText: data.analyticsCardText,
            screenshotPath,
            capturedAt: new Date().toISOString(),
            uiText
        };

        const resultPath = saveJsonResult(
            `${data.testCaseId}-custom-rules-result.json`,
            resultData
        );

        await testInfo.attach('Custom Rules UI Result JSON', {
            path: resultPath,
            contentType: 'application/json'
        });

        // Persist result history + optional GR drift warning (informational by default)
        // Custom Rules may not have a GR score; only act when one is found.
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

        await this.page.waitForTimeout(3000);
    }
}
