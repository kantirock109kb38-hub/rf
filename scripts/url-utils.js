/** Clean URL helpers for static HTML site on Vercel */
import { SITE } from './seo-config.js';

export function pagePath(filename) {
  if (!filename) return '/';
  const normalized = filename.replace(/^\//, '');
  if (normalized === 'index.html') return '/';
  if (normalized === 'admin/index.html') return '/admin';
  const withoutExt = normalized.replace(/\.html$/, '');
  return `/${withoutExt}`;
}

export function pageUrl(filename) {
  const path = pagePath(filename);
  return path === '/' ? `${SITE.url}/` : `${SITE.url}${path}`;
}

/** Convert internal .html href to clean site path */
export function toCleanHref(href) {
  if (
    !href ||
    /^https?:\/\//i.test(href) ||
    href.startsWith('//') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('javascript:') ||
    href.startsWith('#')
  ) {
    return href;
  }

  const blogMatch = href.match(/^(?:\.\.\/)?blog-post\.html\?slug=([^&#]+)/);
  if (blogMatch) {
    const slug = decodeURIComponent(blogMatch[1]);
    const hash = href.includes('#') ? href.slice(href.indexOf('#')) : '';
    return `/blog/${slug}${hash}`;
  }

  const [pathPart, ...restParts] = href.split(/(?=[?#])/);
  const suffix = restParts.join('');

  if (!/\.html$/i.test(pathPart)) return href;

  let path = pathPart.replace(/^\.\//, '');
  while (path.startsWith('../')) path = path.slice(3);

  if (path === 'index.html') return `/${suffix}`;
  if (path === 'admin/index.html') return `/admin${suffix}`;
  if (path.endsWith('.html')) path = path.slice(0, -5);

  return `/${path}${suffix}`;
}
