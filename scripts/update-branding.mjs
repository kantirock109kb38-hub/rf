import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NEW_EMAIL = 'sales@rfflanges.com';
const CLEAN_FOOTER =
  'Copyright &copy; Ramdevra Forge & Fittings 2020. | <a href="https://www.rfflanges.com/">RF Flanges</a> | <a href="sitemap.html">Sitemap</a>';

function patchContent(content) {
  let next = content;

  next = next.replace(/sales@ramdevraforge\.com/gi, NEW_EMAIL);
  next = next.replace(/sales@seamacpiping\.com/gi, NEW_EMAIL);

  next = next.replace(
    /\s*Design and SEO by <a href="https:\/\/www\.linkedin\.com\/in\/hiralal-purohit-b29144169\/">Hiralal Purohit<\/a> \|/gi,
    ''
  );

  next = next.replace(
    /Copyright &copy; Seamac Piping Solutions 2019\. Design and SEO by <a href="https:\/\/www\.rathinfotech\.com\/">RATH Infotech<\/a> \| <a href="https:\/\/www\.pipingmart\.com\/">Piping Mart<\/a> \| <a href="https:\/\/www\.seamacpiping\.com\/sitemap\.html">Sitemap<\/a>/gi,
    CLEAN_FOOTER
  );

  next = next.replace(
    /Copyright &copy; Ramdevra Forge & Fittings 2020\. \| <a href="https:\/\/www\.ramdevraforge\.com\/">Ramdevra Forge<\/a> \| <a href="sitemap\.html">Sitemap<\/a>/gi,
    CLEAN_FOOTER
  );

  next = next.replace(
    /Copyright &copy; Ramdevra Forge & Fittings 2020\. <a href="https:\/\/www\.ramdevraforge\.com\/">Ramdevra Forge<\/a> \| <a href="sitemap\.html">Sitemap<\/a>/gi,
    CLEAN_FOOTER
  );

  return next;
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.vercel') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(html|js|txt|json|mjs)$/i.test(entry.name)) files.push(full);
  }
  return files;
}

let updated = 0;
for (const file of walk(ROOT)) {
  const original = fs.readFileSync(file, 'utf8');
  const next = patchContent(original);
  if (next !== original) {
    fs.writeFileSync(file, next);
    updated++;
  }
}

console.log(`Updated ${updated} files with new email and footer cleanup.`);
