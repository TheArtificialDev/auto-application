import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FORBIDDEN_PATTERNS = [
  { pattern: /fetch\s*\(/g, message: 'fetch is forbidden' },
  { pattern: /XMLHttpRequest/g, message: 'XMLHttpRequest is forbidden' },
  { pattern: /sendBeacon/g, message: 'sendBeacon is forbidden' },
  { pattern: /chrome\.storage\.sync/g, message: 'chrome.storage.sync is forbidden' },
];

let failed = false;

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const { pattern, message } of FORBIDDEN_PATTERNS) {
        if (pattern.test(content)) {
          console.error(`Error in ${fullPath}: ${message}`);
          failed = true;
        }
      }
    }
  }
}

walk(path.join(__dirname, '../src'));

if (failed) {
  process.exit(1);
} else {
  console.log("Guardrails passed.");
}
