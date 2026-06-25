import { test } from '@playwright/test';

import { QuickTestsPage } from '../pages/QuickTestsPage.js';

import { readJsonFile } from '../utils/dataReader.js';

import { registerResultCapture } from '../utils/testResultCapture.js';

const quickTestsData = readJsonFile('./data/quickTests.data.json');

test.use({
    storageState: 'auth/user.json'
});

registerResultCapture(test, {
    module: 'Quick Tests',
    getResultData: (testCaseId) => quickTestsData.find((data) => data.testCaseId === testCaseId)
});

test.describe('Quick Tests @quick-tests @smoke', () => {
    for (const data of quickTestsData) {
        test(`${data.testCaseId} - ${data.testCaseName} @quick-tests @smoke`, async ({
            page
        }, testInfo) => {
            const quickTestsPage = new QuickTestsPage(page);

            await page.goto('/dashboard');

            await quickTestsPage.openQuickTestsPage();

            await quickTestsPage.runQuickTestSuite(data);

            await quickTestsPage.verifyQuickTestCompleted(data, testInfo);
        });
    }
});
