import { test } from '@playwright/test';

import { BulkAuditPage } from '../pages/BulkAuditPage.js';

import { readJsonFile } from '../utils/dataReader.js';

const bulkAuditData = readJsonFile('./data/bulkAudit.data.json');

test.use({
    storageState: 'auth/user.json'
});

test.describe('Bulk Audit Tests @bulk @regression', () => {

    for (const data of bulkAuditData) {

        test(`${data.testCaseId} - ${data.testCaseName} @bulk @regression`, async ({ page }, testInfo) => {

            const bulkAuditPage = new BulkAuditPage(page);

            await page.goto('/dashboard');


            await bulkAuditPage.openBulkAuditPage();

            if (data.scenarioType === 'happyFlow') {

                await bulkAuditPage.createBulkAudit(data);

                await bulkAuditPage.verifyBulkAuditCompleted(data, testInfo);
            }

            else if (data.scenarioType === 'runButtonDisabledBeforeRows') {

                await bulkAuditPage.verifyRunButtonDisabledBeforeRowsLoaded(data, testInfo);
            }

            else if (data.scenarioType === 'emptyAuditNameValidation') {

                await bulkAuditPage.verifyEmptyAuditNameValidation(data, testInfo);
            }

            else if (data.scenarioType === 'resetButton') {

                await bulkAuditPage.verifyResetButtonClearsForm(data, testInfo);
            }

            else if (data.scenarioType === 'loadExample') {

                await bulkAuditPage.verifyLoadExampleWorks(data, testInfo);
            }

            else if (data.scenarioType === 'referenceDocument') {

                await bulkAuditPage.verifyReferenceDocumentOption(data, testInfo);
            }

            else {

                throw new Error(`Invalid scenarioType found: ${data.scenarioType}`);
            }
        });
    }
});