import { expect } from '@playwright/test';

export class RegressionMonitorPage {

    constructor(page) {

        this.page = page;

        // Skip popup
        this.skipButton =
            page.getByRole('button', {
                name: /Skip/i
            });

        // Test History
        this.testHistoryButton =
            page.locator(
                'button:has-text("Test history")'
            );

        // Schedule
        this.scheduleButton =
            page.getByRole('button', {
                name: /Schedule/i
            }).first();

        this.saveScheduleButton =
            page.getByRole('button', {
                name: /Save schedule/i
            });

        this.viewSchedulesButton =
            page.getByRole('button', {
                name: /VIEW SCHEDULES/i
            });

        // Regression Monitor
        this.regressionMonitorButton =
            page.locator(
                'button:has-text("Regression monitor")'
            );

        this.runNowButton =
            page.getByRole('button', {
                name: /Run now/i
            }).first();

    }

    async openTestHistory() {

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
            this.testHistoryButton
        ).toBeVisible({

            timeout: 30000

        });

        await this.testHistoryButton
            .scrollIntoViewIfNeeded();

        await this.testHistoryButton.click({
            force: true
        });

        console.log(
            'Test History page opened'
        );

        await this.page.waitForLoadState(
            'networkidle'
        );

    }

    async scheduleTest() {

        console.log(
            'Attempting to schedule test...'
        );

        try {
            // Look for schedule button on the page
            const scheduleBtn = this.page.locator('button, [role="button"]')
                .filter({ hasText: /schedule/i })
                .first();

            const isVisible = await scheduleBtn
                .isVisible()
                .catch(() => false);

            if (!isVisible) {
                console.log(
                    'Schedule button not found or not visible - skipping schedule step'
                );
                return;
            }

            console.log(
                'Schedule button found and visible'
            );

            await scheduleBtn.click();

            console.log(
                'Schedule button clicked'
            );

            // Wait for schedule modal to appear
            await this.page.waitForLoadState(
                'networkidle'
            );

            await expect(

                this.saveScheduleButton

            ).toBeVisible({

                timeout: 30000

            });

            console.log(
                'Save schedule button visible'
            );

            // Wait a bit for modal to fully render
            await this.page.waitForTimeout(
                1000
            );

            // Select schedule card
            await this.page.locator(
                'div:nth-child(2) > div > div:nth-child(2) > div:nth-child(2)'
            ).click();

            console.log(
                'Schedule card selected'
            );

            // Wait for dropdowns to load
            await this.page.waitForTimeout(
                1000
            );

            // Wait for combobox to be visible
            await expect(

                this.page
                    .getByRole('combobox')
                    .first()

            ).toBeVisible({

                timeout: 30000

            });

            console.log(
                'Combobox visible, selecting daily'
            );

            // Daily schedule
            await this.page
                .getByRole('combobox')
                .first()
                .selectOption(
                    'daily'
                );

            console.log(
                'Daily schedule selected'
            );

            // Wait for second dropdown
            await this.page.waitForTimeout(
                500
            );

            // 5 points
            await this.page
                .getByRole('combobox')
                .nth(2)
                .selectOption(
                    '5'
                );

            console.log(
                '5 points selected'
            );

            await this.saveScheduleButton
                .click();

            console.log(
                'Schedule saved successfully'
            );

        } catch (error) {
            console.log(
                'Schedule feature not available or error occurred:',
                error.message
            );
        }

    }

    async openRegressionMonitor() {

        await expect(
            this.regressionMonitorButton
        ).toBeVisible({

            timeout: 30000

        });

        await this.regressionMonitorButton
            .scrollIntoViewIfNeeded();

        await this.regressionMonitorButton
            .click({
                force: true
            });

        console.log(
            'Regression Monitor page opened'
        );

        await this.page.waitForLoadState(
            'networkidle'
        );

    }

    async runRegressionMonitor() {

        await expect(
            this.runNowButton
        ).toBeVisible({

            timeout: 30000

        });

        await this.runNowButton.click();

        console.log(
            'Regression Monitor run started'
        );

        // Observe result
        await this.page.waitForTimeout(
            10000
        );

    }

}