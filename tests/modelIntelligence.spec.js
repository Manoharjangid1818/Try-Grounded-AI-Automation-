import { test } from '@playwright/test';

import { ModelIntelligencePage }
from '../pages/ModelIntelligencePage.js';

test.use({

    storageState:
        'auth/user.json'
});

test.describe(

    'Model Intelligence Tests',

    () => {

        test(

            'Verify Model Intelligence Opens Successfully',

            async ({ page }) => {

                const modelIntelligencePage = new ModelIntelligencePage(page);

                await page.goto('https://grounded-topaz.vercel.app/dashboard');

                await modelIntelligencePage.openModelIntelligence();

                await modelIntelligencePage.configureComparison();

                await modelIntelligencePage.verifyRunComparisonButton();

            }

        );
    }
);