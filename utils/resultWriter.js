import fs from 'fs';

import path from 'path';

export function saveJsonResult(fileName, resultData) {

    const resultsDir = path.resolve('./results/ui-results');

    if (!fs.existsSync(resultsDir)) {

        fs.mkdirSync(resultsDir, {
            recursive: true
        });
    }

    const filePath = path.join(resultsDir, fileName);

    fs.writeFileSync(
        filePath,
        JSON.stringify(resultData, null, 2)
    );

    return filePath;
}