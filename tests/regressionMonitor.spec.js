import { test } from '@playwright/test';

import { RegressionMonitorPage }
from '../pages/RegressionMonitorPage.js';

test.use({

    storageState:
        'auth/user.json'

});

test.describe(

    'Regression Monitor Tests',

    () => {

        test(

            'Verify Regression Monitor Works Successfully',

            async ({ page }) => {

                const regressionMonitorPage =
                    new RegressionMonitorPage(
                        page
                    );

                await page.goto(
                    'https://grounded-topaz.vercel.app/dashboard'
                );

                await regressionMonitorPage
                    .openTestHistory();

                await regressionMonitorPage
                    .scheduleTest();

                await regressionMonitorPage
                    .openRegressionMonitor();

                await regressionMonitorPage
                    .runRegressionMonitor();

            }

        );

    }

);