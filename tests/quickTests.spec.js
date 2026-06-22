import { test } from '@playwright/test';

import { QuickTestsPage } from '../pages/QuickTestsPage.js';

import { readJsonFile } from '../utils/dataReader.js';

const quickTestsData = readJsonFile('./data/quickTests.data.json');

test.use({
    storageState: 'auth/user.json'
});

test.describe('Quick Tests @quick-tests @smoke', () => {

    for (const data of quickTestsData) {

        test(`${data.testCaseId} - ${data.testCaseName} @quick-tests @smoke`, async ({ page }, testInfo) => {

            const quickTestsPage = new QuickTestsPage(page);

            await page.goto('/');

            await quickTestsPage.openQuickTestsPage();

            await quickTestsPage.runQuickTestSuite(data);

            await quickTestsPage.verifyQuickTestCompleted(data, testInfo);
        });
    }
});