import { test } from '@playwright/test';

import { RegressionMonitorPage } from '../pages/RegressionMonitorPage.js';

import { readJsonFile } from '../utils/dataReader.js';

const regressionMonitorData = readJsonFile('./data/regressionMonitor.data.json');

test.use({
    storageState: 'auth/user.json'
});

test.describe('Regression Monitor Tests @regression-monitor @regression', () => {

    for (const data of regressionMonitorData) {

        test(`${data.testCaseId} - ${data.testCaseName} @regression-monitor @regression`, async ({ page }, testInfo) => {

            const regressionMonitorPage = new RegressionMonitorPage(page);

            await page.goto('/');

            await regressionMonitorPage.openTestHistory();

            await regressionMonitorPage.scheduleTest(data);

            await regressionMonitorPage.openRegressionMonitor();

            await regressionMonitorPage.runRegressionMonitor(data, testInfo);
        });
    }
});