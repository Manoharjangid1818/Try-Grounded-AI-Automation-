import { captureFullPageScreenshot } from './screenshotHelper.js';

import { extractScore } from './resultHistory.js';

import { saveJsonResult } from './resultWriter.js';

function fileSafeTimestamp(capturedAt) {
    // Preserve Bulk Audit's ISO-8601 timestamp source while making it valid
    // for Windows filenames.
    return capturedAt.replace(/[:.]/g, '-');
}

function testCaseIdFromTitle(title, fallbackTestCaseId) {
    const match = String(title).match(/^([A-Z]+_\d+)/);
    return match?.[1] || fallbackTestCaseId || 'UNSPECIFIED';
}

function resultSummary(uiText) {
    if (!uiText) return null;

    return uiText.replace(/\s+/g, ' ').trim().slice(0, 1000);
}

function failureDetails(error) {
    if (!error) return null;

    return {
        message: error.message || String(error),
        stack: error.stack || null
    };
}

function resultScore(uiText) {
    const historyScore = extractScore(uiText);
    if (historyScore != null) return historyScore;

    const overallScore = String(uiText || '').match(
        /OVERALL\s+SCORE\s+(\d+(?:\.\d+)?\s*(?:%|\/\s*\d+)?)/i
    );

    return overallScore?.[1]?.trim() || null;
}

/**
 * Captures normalized evidence after a Playwright test run.
 *
 * @param {object} options - Capture options.
 * @param {import('@playwright/test').Page} options.page - Playwright page instance.
 * @param {import('@playwright/test').TestInfo} options.testInfo - Current test metadata.
 * @param {string} options.module - Module name reported in the result.
 * @param {Function} [options.getResultData] - Optional metadata lookup by test case ID.
 * @param {string} [options.fallbackTestCaseId] - ID used when the title has no test ID.
 * @returns {Promise<string>} Path to the consolidated result file.
 */
export async function captureTestRunResult({
    page,
    testInfo,
    module,
    getResultData,
    fallbackTestCaseId
}) {
    const capturedAt = new Date().toISOString();
    const timestamp = fileSafeTimestamp(capturedAt);
    const testCaseId = testCaseIdFromTitle(testInfo.title, fallbackTestCaseId);
    const metadata = (await getResultData?.(testCaseId, testInfo)) || {};
    const screenshotName = `${testCaseId}-test-result-${timestamp}`;

    let screenshotPath = null;
    try {
        screenshotPath = await captureFullPageScreenshot(page, testInfo, screenshotName);
    } catch (error) {
        console.warn(`[${testCaseId}] Result screenshot unavailable: ${error.message || error}`);
    }

    const uiText = await page
        .locator('body')
        .innerText()
        .catch(() => null);
    const score = resultScore(uiText);

    const {
        testCaseId: ignoredTestCaseId,
        testCaseName: metadataTestCaseName,
        scenarioType: metadataScenarioType,
        module: ignoredModule,
        capturedAt: ignoredCapturedAt,
        screenshotPath: ignoredScreenshotPath,
        uiText: ignoredUiText,
        resultSummary: ignoredResultSummary,
        status: ignoredStatus,
        score: ignoredScore,
        error: ignoredError,
        ...moduleDetails
    } = metadata;

    const resultData = {
        testCaseId,
        testCaseName: metadataTestCaseName || testInfo.title,
        scenarioType: metadataScenarioType || null,
        module,
        ...moduleDetails,
        screenshotPath,
        capturedAt,
        uiText,
        resultSummary: resultSummary(uiText),
        status: testInfo.status || 'unknown',
        score,
        error: failureDetails(testInfo.error)
    };

    const resultPath = saveJsonResult(`${testCaseId}-test-result-${timestamp}.json`, resultData);

    await testInfo.attach(`${testCaseId} Test Result JSON`, {
        path: resultPath,
        contentType: 'application/json'
    });

    return resultPath;
}

/**
 * Registers an afterEach hook that records screenshots and structured results.
 *
 * @param {import('@playwright/test').TestType} test - Playwright test object.
 * @param {object} options - Capture options forwarded to captureTestRunResult.
 */
export function registerResultCapture(test, options) {
    test.afterEach(async ({ page }, testInfo) => {
        try {
            await captureTestRunResult({
                page,
                testInfo,
                ...options
            });
        } catch (error) {
            // Result capture is observational: it must never mask the test's
            // original pass/fail outcome.
            console.warn(
                `[${options.fallbackTestCaseId || options.module}] Result capture failed: ` +
                    `${error.message || error}`
            );
        }
    });
}
