import { expect } from '@playwright/test';

export class QuickTestsPage {

    constructor(page) {

        this.page = page;

        // Skip popup
        this.skipButton =
            page.getByRole('button', {
                name: /Skip/i
            });

        // Navigation
        this.quickTestsButton =
            page.getByRole('button', {
                name: /Quick Tests DEV/i
            });

        // Run Suite
        this.runSuiteButton =
            page.getByRole('button', {
                name: /Run Suite/i
            }).first();

        // Results
        this.resultCard =
            page.getByText(
                /PASSED.*FAILED/i
            ).first();

    }

    async openQuickTestsPage() {

        // Wait dashboard load
        await this.page.waitForLoadState(
            'networkidle'
        );

        // Handle popup
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

        // Verify button
        await expect(
            this.quickTestsButton
        ).toBeVisible({

            timeout: 30000

        });

        // Scroll
        await this.quickTestsButton
            .scrollIntoViewIfNeeded();

        // Open module
        await this.quickTestsButton.click({
            force: true
        });

        console.log(
            'Quick Tests page opened successfully'
        );

        await this.page.waitForLoadState(
            'networkidle'
        );

    }

    async runQuickTestSuite() {

        // Verify Run Suite button
        await expect(
            this.runSuiteButton
        ).toBeVisible({

            timeout: 30000

        });

        // Run suite
        await this.runSuiteButton.click();

        console.log(
            'Quick Test Suite started'
        );

    }

    async verifyQuickTestCompleted() {

        console.log(
            'Waiting for suite completion'
        );

        // Wait for result card
        await expect(
            this.resultCard
        ).toBeVisible({

            timeout: 300000

        });

        console.log(
            'Suite execution completed'
        );

        // Open result
        await this.resultCard.click();

        console.log(
            'Result opened successfully'
        );

        // Pause 10 seconds
        await this.page.waitForTimeout(
            10000
        );

    }

}