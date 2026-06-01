import { test } from '@playwright/test';

import { QuickTestsPage }
from '../pages/QuickTestsPage.js';

test.use({

    storageState:
        'auth/user.json'

});

test.describe(

    'Quick Tests',

    () => {

        test(

            'Verify Quick Tests Suite Runs Successfully',

            async ({ page }) => {

                // Create page object
                const quickTestsPage =
                    new QuickTestsPage(page);

                // Open app
                await page.goto(
                    'https://grounded-topaz.vercel.app/dashboard'
                );

                // Open Quick Tests
                await quickTestsPage
                    .openQuickTestsPage();

                // Run Suite
                await quickTestsPage
                    .runQuickTestSuite();

                // Verify results
                await quickTestsPage
                    .verifyQuickTestCompleted();

            }

        );

    }

);