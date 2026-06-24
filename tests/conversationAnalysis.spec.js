import { test } from '@playwright/test';

import { ConversationAnalysisPage } from '../pages/ConversationAnalysisPage.js';

import { readJsonFile } from '../utils/dataReader.js';

import { registerResultCapture } from '../utils/testResultCapture.js';

const conversationAnalysisData = readJsonFile(
    './data/conversationAnalysis.data.json'
);

test.use({
    storageState: 'auth/user.json'
});

registerResultCapture(test, {
    module: 'Conversation Analysis',
    getResultData: (testCaseId) =>
        conversationAnalysisData.find((data) => data.testCaseId === testCaseId)
});

test.describe('Conversation Analysis Tests @conversation @regression', () => {
    for (const data of conversationAnalysisData) {
        test(
            `${data.testCaseId} - ${data.testCaseName} @conversation @regression`,
            async ({ page }, testInfo) => {
                const conversationAnalysisPage = new ConversationAnalysisPage(page);

                await page.goto('/dashboard');
                await conversationAnalysisPage.openConversationAnalysisPage();

                let evidenceCaptured = false;

                if (data.scenarioType === 'pageOpen') {
                    await conversationAnalysisPage.verifyPageOpened();
                }

                else if (data.scenarioType === 'conversationName') {
                    await conversationAnalysisPage.enterConversationName(
                        data.conversationName
                    );
                }

                else if (data.scenarioType === 'fileUpload') {
                    await conversationAnalysisPage.uploadReferenceDocument(
                        data.referenceFilePath
                    );
                }

                else if (data.scenarioType === 'pasteTranscript') {
                    await conversationAnalysisPage.enterConversationName(
                        data.conversationName
                    );
                    await conversationAnalysisPage.pasteTranscript(data.transcript);
                }

                else if (data.scenarioType === 'fullAnalysisWithFileUpload') {
                    await conversationAnalysisPage.enterConversationName(
                        data.conversationName
                    );
                    await conversationAnalysisPage.uploadReferenceDocument(
                        data.referenceFilePath
                    );
                    await conversationAnalysisPage.pasteTranscript(data.transcript);
                    await conversationAnalysisPage.clickRunAnalysis();
                    await conversationAnalysisPage.waitForAnalysisCompletion();
                    await conversationAnalysisPage.verifyAnalysisCompleted(data, testInfo);
                    evidenceCaptured = true;
                }

                else if (data.scenarioType === 'loadExample') {
                    await conversationAnalysisPage.clickLoadExample();
                    await conversationAnalysisPage.verifyLoadExampleWorked();
                }

                else if (data.scenarioType === 'emptyTranscriptValidation') {
                    await conversationAnalysisPage.enterConversationName(
                        data.conversationName
                    );
                    const runAttempt = await conversationAnalysisPage.clickRunAnalysis({
                        allowDisabled: true
                    });
                    await conversationAnalysisPage.verifyEmptyTranscriptValidation(
                        data,
                        runAttempt
                    );
                }

                else if (data.scenarioType === 'supportedFormats') {
                    await conversationAnalysisPage.verifySupportedFormatsVisible();
                }

                else if (data.scenarioType === 'summaryCheckbox') {
                    await conversationAnalysisPage.selectSummaryCheckboxIfVisible();
                }

                else {
                    throw new Error(`Invalid scenarioType found: ${data.scenarioType}`);
                }

                if (!evidenceCaptured) {
                    await conversationAnalysisPage.captureConversationAnalysisEvidence(
                        data,
                        testInfo,
                        'conversation-analysis-evidence'
                    );
                }
            }
        );
    }
});
