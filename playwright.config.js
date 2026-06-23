import { defineConfig } from '@playwright/test';

import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({

    testDir: './tests',

    timeout: 300000,

    expect: {
        timeout: 30000
    },

    reporter: [
        ['list'],

        [
            'html',
            {
                outputFolder: 'playwright-report',
                open: 'never'
            }
        ],

        [
            'json',
            {
                outputFile: 'results/playwright-results.json'
            }
        ],

        [
            'junit',
            {
                outputFile: 'results/junit-results.xml'
            }
        ]
    ],

    use: {

        baseURL:
            process.env.BASE_URL ||
            'https://grounded-topaz.vercel.app/dashboard',

        headless:
            process.env.HEADLESS === 'true',

        viewport: {
            width: 1440,
            height: 900
        },

        screenshot: 'only-on-failure',

        video: 'retain-on-failure',

        trace: 'on-first-retry'
    },

    retries:
        process.env.CI ? 1 : 0,

    workers:
        process.env.CI ? 2 : 1
});