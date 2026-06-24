/**
 * Injects Elfsight-style Instagram feed markup into index.html.
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const INDEX = join(ROOT, 'index.html');
const DATA = join(ROOT, 'data', 'instagram-posts.json');

const START = '<!-- RF-SOCIAL-GRID:START -->';
const END = '<!-- RF-SOCIAL-GRID:END -->';

const IG_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>';

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const data = JSON.parse(readFileSync(DATA, 'utf8'));
const { posts = [], profile = {}, username = 'ramdevraforge' } = data;
const avatar = esc((profile.avatar || 'images/gallery/profile.jpg').replace(/^\//, ''));
const fullName = esc(profile.fullName || 'RAMDEVRA FORGE');
const handle = esc(profile.username || username);

const postHtml = posts
  .map((post) => {
    const image = esc(post.image).replace(/^\//, '');
    const video = post.isVideo
      ? '<span class="eapps-instagram-feed-posts-item-video-badge" aria-hidden="true"><i class="fa fa-play"></i></span>'
      : '';
    return (
      `<div class="eapps-instagram-feed-posts-item" data-sc="${esc(post.shortcode)}" role="button" tabindex="0" aria-label="View post">` +
      `<div class="eapps-instagram-feed-posts-item-image"><img src="${image}" alt="" width="320" height="320" /></div>` +
      `<div class="eapps-instagram-feed-posts-item-overlay">${IG_ICON}</div>` +
      `${video}</div>`
    );
  })
  .join('\n');

const widgetHtml = `<div class="eapps-instagram-feed" id="rf-social-feed" data-user="${handle}">
<div class="eapps-instagram-feed-header">
<div class="eapps-instagram-feed-header-inner">
<button type="button" class="eapps-instagram-feed-header-user-image" data-action="profile" aria-label="View profile"><img src="${avatar}" alt="${handle}" width="48" height="48" /></button>
<div class="eapps-instagram-feed-header-user">
<div class="eapps-instagram-feed-header-user-name">${handle}</div>
<div class="eapps-instagram-feed-header-user-fullname">${fullName}</div>
</div>
</div>
<button type="button" class="eapps-instagram-feed-header-follow-button" data-action="profile">Follow</button>
</div>
<div class="eapps-instagram-feed-container">
<div class="eapps-instagram-feed-posts-grid">
${postHtml}
</div>
</div>
</div>`;

let html = readFileSync(INDEX, 'utf8');
if (!html.includes(START) || !html.includes(END)) {
  console.error('Markers RF-SOCIAL-GRID:START/END not found in index.html');
  process.exit(1);
}

const pattern = new RegExp(`${START}[\\s\\S]*?${END}`);
html = html.replace(pattern, `${START}\n${widgetHtml}\n${END}`);
writeFileSync(INDEX, html, 'utf8');
console.log(`Injected Elfsight-style feed with ${posts.length} posts into index.html`);
