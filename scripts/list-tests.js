import fs from 'fs';
import path from 'path';

const testsDir = path.join(process.cwd(), 'tests');

function listTestFiles() {
  if (!fs.existsSync(testsDir)) return [];
  return fs
    .readdirSync(testsDir)
    .filter((f) => f.endsWith('.spec.js'))
    .map((f) => path.join('tests', f));
}

const files = listTestFiles();
console.log(files.join('\n'));

