/**
 * Vercel serverless — fetches recent public Instagram posts for the homepage feed.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const USERNAME = 'ramdevraforge';
const IG_HEADERS = {
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
  'Accept-Language': 'en-US,en;q=0.9',
};

function mapEdges(edges) {
  return edges.slice(0, 12).map(({ node }) => ({
    shortcode: node.shortcode,
    url: `https://www.instagram.com/p/${node.shortcode}/`,
    image: node.thumbnail_resources?.slice(-1)[0]?.src || node.thumbnail_src || node.display_url,
    caption: node.edge_media_to_caption?.edges?.[0]?.node?.text?.slice(0, 140) || '',
    isVideo: Boolean(node.is_video),
  }));
}

async function fetchViaApi() {
  const res = await fetch(
    `https://www.instagram.com/api/v1/users/web_profile_info/?username=${USERNAME}`,
    { headers: IG_HEADERS }
  );
  if (!res.ok) return null;

  const data = await res.json();
  const edges = data?.data?.user?.edge_owner_to_timeline_media?.edges;
  return Array.isArray(edges) ? mapEdges(edges) : null;
}

async function fetchViaProfileHtml() {
  const res = await fetch(`https://www.instagram.com/${USERNAME}/`, {
    headers: { 'User-Agent': IG_HEADERS['User-Agent'], Accept: 'text/html' },
  });
  if (!res.ok) return null;

  const html = await res.text();
  const shortcodes = [
    ...new Set([...html.matchAll(/"shortcode":"([A-Za-z0-9_-]{6,})"/g)].map((m) => m[1])),
  ];
  const displayUrls = [
    ...html.matchAll(/"display_url":"([^"]+)"/g),
  ].map((m) => m[1].replace(/\\u0026/g, '&'));

  if (!shortcodes.length || !displayUrls.length) return null;

  const posts = shortcodes.slice(0, 12).map((shortcode, index) => ({
    shortcode,
    url: `https://www.instagram.com/p/${shortcode}/`,
    image: displayUrls[index] || displayUrls[0],
    caption: '',
    isVideo: false,
  }));

  return posts.filter((p) => p.image);
}

function loadFallbackPosts() {
  try {
    const file = join(process.cwd(), 'data', 'instagram-posts.json');
    const data = JSON.parse(readFileSync(file, 'utf8'));
    return Array.isArray(data.posts) ? data.posts : [];
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const live = (await fetchViaApi()) || (await fetchViaProfileHtml());
    const posts = live?.length ? live : loadFallbackPosts();
    return res.status(200).json({
      ok: posts.length > 0,
      username: USERNAME,
      profileUrl: `https://www.instagram.com/${USERNAME}/`,
      posts,
      source: live?.length ? 'live' : 'cached',
    });
  } catch {
    const posts = loadFallbackPosts();
    return res.status(200).json({
      ok: posts.length > 0,
      username: USERNAME,
      profileUrl: `https://www.instagram.com/${USERNAME}/`,
      posts,
      source: 'cached',
    });
  }
}
