import { test } from '@playwright/test';

import { ResponseAuditPage } from '../pages/ResponseAuditPage.js';

import { readJsonFile } from '../utils/dataReader.js';

const responseAuditData = readJsonFile('./data/responseAudit.data.json');

test.use({
    storageState: 'auth/user.json'
});

test.describe('Response Audit Tests @response-audit @smoke', () => {

    for (const data of responseAuditData) {

        test(`${data.testCaseId} - ${data.testCaseName} @response-audit @smoke`, async ({ page }, testInfo) => {

            const auditPage = new ResponseAuditPage(page);

            await auditPage.openAuditPage();

            if (data.scenarioType === 'connectedSource') {

                await auditPage.performConnectedSourceAudit(data);

                await auditPage.verifyAuditCompleted(data, testInfo);
            }

            else {

                throw new Error(`Invalid scenarioType found: ${data.scenarioType}`);
            }
        });
    }
});