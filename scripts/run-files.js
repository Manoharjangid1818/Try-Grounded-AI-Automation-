import fs from 'fs';

import { execSync } from 'child_process';

const filePlanPath = './test-plans/selected-files.json';

if (!fs.existsSync(filePlanPath)) {
    throw new Error(`Selected files plan not found: ${filePlanPath}`);
}

const filePlan = JSON.parse(fs.readFileSync(filePlanPath, 'utf-8'));

if (!filePlan.files || filePlan.files.length === 0) {
    throw new Error('No files found inside selected-files.json');
}

const files = filePlan.files.join(' ');

console.log(`Running selected files: ${files}`);

execSync(
    `set BASE_URL=https://grounded-topaz.vercel.app/dashboard && npx playwright test ${files}`,
    {
        stdio: 'inherit'
    }
);
