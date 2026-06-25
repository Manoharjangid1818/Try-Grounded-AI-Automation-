import fs from 'fs';

import { execSync } from 'child_process';

const testPlanPath = './test-plans/selected-tests.json';

if (!fs.existsSync(testPlanPath)) {
    throw new Error(`Selected test plan file not found: ${testPlanPath}`);
}

const testPlan = JSON.parse(fs.readFileSync(testPlanPath, 'utf-8'));

if (!testPlan.testIds || testPlan.testIds.length === 0) {
    throw new Error('No test IDs found inside selected-tests.json');
}

const grepPattern = testPlan.testIds.join('|');

console.log(`Running selected test cases: ${grepPattern}`);

execSync(
    `set BASE_URL=https://grounded-topaz.vercel.app/dashboard && npx playwright test --grep "${grepPattern}" --config playwright.config.js`,
    {
        stdio: 'inherit'
    }
);
