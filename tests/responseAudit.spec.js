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

                // Field assertions are handled inside page object only when configured via data.
                await auditPage.verifyAuditCompleted(data, testInfo);
            }

            else if (data.scenarioType === 'loadExample') {
                await auditPage.verifyLoadExampleFlow(data, testInfo);
            }

            else {
                throw new Error(`Invalid scenarioType found: ${data.scenarioType}`);
            }
        });
    }
});

test('RA_006 - TC-01 Load example & run audit (explicit assertions)', async ({ page }, testInfo) => {

    const auditPage = new ResponseAuditPage(page);

    await auditPage.openAuditPage();
    await auditPage.clickLoadExample();
    await auditPage.assertGroundTruthLoaded();
    await auditPage.assertContextAndGeneratedContentNotEmpty();

    await auditPage.clickRunAudit('Run audit');

    // Minimal data needed by verifyAuditCompleted
    await auditPage.verifyAuditCompleted(
        {
            testCaseId: 'RA_006',
            testCaseName: 'TC-01 Load example & run audit (explicit assertions)',
            scenarioType: 'loadExample',
            source: 'HubSpot',
            recordType: 'CONTACTS',
            recordName: 'Sample Contact',
            runAuditButtonText: 'Run audit',
            expectedResultText: 'Score breakdown'
        },
        testInfo
    );
});

test('RA_007 - TC-02 HubSpot contact audit (data-driven)', async ({ page }, testInfo) => {

    const auditPage = new ResponseAuditPage(page);

    const contacts = ['Maria Johnson', 'ContactB', 'ContactC'];

    for (const contactName of contacts) {

        await auditPage.openAuditPage();

        // Step 1: Clear if data source already selected
        await auditPage.clearConnectedSourceIfPresent();

        // Step 2: HubSpot source card
        await auditPage.selectConnectedSource('HubSpot');

        // Step 3: Select contact
        await auditPage.selectRecordType('CONTACTS');
        await auditPage.selectRecord(contactName);

        // Step 4: Data source card updates + ground truth loaded
        await auditPage.assertGroundTruthLoaded();

        // Step 5: Right-hand panel shows CRM record active and layer verification note
        await auditPage.assertRightPanelCRMRecordAndLayers();

        // Step 6: Context/Prompt field contains contact name
        await auditPage.assertContextPromptContainsName(contactName);

        // Step 7: Get response
        await auditPage.clickGetResponse('Get response');

        // Step 8: AI-generated content populated
        await auditPage.assertContextAndGeneratedContentNotEmpty();

        // Step 9: Run audit
        await auditPage.clickRunAudit('Run audit');

        // Step 10: Verify audit completed and result references ground truth source
        await auditPage.verifyAuditCompleted(
            {
                testCaseId: `RA_007-${contactName}`,
                testCaseName: `TC-02 HubSpot contact audit - ${contactName}`,
                scenarioType: 'connectedSource',
                source: 'HubSpot',
                recordType: 'CONTACTS',
                recordName: contactName,
                getResponseButtonText: 'Get response',
                runAuditButtonText: 'Run audit',
                expectedResultText: 'Score breakdown',
                useGenerateDemo: false
            },
            testInfo
        );

        await auditPage.assertNoErrorToast();
        await auditPage.assertResultReferencesGroundTruthSource('HubSpot');

    }
});

test('RA_008 - Load example dropdown options (data-driven)', async ({ page }, testInfo) => {

    const auditPage = new ResponseAuditPage(page);

    const options = ['Support reply', 'CRM note', 'Medical query', 'Legal summary'];

    for (const optionName of options) {

        await auditPage.openAuditPage();
        await auditPage.clearConnectedSourceIfPresent();

        await auditPage.openLoadExampleMenu();
        await auditPage.selectLoadExampleOption(optionName);

        await auditPage.assertGroundTruthLoaded();
        await auditPage.assertContextAndGeneratedContentNotEmpty();

        await auditPage.clickRunAudit('Run audit');

        await auditPage.verifyAuditCompleted(
            {
                testCaseId: `RA_008-${optionName.replace(/\s+/g, '_')}`,
                testCaseName: `TC-03 Load example dropdown - ${optionName}`,
                scenarioType: 'loadExample',
                source: 'Load example',
                recordType: null,
                recordName: null,
                runAuditButtonText: 'Run audit',
                expectedResultText: 'Score breakdown'
            },
            testInfo
        );

        await auditPage.assertNoErrorToast();

    }
});
