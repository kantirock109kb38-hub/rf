import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT_TAG = '<script type="module" src="js/enquiry-links.js"></script>\n';
let updated = 0;

for (const file of fs.readdirSync(ROOT).filter((f) => f.endsWith('-supplier-exporter.html'))) {
  let html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  if (html.includes('enquiry-links.js')) continue;
  html = html.replace('<!--main js file end-->', SCRIPT_TAG + '<!--main js file end-->');
  fs.writeFileSync(path.join(ROOT, file), html);
  updated++;
}

console.log(`Enquiry link script added to ${updated} product pages.`);
