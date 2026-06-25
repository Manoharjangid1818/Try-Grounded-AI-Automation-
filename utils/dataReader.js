import fs from 'fs';

import path from 'path';

/**
 * Reads and parses a JSON test data file.
 *
 * @param {string} filePath - Relative or absolute JSON file path.
 * @returns {unknown} Parsed JSON content.
 * @throws {Error} When the file does not exist or contains invalid JSON.
 */
export function readJsonFile(filePath) {
    const absolutePath = path.resolve(filePath);

    if (!fs.existsSync(absolutePath)) {
        throw new Error(`Test data file not found: ${absolutePath}`);
    }

    const fileContent = fs.readFileSync(absolutePath, 'utf-8');

    return JSON.parse(fileContent);
}
