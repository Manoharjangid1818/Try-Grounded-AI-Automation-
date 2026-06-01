import { expect } from '@playwright/test';

export class ModelIntelligencePage {

    constructor(page) {

        this.page = page;

        this.skipButton =
            page.getByRole('button', {
                name: /Skip/i
            });

        this.modelIntelligenceButton =
            page.getByRole('button', {
                name: /Model Intelligence/i
            });

        this.claudeModel =
            page.locator('div')
                .filter({
                    hasText: /^Claude Opus 4\.5$/
                })
                .nth(1);

        this.auditDropdown =
            page.getByRole('combobox');

        this.runComparisonButton =
            page.getByRole('button', {
                name: /Run Comparison/i
            });

    }

    async openModelIntelligence() {

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
            this.modelIntelligenceButton
        ).toBeVisible({
            timeout: 30000
        });

        await this.modelIntelligenceButton.click({
            force: true
        });

        console.log(
            'Model Intelligence page opened'
        );

    }

    async configureComparison() {

        await expect(
            this.claudeModel
        ).toBeVisible({
            timeout: 30000
        });

        await this.claudeModel.click();

        console.log(
            'Claude Opus 4.5 selected'
        );

        await expect(
            this.auditDropdown
        ).toBeVisible({
            timeout: 30000
        });

        await this.auditDropdown.selectOption(
            'Bulk Audit 1'
        );

        console.log(
            'Bulk Audit 1 selected'
        );

    }

    async verifyRunComparisonButton() {

        await expect(
            this.runComparisonButton
        ).toBeVisible({
            timeout: 30000
        });

        console.log(
            'Run Comparison button visible'
        );

        const disabled =
            await this.runComparisonButton
                .isDisabled();

        console.log(
            `Run Comparison disabled: ${disabled}`
        );

        await this.page.waitForTimeout(
            10000
        );

    }

}