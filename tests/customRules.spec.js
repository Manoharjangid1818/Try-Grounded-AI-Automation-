import { test } from '@playwright/test';

import { CustomRulesPage } from '../pages/CustomRulesPage.js';

import { readJsonFile } from '../utils/dataReader.js';

const customRulesData = readJsonFile('./data/customRules.data.json');

test.use({
    storageState: 'auth/user.json'
});

test.describe('Custom Rules Tests @custom-rules @regression', () => {

    for (const data of customRulesData) {

        test(`${data.testCaseId} - ${data.testCaseName} @custom-rules @regression`, async ({ page }, testInfo) => {

            const customRulesPage = new CustomRulesPage(page);

            await page.goto('/');

            await customRulesPage.openCustomRulesPage();

            await customRulesPage.createRule(data);

            await customRulesPage.verifyRuleAnalytics(data, testInfo);
        });
    }
});