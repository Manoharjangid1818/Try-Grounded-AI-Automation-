import { test } from '@playwright/test';

import { BulkAuditPage }
from '../pages/BulkAuditPage.js';

test.use({

    storageState:
        'auth/user.json'

});

test.describe(

    'Bulk Audit Tests',

    () => {

        test(

            'Verify Bulk Audit Works Successfully',

            async ({ page }) => {

                // Create page object
                const bulkAuditPage =
                    new BulkAuditPage(page);

                // Open app
                await page.goto(
                    'https://grounded-topaz.vercel.app/dashboard'
                );

                // Open Bulk Audit
                await bulkAuditPage
                    .openBulkAuditPage();

                // Create audit
                await bulkAuditPage
                    .createBulkAudit();

                // Verify results
                await bulkAuditPage
                    .verifyBulkAuditCompleted();

            }

        );

    }

);