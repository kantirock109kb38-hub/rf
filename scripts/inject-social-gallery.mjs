/**
 * Injects gallery tiles into index.html using the same Owl Carousel markup as "Our clients".
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const INDEX = join(ROOT, 'index.html');
const DATA = join(ROOT, 'data', 'instagram-posts.json');

const START = '<!-- RF-SOCIAL-GRID:START -->';
const END = '<!-- RF-SOCIAL-GRID:END -->';

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const { posts = [] } = JSON.parse(readFileSync(DATA, 'utf8'));
const gridHtml = posts
  .map((post) => {
    const image = esc(post.image).replace(/^\/images\//, 'images/');
    const video = post.isVideo
      ? '<span class="rf-ig-video" aria-hidden="true"><i class="fa fa-play"></i></span>'
      : '';
    return (
      `<div class="item" data-sc="${esc(post.shortcode)}" role="button" tabindex="0" aria-label="View product photo">` +
      `<div class="item-inner">` +
      `<img src="${image}" alt="Ramdevra Forge product photo" width="320" height="320" />` +
      `${video}</div></div>`
    );
  })
  .join('\n');

let html = readFileSync(INDEX, 'utf8');
if (!html.includes(START) || !html.includes(END)) {
  console.error('Markers RF-SOCIAL-GRID:START/END not found in index.html');
  process.exit(1);
}

const pattern = new RegExp(`${START}[\\s\\S]*?${END}`);
html = html.replace(pattern, `${START}\n${gridHtml}\n${END}`);
writeFileSync(INDEX, html, 'utf8');
console.log(`Injected ${posts.length} gallery tiles into index.html`);
