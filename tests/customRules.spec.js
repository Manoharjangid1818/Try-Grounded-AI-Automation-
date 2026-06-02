import { test } from '@playwright/test';

import { CustomRulesPage }
from '../pages/CustomRulesPage.js';

test.use({
    storageState:'auth/user.json'
});

test.describe(
    'Custom Rules Tests',
    () => 
        { test('Verify Custom Rules Works Successfully',

            async ({ page }) => {

                const customRulesPage = new CustomRulesPage(page);

                await page.goto('https://grounded-topaz.vercel.app/dashboard');

                await customRulesPage.openCustomRulesPage();

                await customRulesPage.createRule();

                await customRulesPage.verifyRuleAnalytics();

            }
        );
    }
);