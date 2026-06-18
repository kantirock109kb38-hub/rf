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

async function loadPost() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  if (!slug) {
    loading.style.display = 'none';
    errorEl.style.display = 'block';
    errorEl.innerHTML = 'Post not found. <a href="blog.html">Back to blog</a>';
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

    document.title = `${data.title} | Ramdevra Forge & Fittings Blog`;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = data.excerpt || data.title;
    }

    const date = formatDate(data.published_at || data.created_at);
    const cover = data.cover_image
      ? `<img class="blog-post-cover" src="${escapeHtml(data.cover_image)}" alt="${escapeHtml(data.title)}">`
      : '';

    article.innerHTML = `
      <div class="blog-post-back"><a href="blog.html">&larr; Back to Blog</a></div>
      ${cover}
      <header class="blog-post-header">
        <h1>${escapeHtml(data.title)}</h1>
        <div class="blog-post-meta">
          ${date} · ${escapeHtml(data.author_name || 'Ramdevra Forge')}
        </div>
      </header>
      <div class="blog-post-content">${data.content}</div>`;

    article.style.display = 'block';
    loading.style.display = 'none';
  } catch (err) {
    loading.style.display = 'none';
    errorEl.style.display = 'block';
    errorEl.innerHTML = 'Post not found. <a href="blog.html">Back to blog</a>';
    console.error(err);
  }
}

loadPost();
