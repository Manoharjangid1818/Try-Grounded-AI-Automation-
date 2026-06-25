import { test } from '@playwright/test';

import { ModelIntelligencePage } from '../pages/ModelIntelligencePage.js';

import { readJsonFile } from '../utils/dataReader.js';

import { registerResultCapture } from '../utils/testResultCapture.js';

const modelIntelligenceData = readJsonFile('./data/modelIntelligence.data.json');

test.use({
    storageState: 'auth/user.json'
});

registerResultCapture(test, {
    module: 'Model Intelligence',
    getResultData: (testCaseId) =>
        modelIntelligenceData.find((data) => data.testCaseId === testCaseId)
});

test.describe('Model Intelligence Tests @model-intelligence @regression', () => {
    for (const data of modelIntelligenceData) {
        test(`${data.testCaseId} - ${data.testCaseName} @model-intelligence @regression`, async ({
            page
        }, testInfo) => {
            const modelIntelligencePage = new ModelIntelligencePage(page);

            await page.goto('/dashboard');

            await modelIntelligencePage.openModelIntelligence();

            await modelIntelligencePage.configureComparison(data);

            await modelIntelligencePage.verifyRunComparisonButton(data, testInfo);
        });
    }
});
