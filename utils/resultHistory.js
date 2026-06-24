import fs from 'fs';
import path from 'path';

const HISTORY_DIR = path.resolve('./results/history');
const HISTORY_FILE = path.join(HISTORY_DIR, 'history.json');

function readLegacyHistory() {
    if (!fs.existsSync(HISTORY_DIR)) {
        return [];
    }

    const history = [];
    const legacyFiles = fs.readdirSync(HISTORY_DIR)
        .filter((fileName) => fileName.endsWith('.json'))
        .filter((fileName) => fileName !== 'history.json')
        .sort();

    for (const fileName of legacyFiles) {
        try {
            const parsed = JSON.parse(
                fs.readFileSync(path.join(HISTORY_DIR, fileName), 'utf-8')
            );

            if (!Array.isArray(parsed)) continue;

            const defaultTestCaseId = path.basename(fileName, '.json');

            for (const entry of parsed) {
                const {
                    runId: ignoredRunId,
                    timestamp,
                    testCaseId,
                    ...details
                } = entry;

                history.push({
                    runId: history.length,
                    timestamp: timestamp || new Date().toISOString(),
                    testCaseId: testCaseId || defaultTestCaseId,
                    ...details
                });
            }
        } catch {
            // Ignore malformed legacy files; a valid consolidated history can
            // still be created from every other history file.
        }
    }

    return history;
}

function ensureHistoryDir() {
    if (!fs.existsSync(HISTORY_DIR)) {
        fs.mkdirSync(HISTORY_DIR, { recursive: true });
    }

    if (!fs.existsSync(HISTORY_FILE)) {
        const legacyHistory = readLegacyHistory();

        if (legacyHistory.length) {
            fs.writeFileSync(
                HISTORY_FILE,
                JSON.stringify(legacyHistory, null, 2)
            );
        }
    }
}

function readHistory() {
    if (!fs.existsSync(HISTORY_FILE)) {
        return [];
    }

    try {
        const parsed = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        // Preserve test execution when an old history file is malformed.
        return [];
    }
}

export function extractScore(pageText, pattern) {
    if (!pageText) return null;

    const re = pattern || /(?:GR|Grounding)\s*Score\D{0,10}([\d.]+\s*(?:%|\/\s*\d+)?)/i;
    const match = pageText.match(re);
    if (!match) return null;

    const raw = String(match[1]).trim();
    return raw;
}

export function appendToHistory(testCaseId, entry) {
    ensureHistoryDir();

    const history = readHistory();

    const next = {
        runId: history.length,
        timestamp: new Date().toISOString(),
        testCaseId,
        ...entry
    };

    history.push(next);

    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
    return next;
}

export function getPreviousEntry(testCaseId) {
    ensureHistoryDir();

    const testCaseHistory = readHistory().filter(
        (entry) => entry.testCaseId === testCaseId
    );

    if (testCaseHistory.length < 2) return null;

    return testCaseHistory[testCaseHistory.length - 2];
}

