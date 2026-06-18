/**
 * Update blog post HTML content links to clean URLs in Supabase.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { toCleanHref } from './url-utils.js';

const { Client } = pg;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadEnvFile(filename) {
  const file = path.join(ROOT, filename);
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile('.env.local');

function patchContent(html) {
  return html.replace(/href="([^"]+\.html[^"]*)"/gi, (match, href) => {
    const cleaned = toCleanHref(href);
    return cleaned === href ? match : `href="${cleaned}"`;
  });
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
const { rows } = await client.query('SELECT id, content FROM public.blog_posts');
let n = 0;
for (const row of rows) {
  const next = patchContent(row.content);
  if (next !== row.content) {
    await client.query('UPDATE public.blog_posts SET content = $1 WHERE id = $2', [next, row.id]);
    n++;
  }
}
await client.end();

// Append published blog posts to sitemap.xml
const sitemapPath = path.join(ROOT, 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');
const { rows: posts } = await (async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const r = await c.query(
    `SELECT slug, published_at FROM public.blog_posts WHERE status = 'published' ORDER BY published_at DESC`
  );
  await c.end();
  return r;
})();

for (const row of posts) {
  const loc = `https://www.rfflanges.com/blog/${encodeURIComponent(row.slug)}`;
  if (sitemap.includes(loc)) continue;
  const lastmod = new Date(row.published_at).toISOString().slice(0, 10);
  const entry = `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.75</priority>
  </url>
`;
  sitemap = sitemap.replace('</urlset>', entry + '</urlset>');
}
fs.writeFileSync(sitemapPath, sitemap);

console.log(`Updated blog content links in ${n} post(s). Sitemap has ${posts.length} blog post URL(s).`);
