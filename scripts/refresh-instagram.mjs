/**
 * Refreshes data/instagram-posts.json from the public Instagram profile API.
 * Run locally: npm run ig:refresh
 */
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const USERNAME = 'ramdevraforge';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'instagram-posts.json');

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
  console.error('Instagram API error:', res.status, await res.text());
  process.exit(1);
}

const data = await res.json();
const edges = data?.data?.user?.edge_owner_to_timeline_media?.edges || [];
const posts = edges.slice(0, 12).map(({ node }) => ({
  shortcode: node.shortcode,
  url: `https://www.instagram.com/p/${node.shortcode}/`,
  image: node.thumbnail_resources?.slice(-1)[0]?.src || node.thumbnail_src || node.display_url,
  isVideo: Boolean(node.is_video),
}));

const payload = {
  username: USERNAME,
  profileUrl: `https://www.instagram.com/${USERNAME}/`,
  updatedAt: new Date().toISOString().slice(0, 10),
  posts,
};

writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(`Wrote ${posts.length} posts to data/instagram-posts.json`);
