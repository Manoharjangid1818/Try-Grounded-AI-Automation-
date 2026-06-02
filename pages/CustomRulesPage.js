import { expect } from '@playwright/test';

export class CustomRulesPage {

    constructor(page) {

        this.page = page;

        // Skip popup
        this.skipButton =
            page.getByRole('button', {
                name: /Skip/i
            });

        // Navigation
        this.customRulesButton =
            page.getByRole('button', {
                name: /Custom rules/i
            });

        // Rule fields
        this.expectedAnswerTextbox =
            page.getByRole('textbox', {
                name: /KiwiQA was founded in 2010/i
            });

        this.incorrectAnswerTextbox =
            page.getByRole('textbox', {
                name: /KiwiQA was founded in 2020/i
            });

        this.sourceTextbox =
            page.getByRole('textbox', {
                name: /kiwiqa.ai\/about/i
            });

        this.addRuleButton =
            page.getByRole('button', {
                name: /\+ Add rule/i
            });

        this.saveButton =
            page.getByRole('button', {
                name: /^Save →$/i
            });

        this.saveRuleSetButton =
            page.getByRole('button', {
                name: /Save rule set/i
            });

        // Analytics
        this.ruleAnalyticsButton =
            page.getByRole('button', {
                name: /Rule analytics/i
            });

        this.ruleCard =
            page.locator('div')
                .filter({
                    hasText:
                        'VERIFIED FACT CHECKING'
                })
                .nth(3);

    }

    async openCustomRulesPage() {

        await this.page.waitForLoadState(
            'networkidle'
        );

        if (
            await this.skipButton
                .isVisible()
                .catch(() => false)
        ) {

            await this.skipButton.click();

            console.log(
                'Skip popup handled'
            );

        }

        await expect(
            this.customRulesButton
        ).toBeVisible({

            timeout: 30000

        });

        await this.customRulesButton.click({
            force: true
        });

        console.log(
            'Custom Rules page opened'
        );

    }

    async createRule() {

        await expect(
            this.expectedAnswerTextbox
        ).toBeVisible({

            timeout: 30000

        });

        await this.expectedAnswerTextbox.fill(
            'KiwiQA was founded in 2010'
        );

        console.log(
            'Expected answer entered'
        );

        await this.incorrectAnswerTextbox.fill(
            'KiwiQA was founded in 2020'
        );

        console.log(
            'Incorrect answer entered'
        );

        await this.sourceTextbox.fill(
            'kiwiqa.ai/about'
        );

        console.log(
            'Source entered'
        );

        await this.addRuleButton.click();

        console.log(
            'Rule added'
        );

        await this.saveButton.click();

        console.log(
            'Save clicked'
        );

        await this.saveRuleSetButton.click();

        console.log(
            'Rule set saved'
        );

    }

    async verifyRuleAnalytics() {

        await expect(
            this.ruleAnalyticsButton
        ).toBeVisible({

            timeout: 30000

        });

        await this.ruleAnalyticsButton.click();

        console.log(
            'Rule Analytics opened'
        );

        await expect(
            this.ruleCard
        ).toBeVisible({

            timeout: 30000

        });

        await this.ruleCard.click();

        console.log(
            'Rule card opened'
        );

        await this.page.waitForTimeout(
            10000
        );

    }

}