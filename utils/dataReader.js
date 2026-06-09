import fs from 'fs';

import path from 'path';

export function readJsonFile(filePath) {

    const absolutePath = path.resolve(filePath);

    if (!fs.existsSync(absolutePath)) {

        throw new Error(`Test data file not found: ${absolutePath}`);
    }

    const fileContent = fs.readFileSync(
        absolutePath,
        'utf-8'
    );

    return JSON.parse(fileContent);
}