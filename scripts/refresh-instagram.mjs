/**
 * Fetches Instagram posts and saves thumbnails locally (neutral paths for ad-blocker safety).
 * Run: npm run ig:refresh
 */
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const USERNAME = 'ramdevraforge';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_JSON = join(ROOT, 'data', 'instagram-posts.json');
const IMG_DIR = join(ROOT, 'images', 'gallery');

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'X-IG-App-ID': '936619743392459',
  'X-Requested-With': 'XMLHttpRequest',
  'X-ASBD-ID': '129477',
  'Sec-Fetch-Site': 'same-origin',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Dest': 'empty',
  Referer: `https://www.instagram.com/${USERNAME}/`,
  Accept: '*/*',
};

const res = await fetch(
  `https://www.instagram.com/api/v1/users/web_profile_info/?username=${USERNAME}`,
  { headers }
);

if (!res.ok) {
  console.error('Instagram API error:', res.status);
  process.exit(1);
}

const data = await res.json();
const edges = data?.data?.user?.edge_owner_to_timeline_media?.edges || [];
mkdirSync(IMG_DIR, { recursive: true });

const posts = [];
for (const { node } of edges.slice(0, 12)) {
  const shortcode = node.shortcode;
  const remote =
    node.thumbnail_resources?.slice(-1)[0]?.src || node.thumbnail_src || node.display_url;
  const localPath = `images/gallery/${shortcode}.jpg`;
  const localFile = join(IMG_DIR, `${shortcode}.jpg`);

  try {
    const imgRes = await fetch(remote, { headers: { 'User-Agent': headers['User-Agent'] } });
    if (imgRes.ok) {
      const buf = Buffer.from(await imgRes.arrayBuffer());
      writeFileSync(localFile, buf);
    }
  } catch (err) {
    console.warn('Image download failed for', shortcode, err.message);
  }

  posts.push({
    shortcode,
    url: `https://www.instagram.com/p/${shortcode}/`,
    image: localPath,
    isVideo: Boolean(node.is_video),
  });
}

const payload = {
  username: USERNAME,
  profileUrl: `https://www.instagram.com/${USERNAME}/`,
  updatedAt: new Date().toISOString().slice(0, 10),
  posts,
};

writeFileSync(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(`Saved ${posts.length} posts to data/instagram-posts.json`);
