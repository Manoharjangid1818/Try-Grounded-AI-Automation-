import fs from 'fs';
import path from 'path';

const HISTORY_DIR = path.resolve('./results/history');

function ensureHistoryDir() {
    if (!fs.existsSync(HISTORY_DIR)) {
        fs.mkdirSync(HISTORY_DIR, { recursive: true });
    }
}

function historyPathFor(testCaseId) {
    return path.join(HISTORY_DIR, `${testCaseId}.json`);
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

    const filePath = historyPathFor(testCaseId);
    let arr = [];


    if (fs.existsSync(filePath)) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) arr = parsed;
        } catch {
            // If corrupted, start fresh to avoid blocking tests.
            arr = [];
        }
    }

    const runId = arr.length; // simple incrementing index

    const next = {
        runId,
        timestamp: new Date().toISOString(),
        ...entry
    };

    arr.push(next);

    // keep last 20
    if (arr.length > 20) {
        arr = arr.slice(arr.length - 20);
    }

    fs.writeFileSync(filePath, JSON.stringify(arr, null, 2));
    return next;
}

export function getPreviousEntry(testCaseId) {
    ensureHistoryDir();

    const filePath = historyPathFor(testCaseId);
    if (!fs.existsSync(filePath)) return null;

    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const arr = JSON.parse(content);
        if (!Array.isArray(arr)) return null;
        if (arr.length < 2) return null;
        return arr[arr.length - 2];
    } catch {
        return null;
    }
}

