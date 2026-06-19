/**
 * Rewrite internal .html links to clean URLs across HTML/JS files.
 * Run: npm run urls:clean
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { toCleanHref } from './url-utils.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const SKIP_DIRS = new Set(['node_modules', '.git', '.vercel', 'fonts', 'js/plugins']);

function shouldProcessFile(file) {
  const ext = path.extname(file).toLowerCase();
  if (!['.html', '.js', '.mjs'].includes(ext)) return false;
  if (file.includes('fontawesome')) return false;
  if (file.includes('revolution')) return false;
  if (file.endsWith('clean-urls.mjs')) return false;
  return true;
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (shouldProcessFile(full)) files.push(full);
  }
  return files;
}

function patchHrefAttributes(content) {
  return content.replace(
    /(\s(?:href|data-page)=["'])([^"']+)(["'])/gi,
    (match, prefix, href, suffix) => {
      if (href.includes('partials/') || href.includes('site-header') || href.includes('site-footer')) {
        return match;
      }
      const cleaned = toCleanHref(href);
      return cleaned === href ? match : `${prefix}${cleaned}${suffix}`;
    }
  );
}

function patchLocationAssignments(content) {
  return content
    .replace(/window\.location\.href\s*=\s*['"]\/dashboard['"]/g, "window.location.href = '/admin/dashboard'")
    .replace(
      /(window\.location\.href\s*=\s*['"])([^'"]+\.html(?:\?[^'"]*)?)(['"])/g,
      (match, prefix, href, suffix) => {
        const cleaned = toCleanHref(href);
        return cleaned === href ? match : `${prefix}${cleaned}${suffix}`;
      }
    );
}

function patchCanonicalAndOg(content) {
  let next = content;
  next = next.replace(
    /(<link\s+rel=["']canonical["']\s+href=["'])https:\/\/www\.rfflanges\.com\/([^"']*\.html)(["'])/gi,
    (_, pre, file, post) => `${pre}${toCleanHref(`https://www.rfflanges.com/${file}`).replace('https://www.rfflanges.com', 'https://www.rfflanges.com')}${post}`
  );
  // Fix canonical/og absolute URLs
  next = next.replace(
    /(https:\/\/www\.rfflanges\.com\/)([a-z0-9-]+)\.html/gi,
    (_, base, slug) => (slug === 'index' ? `${base}` : `${base}${slug}`)
  );
  next = next.replace(/https:\/\/www\.rfflanges\.com\/index\.html/gi, 'https://www.rfflanges.com/');
  next = next.replace(
    /https:\/\/www\.rfflanges\.com\/blog-post\.html\?slug=([^"'\s&]+)/gi,
    (_, slug) => `https://www.rfflanges.com/blog/${decodeURIComponent(slug)}`
  );
  return next;
}

let updated = 0;
for (const file of walk(ROOT)) {
  const original = fs.readFileSync(file, 'utf8');
  let next = patchHrefAttributes(original);
  next = patchLocationAssignments(next);
  if (file.endsWith('.html')) next = patchCanonicalAndOg(next);
  if (next !== original) {
    fs.writeFileSync(file, next);
    updated++;
  }
}

console.log(`Clean URLs applied to ${updated} files.`);
