import { test } from '@playwright/test';

import { ModelIntelligencePage } from '../pages/ModelIntelligencePage.js';

import { readJsonFile } from '../utils/dataReader.js';

const modelIntelligenceData = readJsonFile('./data/modelIntelligence.data.json');

test.use({
    storageState: 'auth/user.json'
});

test.describe('Model Intelligence Tests @model-intelligence @regression', () => {

    for (const data of modelIntelligenceData) {

        test(`${data.testCaseId} - ${data.testCaseName} @model-intelligence @regression`, async ({ page }, testInfo) => {

            const modelIntelligencePage = new ModelIntelligencePage(page);

            await page.goto('/');

            await modelIntelligencePage.openModelIntelligence();

            await modelIntelligencePage.configureComparison(data);

            await modelIntelligencePage.verifyRunComparisonButton(data, testInfo);
        });
    }
});