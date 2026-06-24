import fs from 'fs';

import path from 'path';

const RESULTS_FILE = path.resolve(
    './results/ui-results/all-ui-results.json'
);

function readResults() {
    if (!fs.existsSync(RESULTS_FILE)) {
        return [];
    }

    try {
        const parsed = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8'));
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        // A malformed result file must not block a test run from recording data.
        return [];
    }
}

function ensureResultsDirectory() {
    const resultsDir = path.dirname(RESULTS_FILE);

    if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
    }
}

export function saveJsonResult(fileName, resultData) {
    ensureResultsDirectory();

    const results = readResults();
    const timestamp = resultData?.capturedAt || new Date().toISOString();

    const runResult = {
        runId: results.length,
        timestamp,
        captureName: fileName,
        ...resultData
    };

    results.push(runResult);

    fs.writeFileSync(
        RESULTS_FILE,
        JSON.stringify(results, null, 2)
    );

    return RESULTS_FILE;
}
