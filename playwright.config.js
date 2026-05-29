import { defineConfig }
from '@playwright/test';

export default defineConfig({

    testDir: './tests',

    timeout: 300000,

    expect: {

        timeout: 30000

    },

    use: {

        headless: false,

        viewport: {

            width: 1440,
            height: 900

        },

        actionTimeout: 20000,

        baseURL:
            'https://grounded-topaz.vercel.app/dashboard',

        trace: 'on-first-retry',

        screenshot:
            'only-on-failure',

        video:
            'retain-on-failure'

    }

});