import { getSupabase, formatDate } from './supabase-client.js';

const article = document.getElementById('blog-post-article');
const loading = document.getElementById('blog-loading');
const errorEl = document.getElementById('blog-error');

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function setMeta(attr, key, value) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}

function setCanonical(url) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = url;
}

function injectArticleSchema(data, canonical) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data.title,
    description: data.excerpt || data.title,
    image: data.cover_image
      ? new URL(data.cover_image, window.location.origin).href
      : 'https://www.rfflanges.com/images/logo.jpg',
    datePublished: data.published_at || data.created_at,
    dateModified: data.updated_at || data.published_at || data.created_at,
    author: {
      '@type': 'Organization',
      name: data.author_name || 'Ramdevra Forge & Fittings',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ramdevra Forge & Fittings',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.rfflanges.com/images/logo.jpg',
      },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
  };

  let script = document.getElementById('blog-article-schema');
  if (!script) {
    script = document.createElement('script');
    script.id = 'blog-article-schema';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schema);
}

function relatedProductsHtml(title, content) {
  const text = `${title} ${content}`.toLowerCase();
  const links = [
    { href: '/stainless-steel-flanges-supplier-exporter', label: 'Stainless Steel Flanges', keys: ['flange', 'astm', 'ansi', 'asme'] },
    { href: '/carbon-steel-astm-a234-pipe-fittings-supplier-exporter', label: 'Carbon Steel Pipe Fittings', keys: ['pipe fitting', 'butt weld', 'oil', 'gas'] },
    { href: '/super-duplex-steel-s32750-s32760-flanges-supplier-exporter', label: 'Super Duplex Flanges', keys: ['duplex', 'super duplex', 's32750'] },
    { href: '/stainless-steel-pipes-supplier-exporter', label: 'Stainless Steel Pipes', keys: ['pipe', 'piping'] },
    { href: '/stainless-steel-forged-fittings-supplier-exporter', label: 'Stainless Steel Forged Fittings', keys: ['forged', 'fitting'] },
    { href: '/contact', label: 'Request a Quote', keys: [] },
  ];

  const matched = links.filter((l) => l.keys.length === 0 || l.keys.some((k) => text.includes(k)));
  const picked = matched.length > 1 ? matched.slice(0, 5) : links.slice(0, 5);

  const items = picked.map((l) => `<li><a href="${l.href}">${escapeHtml(l.label)}</a></li>`).join('');
  return `
      <aside class="blog-related-products">
        <h3>Explore Our Products</h3>
        <ul class="aeo-related-links">${items}</ul>
      </aside>`;
}

async function loadPost() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  if (!slug) {
    loading.style.display = 'none';
    errorEl.style.display = 'block';
    errorEl.innerHTML = 'Post not found. <a href="/blog">Back to blog</a>';
    return;
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !data) throw error || new Error('Not found');

    const canonical = `https://www.rfflanges.com/blog/${encodeURIComponent(data.slug)}`;

    document.title = `${data.title} | Ramdevra Forge & Fittings Blog`;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = data.excerpt || data.title;
    }

    setCanonical(canonical);
    setMeta('property', 'og:type', 'article');
    setMeta('property', 'og:title', data.title);
    setMeta('property', 'og:description', data.excerpt || data.title);
    setMeta('property', 'og:url', canonical);
    setMeta('name', 'twitter:title', data.title);
    setMeta('name', 'twitter:description', data.excerpt || data.title);
    if (data.cover_image) {
      const imgUrl = new URL(data.cover_image, window.location.origin).href;
      setMeta('property', 'og:image', imgUrl);
      setMeta('name', 'twitter:image', imgUrl);
    }
    injectArticleSchema(data, canonical);

    const date = formatDate(data.published_at || data.created_at);
    const cover = data.cover_image
      ? `<img class="blog-post-cover" src="${escapeHtml(data.cover_image)}" alt="${escapeHtml(data.title)}">`
      : '';

    article.innerHTML = `
      <div class="blog-post-back"><a href="/blog">&larr; Back to Blog</a></div>
      ${cover}
      <header class="blog-post-header">
        <h1>${escapeHtml(data.title)}</h1>
        <div class="blog-post-meta">
          ${date} · ${escapeHtml(data.author_name || 'Ramdevra Forge')}
        </div>
      </header>
      <div class="blog-post-content">${data.content}</div>
      ${relatedProductsHtml(data.title, data.content)}`;

    article.style.display = 'block';
    loading.style.display = 'none';
  } catch (err) {
    loading.style.display = 'none';
    errorEl.style.display = 'block';
    errorEl.innerHTML = 'Post not found. <a href="/blog">Back to blog</a>';
    console.error(err);
  }
}

loadPost();
