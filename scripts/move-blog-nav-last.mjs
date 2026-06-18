import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BLOG_LINE = /<li(?: class="active")?><a href="blog\.html">blog<\/a><\/li>\s*\n?/gi;

function moveBlogNav(html) {
  if (!html.includes('contact.html">contact')) return html;

  html = html.replace(BLOG_LINE, '');

  if (html.includes('href="blog.html"')) return html;

  return html.replace(
    /(\n[ \t]*)(<li(?: class="active")?><a href="contact\.html">contact<\/a><\/li>)/i,
    (_, indent, contactLi) => `${indent}${contactLi}\n${indent}<li><a href="blog.html">blog</a></li>`
  );
}

let updated = 0;
const files = [
  ...fs.readdirSync(ROOT).filter((f) => f.endsWith('.html')),
  ...['partials/site-header.html'].filter((f) => fs.existsSync(path.join(ROOT, f))),
];

for (const file of files) {
  const filePath = path.join(ROOT, file);
  const original = fs.readFileSync(filePath, 'utf8');
  const next = moveBlogNav(original);
  if (next !== original) {
    fs.writeFileSync(filePath, next);
    updated++;
  }
}

console.log(`Blog nav moved to last position in ${updated} files.`);
