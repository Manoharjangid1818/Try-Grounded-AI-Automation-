/**
 * Captures a full-page screenshot and attaches it to the current Playwright test.
 *
 * @param {import('@playwright/test').Page} page - Playwright page instance.
 * @param {import('@playwright/test').TestInfo} testInfo - Current test metadata.
 * @param {string} screenshotName - Attachment and file name without extension.
 * @returns {Promise<string>} Path to the screenshot file.
 */
export async function captureFullPageScreenshot(page, testInfo, screenshotName) {
    const screenshotPath = testInfo.outputPath(`${screenshotName}.png`);

    await page.screenshot({
        path: screenshotPath,
        fullPage: true
    });

    await testInfo.attach(screenshotName, {
        path: screenshotPath,
        contentType: 'image/png'
    });

    return screenshotPath;
}
