import { test } from '@playwright/test';

import { BulkAuditPage } from '../pages/BulkAuditPage.js';

import { readJsonFile } from '../utils/dataReader.js';

import { registerResultCapture } from '../utils/testResultCapture.js';

const bulkAuditData = readJsonFile('./data/bulkAudit.data.json');

test.use({
    storageState: 'auth/user.json'
});

registerResultCapture(test, {
    module: 'Bulk Audit',
    getResultData: (testCaseId) => bulkAuditData.find((data) => data.testCaseId === testCaseId)
});

test.describe('Bulk Audit Tests @bulk @regression', () => {
    for (const data of bulkAuditData) {
        test(`${data.testCaseId} - ${data.testCaseName} @bulk @regression`, async ({
            page
        }, testInfo) => {
            const bulkAuditPage = new BulkAuditPage(page);

            await page.goto('/dashboard');

            await bulkAuditPage.openBulkAuditPage();

            if (data.scenarioType === 'happyFlow') {
                await bulkAuditPage.createBulkAudit(data);
                await bulkAuditPage.verifyBulkAuditCompleted(data, testInfo);
            } else if (data.scenarioType === 'runButtonDisabledBeforeRows') {
                await bulkAuditPage.verifyRunButtonDisabledBeforeRowsLoaded(data, testInfo);
            } else if (data.scenarioType === 'emptyAuditNameValidation') {
                await bulkAuditPage.verifyEmptyAuditNameValidation(data, testInfo);
            } else if (data.scenarioType === 'resetButton') {
                await bulkAuditPage.verifyResetButtonClearsForm(data, testInfo);
            } else if (data.scenarioType === 'loadExample') {
                await bulkAuditPage.verifyLoadExampleWorks(data, testInfo);
            } else if (data.scenarioType === 'referenceDocument') {
                await bulkAuditPage.verifyReferenceDocumentOption(data, testInfo);
            } else if (data.scenarioType === 'csvUploadDefaultTab') {
                await bulkAuditPage.verifyCsvUploadDefaultTab(data, testInfo);
            } else if (data.scenarioType === 'liveAgentTab') {
                await bulkAuditPage.verifyLiveAgentTab(data, testInfo);
            } else if (data.scenarioType === 'testRunName') {
                await bulkAuditPage.verifyTestRunName(data, testInfo);
            } else if (data.scenarioType === 'downloadSampleCsv') {
                await bulkAuditPage.verifyDownloadSampleCsv(data, testInfo);
            } else if (data.scenarioType === 'formatGuide') {
                await bulkAuditPage.verifyFormatGuide(data, testInfo);
            } else if (data.scenarioType === 'csvFileUpload') {
                await bulkAuditPage.verifyCsvFileUpload(data, testInfo);
            } else if (data.scenarioType === 'invalidFileUpload') {
                await bulkAuditPage.verifyInvalidFileUpload(data, testInfo);
            } else if (data.scenarioType === 'fileSizeValidation') {
                await bulkAuditPage.verifyFileSizeValidation(data, testInfo);
            } else if (data.scenarioType === 'rowLimitValidation') {
                await bulkAuditPage.verifyRowLimitValidation(data, testInfo);
            } else if (data.scenarioType === 'expandJsonGroundTruth') {
                await bulkAuditPage.verifyJsonGroundTruthExpands(data, testInfo);
            } else if (data.scenarioType === 'validJsonGroundTruth') {
                await bulkAuditPage.verifyValidJsonGroundTruth(data, testInfo);
            } else if (data.scenarioType === 'invalidJsonGroundTruth') {
                await bulkAuditPage.verifyInvalidJsonGroundTruth(data, testInfo);
            } else if (data.scenarioType === 'activeLayersPanel') {
                await bulkAuditPage.verifyActiveLayersPanel(data, testInfo);
            } else if (data.scenarioType === 'statusBeforeUpload') {
                await bulkAuditPage.verifyStatusBeforeUpload(data, testInfo);
            } else if (data.scenarioType === 'runsRemaining') {
                await bulkAuditPage.verifyRunsRemaining(data, testInfo);
            } else if (data.scenarioType === 'referenceDocumentFileUpload') {
                await bulkAuditPage.verifyReferenceDocumentFileUpload(data, testInfo);
            } else if (data.scenarioType === 'referenceDocumentSizeValidation') {
                await bulkAuditPage.verifyReferenceDocumentSizeValidation(data, testInfo);
            } else {
                throw new Error(`Invalid scenarioType found: ${data.scenarioType}`);
            }
        });
    }
});
