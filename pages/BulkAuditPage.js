import { expect } from '@playwright/test';

export class BulkAuditPage {

    constructor(page) {

        this.page = page;

        // Skip popup
        this.skipButton =
            page.getByRole('button', {
                name: /Skip/i
            });

        // Navigation
        this.bulkAuditButton =
            page.locator(
                'button:has-text("Bulk Audit")'
            );

        // Form fields
        this.auditNameTextbox =
            page.getByRole('textbox', {
                name: /GPT-4o Healthcare/i
            });

        this.hubspotOption =
            page.getByText(
                'HubSpot',
                { exact: true }
            );

        this.contactsButton =
            page.getByRole('button', {
                name: /^CONTACTS/i
            });

        this.contactName =
            page.getByText(
                'Manohar Jangid'
            ).nth(1);

        this.pullAllButton =
            page.getByRole('button', {
                name: /Pull all/i
            });

        this.runTestsButton =
            page.getByRole('button', {
                name: /Run 3 tests/i
            }).nth(1);

        // Running state
        this.bulkAuditRunning =
            page.getByText(
                'RUNNING BATCH AUDIT',
                { exact: true }
            );

        // Results section
        this.resultScreen =
            page.getByText(
                /ALL RESULTS/i
            );

    }

    async openBulkAuditPage() {

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

        // Wait Bulk Audit visible
        await expect(
            this.bulkAuditButton
        ).toBeVisible({

            timeout: 30000

        });

        // Scroll
        await this.bulkAuditButton
            .scrollIntoViewIfNeeded();

        // Safe click
        await this.bulkAuditButton.click({
            force: true
        });

        console.log(
            'Bulk Audit page opened successfully'
        );

        // Wait page stable
        await this.page.waitForLoadState(
            'networkidle'
        );

    }

    async createBulkAudit() {

        // Wait form
        await expect(
            this.auditNameTextbox
        ).toBeVisible({

            timeout: 30000

        });

        // Fill audit name
        await this.auditNameTextbox.fill(
            'Bulk Audit 1'
        );

        console.log(
            'Audit name entered'
        );

        // Select HubSpot
        await this.hubspotOption.click();

        console.log(
            'HubSpot selected'
        );

        // Select CONTACTS
        await this.contactsButton.click();

        console.log(
            'Contacts selected'
        );

        // Select contact
        await expect(
            this.contactName
        ).toBeVisible();

        await this.contactName.click();

        console.log(
            'Contact selected'
        );

        // Pull all
        await this.pullAllButton.click();

        console.log(
            'Pull all initiated'
        );

        // Wait rows loaded
        await expect(

            this.page.getByText(
                /3 rows loaded/i
            )

        ).toBeVisible({

            timeout: 60000

        });

        console.log(
            'Rows loaded successfully'
        );

        // Run tests
        await this.runTestsButton.click();

        console.log(
            'Run tests clicked'
        );

    }

    async verifyBulkAuditCompleted() {

        // Verify started
        await expect(
            this.bulkAuditRunning
        ).toBeVisible({

            timeout: 60000

        });

        console.log(
            'Bulk audit execution started'
        );

        // Wait complete
        await this.bulkAuditRunning.waitFor({

            state: 'hidden',

            timeout: 300000

        });

        console.log(
            'Execution completed'
        );

        // Verify results
        await expect(
            this.resultScreen
        ).toBeVisible({

            timeout: 120000

        });

        console.log(
            'Bulk audit completed successfully'
        );

        // Pause 10 seconds to see results
        await this.page.waitForTimeout(
            10000
        );
    }
}