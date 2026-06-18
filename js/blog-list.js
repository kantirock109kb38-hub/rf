import { getSupabase, formatDate, stripHtml, truncate } from './supabase-client.js';

const grid = document.getElementById('blog-grid');
const loading = document.getElementById('blog-loading');
const empty = document.getElementById('blog-empty');
const errorEl = document.getElementById('blog-error');

function cardHtml(post) {
  const img = post.cover_image || 'images/logo.jpg';
  const excerpt = post.excerpt || truncate(stripHtml(post.content), 180);
  const date = formatDate(post.published_at || post.created_at);
  const author = post.author_name || 'Ramdevra Forge';

  return `
    <article class="blog-card fixit_custom_anim">
      <a href="/blog/${encodeURIComponent(post.slug)}" class="blog-card-image">
        <img src="${img}" alt="${escapeAttr(post.title)}" loading="lazy">
      </a>
      <div class="blog-card-body">
        <div class="blog-card-meta">
          <span class="date">${date}</span>
          <span class="author">${escapeAttr(author)}</span>
        </div>
        <h2 class="blog-card-title">
          <a href="/blog/${encodeURIComponent(post.slug)}">${escapeHtml(post.title)}</a>
        </h2>
        <p class="blog-card-excerpt">${escapeHtml(excerpt)}</p>
        <a href="/blog/${encodeURIComponent(post.slug)}" class="fixit_btn blog-read-more">Read More</a>
      </div>
    </article>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/'/g, '&#39;');
}

async function loadPosts() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, content, cover_image, author_name, published_at, created_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) throw error;

    loading.style.display = 'none';

    if (!data?.length) {
      empty.style.display = 'block';
      return;
    }

    grid.innerHTML = data.map(cardHtml).join('');
    grid.style.display = 'grid';
  } catch (err) {
    loading.style.display = 'none';
    errorEl.style.display = 'block';
    errorEl.textContent =
      err.message?.includes('not configured')
        ? 'Blog is being set up. Please check back soon.'
        : 'Unable to load blog posts. Please try again later.';
    console.error(err);
  }
}

loadPosts();
