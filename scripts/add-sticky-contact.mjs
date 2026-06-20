/**
 * Inject sticky contact CSS/JS on all public HTML pages.
 * Run: npm run sticky:add
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MARKER = '<!-- RF-STICKY-CONTACT -->';
const SNIPPET = `${MARKER}
<link rel="stylesheet" href="/css/sticky-contact.css" media="screen">
<script src="/js/sticky-contact.js" defer></script>
`;

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'admin') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

let updated = 0;
for (const file of walk(ROOT)) {
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes(MARKER) || html.includes('sticky-contact.js')) continue;
  if (!html.includes('</body>')) continue;
  html = html.replace('</body>', `${SNIPPET}</body>`);
  fs.writeFileSync(file, html);
  updated++;
}

console.log(`Sticky contact added to ${updated} pages.`);
