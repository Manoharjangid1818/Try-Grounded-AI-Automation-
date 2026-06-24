import { test } from '@playwright/test';

import dotenv from 'dotenv';

import { LoginPage } from '../pages/LoginPage.js';

import { registerResultCapture } from '../utils/testResultCapture.js';

dotenv.config();

registerResultCapture(test, {
    module: 'Authentication',
    fallbackTestCaseId: 'AUTH_SETUP'
});

test('Authentication Setup', async ({ page }) => {

    test.setTimeout(120000);

    const loginPage = new LoginPage(page);

    await loginPage.gotoLoginPage();

    await loginPage.login(
        process.env.EMAIL,
        process.env.PASSWORD
    );

    console.log('Enter OTP manually');

    // Wait until dashboard appears
    await page.waitForURL('**/dashboard');

    // Save session
    await page.context().storageState({
        path: 'auth/user.json'
    });

    console.log('Session Saved Successfully');

});
