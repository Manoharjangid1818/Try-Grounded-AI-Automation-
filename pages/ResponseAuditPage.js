import { expect } from '@playwright/test';

export class ResponseAuditPage {

    constructor(page) {

        this.page = page;

        // Skip onboarding popup
        this.skipButton =
            page.getByRole('button', {
                name: 'Skip →'
            });

        // Response Audit sidebar button
        this.responseAuditButton =
            page.getByRole('button', {
                name: 'Response Audit'
            });

        // Paste manually option
        this.pasteManuallyOption =
            page.getByText('Paste manually');

        // Question textbox
        this.questionTextbox =
            page.getByRole('textbox', {
                name: 'What was the AI asked? Paste'
            });

        // AI response textbox
        this.aiResponseTextbox =
            page.getByRole('textbox', {
                name: 'Paste the AI response to'
            });

        // Expected response textbox
        this.expectedTextbox =
            page.getByRole('textbox', {
                name: 'Type the known-correct'
            });

        // Run Audit button
        this.runAuditButton =
            page.getByRole('button', {
                name: 'Run audit →'
            });

        // Audit running loader
        this.auditLoadingText =
            page.getByText(
                /Running 10-Layer Audit/i
            );

        // Final Result Screen
        this.auditResultSection =
            page.getByRole('button', {
                name: 'Score breakdown'
            });

    }

    async openAuditPage() {

        // Open dashboard
        await this.page.goto(
            'https://grounded-topaz.vercel.app/dashboard'
        );

        // Wait for complete page load
        await this.page.waitForLoadState(
            'networkidle'
        );

        // Handle skip popup if present
        try {

            await this.skipButton.waitFor({

                state: 'visible',

                timeout: 5000

            });

            await this.skipButton.click();

            console.log(
                'Skip popup handled'
            );

        } catch {

            console.log(
                'Skip popup not visible'
            );

        }

        // Open Response Audit page
        await this.responseAuditButton.click();

        // Wait for page load
        await this.page.waitForLoadState(
            'networkidle'
        );

        // Click Paste manually option
        await this.pasteManuallyOption.click();

        console.log(
            'Paste manually selected'
        );

    }

    async performAudit(

        question,

        aiResponse,

        expectedResponse

    ) {

        // Wait for Question textbox
        await this.questionTextbox.waitFor({

            state: 'visible',

            timeout: 10000

        });

        // Fill Question
        await this.questionTextbox.fill(
            question
        );

        console.log(
            'Question entered'
        );

        // Small wait for visibility
        await this.page.waitForTimeout(
            1000
        );

        // Fill AI Response
        await this.aiResponseTextbox.fill(
            aiResponse
        );

        console.log(
            'AI response entered'
        );

        // Small wait
        await this.page.waitForTimeout(
            1000
        );

        // Fill Expected Response
        await this.expectedTextbox.fill(
            expectedResponse
        );

        console.log(
            'Expected response entered'
        );

        // Small wait
        await this.page.waitForTimeout(
            1000
        );

        // Wait for Run Audit button
        await this.runAuditButton.waitFor({

            state: 'visible',

            timeout: 10000

        });

        // Click Run Audit
        await this.runAuditButton.click();

        console.log(
            'Run Audit clicked'
        );

    }

    async verifyAuditCompleted() {

        // Verify audit started
        await expect(

            this.auditLoadingText

        ).toBeVisible({

            timeout: 15000

        });

        console.log(
            'Audit started successfully'
        );

        // Wait until 10 layers complete
        await this.auditLoadingText.waitFor({

            state: 'hidden',

            timeout: 120000

        });

        console.log(
            'Audit completed successfully'
        );

        // Verify result page visible
        await expect(

            this.auditResultSection

        ).toBeVisible({

            timeout: 30000

        });

        console.log(
            'Result screen visible'
        );

        // Browser stays open
        await this.page.pause();

    }

}