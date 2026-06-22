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