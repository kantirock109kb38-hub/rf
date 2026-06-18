import { requireAuth, showAlert } from './admin-auth.js';

let supabase = null;
let allLeads = [];
let allPosts = [];
let editingPostId = null;
let editingLeadId = null;
let editorReady = false;

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtDateShort(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

function isToday(d) {
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function isThisWeek(d) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  return d >= start;
}

function isThisMonth(d) {
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function switchTab(tab) {
  document.querySelectorAll('.admin-nav a').forEach((a) => a.classList.toggle('active', a.dataset.tab === tab));
  document.querySelectorAll('.admin-tab-content').forEach((el) => el.classList.toggle('active', el.id === `tab-${tab}`));

  const titles = { leads: 'Lead Dashboard', blogs: 'Blog Posts', editor: editingPostId ? 'Edit Post' : 'New Post' };
  document.getElementById('page-title').textContent = titles[tab] || 'Dashboard';
}

async function initEditor() {
  if (editorReady) return;
  await tinymce.init({
    selector: '#blog-editor',
    height: 480,
    menubar: 'file edit view insert format tools table',
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'wordcount',
    ],
    toolbar:
      'undo redo | blocks | bold italic underline strikethrough | ' +
      'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | ' +
      'link image media table | removeformat code fullscreen',
    block_formats: 'Paragraph=p; Heading 2=h2; Heading 3=h3; Heading 4=h4; Blockquote=blockquote',
    content_style: 'body { font-family: Segoe UI, sans-serif; font-size: 15px; line-height: 1.7; }',
    images_upload_handler: uploadEditorImage,
    promotion: false,
    branding: false,
  });
  editorReady = true;
}

async function uploadEditorImage(blobInfo) {
  const ext = blobInfo.filename().split('.').pop() || 'jpg';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('blog-images').upload(path, blobInfo.blob(), {
    contentType: blobInfo.blob().type,
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('blog-images').getPublicUrl(path);
  return data.publicUrl;
}

async function uploadCoverFile(file) {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('blog-images').upload(path, file, { contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from('blog-images').getPublicUrl(path);
  return data.publicUrl;
}

function updateLeadStats() {
  const today = allLeads.filter((l) => isToday(new Date(l.created_at))).length;
  const week = allLeads.filter((l) => isThisWeek(new Date(l.created_at))).length;
  const month = allLeads.filter((l) => isThisMonth(new Date(l.created_at))).length;
  const newCount = allLeads.filter((l) => l.status === 'new').length;

  document.getElementById('stat-today').textContent = today;
  document.getElementById('stat-week').textContent = week;
  document.getElementById('stat-month').textContent = month;
  document.getElementById('stat-new').textContent = newCount;
}

function filterLeads() {
  const dateFilter = document.getElementById('lead-date-filter').value;
  const statusFilter = document.getElementById('lead-status-filter').value;

  return allLeads.filter((l) => {
    const d = new Date(l.created_at);
    if (dateFilter === 'today' && !isToday(d)) return false;
    if (dateFilter === 'week' && !isThisWeek(d)) return false;
    if (dateFilter === 'month' && !isThisMonth(d)) return false;
    if (statusFilter && l.status !== statusFilter) return false;
    return true;
  });
}

function renderLeads() {
  const tbody = document.getElementById('leads-tbody');
  const filtered = filterLeads();

  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="admin-empty">No leads found</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map((l) => `
    <tr>
      <td>${fmtDateShort(l.created_at)}</td>
      <td>${esc(l.name)}</td>
      <td><a href="mailto:${esc(l.email)}">${esc(l.email)}</a></td>
      <td>${esc(l.phone || '—')}</td>
      <td>${esc(truncate(l.product_interest || '—', 40))}</td>
      <td><span class="admin-badge admin-badge-${l.status}">${l.status}</span></td>
      <td class="admin-actions">
        <button data-lead-view="${l.id}">View</button>
      </td>
    </tr>`).join('');

  tbody.querySelectorAll('[data-lead-view]').forEach((btn) => {
    btn.addEventListener('click', () => openLeadModal(btn.dataset.leadView));
  });
}

async function loadLeads() {
  const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  allLeads = data || [];
  updateLeadStats();
  renderLeads();
}

function openLeadModal(id) {
  const lead = allLeads.find((l) => l.id === id);
  if (!lead) return;
  editingLeadId = id;

  document.getElementById('lead-modal-body').innerHTML = `
    <p><strong>Name:</strong> ${esc(lead.name)}</p>
    <p><strong>Email:</strong> ${esc(lead.email)}</p>
    <p><strong>Phone:</strong> ${esc(lead.phone || '—')}</p>
    <p><strong>Company:</strong> ${esc(lead.company || '—')}</p>
    <p><strong>Product:</strong> ${esc(lead.product_interest || '—')}</p>
    <p><strong>Message:</strong><br>${esc(lead.message || '—')}</p>
    <p><strong>Source:</strong> ${esc(lead.source_page || '—')}</p>
    <p><strong>Submitted:</strong> ${fmtDate(lead.created_at)}</p>`;

  document.getElementById('lead-modal-status').value = lead.status;
  document.getElementById('lead-modal-notes').value = lead.notes || '';
  document.getElementById('lead-modal').style.display = 'flex';
}

async function saveLeadModal() {
  const status = document.getElementById('lead-modal-status').value;
  const notes = document.getElementById('lead-modal-notes').value;
  const { error } = await supabase.from('leads').update({ status, notes }).eq('id', editingLeadId);
  if (error) alert(error.message);
  else {
    document.getElementById('lead-modal').style.display = 'none';
    await loadLeads();
  }
}

function exportLeadsCsv() {
  const filtered = filterLeads();
  const headers = ['Date', 'Name', 'Email', 'Phone', 'Company', 'Product', 'Message', 'Status', 'Source Page', 'Source URL'];
  const rows = filtered.map((l) => [
    l.created_at, l.name, l.email, l.phone || '', l.company || '',
    l.product_interest || '', l.message || '', l.status,
    l.source_page || '', l.source_url || '',
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

function renderPosts() {
  const tbody = document.getElementById('posts-tbody');
  if (!allPosts.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="admin-empty">No posts yet. Create your first blog post!</td></tr>';
    return;
  }

  tbody.innerHTML = allPosts.map((p) => `
    <tr>
      <td><strong>${esc(p.title)}</strong><br><small style="color:#888">${esc(p.slug)}</small></td>
      <td><span class="admin-badge admin-badge-${p.status}">${p.status}</span></td>
      <td>${fmtDateShort(p.published_at)}</td>
      <td>${fmtDateShort(p.updated_at)}</td>
      <td class="admin-actions">
        <button data-post-edit="${p.id}">Edit</button>
        <button data-post-delete="${p.id}" class="danger">Delete</button>
        ${p.status === 'published' ? `<a href="../blog-post.html?slug=${encodeURIComponent(p.slug)}" target="_blank"><button>View</button></a>` : ''}
      </td>
    </tr>`).join('');

  tbody.querySelectorAll('[data-post-edit]').forEach((btn) => {
    btn.addEventListener('click', () => openEditor(btn.dataset.postEdit));
  });
  tbody.querySelectorAll('[data-post-delete]').forEach((btn) => {
    btn.addEventListener('click', () => deletePost(btn.dataset.postDelete));
  });
}

async function loadPosts() {
  const { data, error } = await supabase.from('blog_posts').select('*').order('updated_at', { ascending: false });
  if (error) throw error;
  allPosts = data || [];
  renderPosts();
}

function resetEditor() {
  editingPostId = null;
  document.getElementById('post-title').value = '';
  document.getElementById('post-slug').value = '';
  document.getElementById('post-excerpt').value = '';
  document.getElementById('post-author').value = 'Ramdevra Forge';
  document.getElementById('post-cover').value = '';
  document.getElementById('cover-preview').innerHTML = '';
  document.getElementById('editor-title').textContent = 'New Blog Post';
  if (editorReady) tinymce.get('blog-editor')?.setContent('');
}

async function openEditor(postId) {
  await initEditor();
  resetEditor();

  if (postId) {
    const post = allPosts.find((p) => p.id === postId);
    if (!post) return;
    editingPostId = postId;
    document.getElementById('editor-title').textContent = 'Edit Post';
    document.getElementById('post-title').value = post.title;
    document.getElementById('post-slug').value = post.slug;
    document.getElementById('post-excerpt').value = post.excerpt || '';
    document.getElementById('post-author').value = post.author_name || 'Ramdevra Forge';
    document.getElementById('post-cover').value = post.cover_image || '';
    if (post.cover_image) {
      document.getElementById('cover-preview').innerHTML = `<img src="${post.cover_image}" style="max-width:100%;border-radius:4px">`;
    }
    tinymce.get('blog-editor')?.setContent(post.content || '');
  }

  document.getElementById('nav-editor').style.display = '';
  switchTab('editor');
}

async function savePost(status) {
  await initEditor();
  const title = document.getElementById('post-title').value.trim();
  let slug = document.getElementById('post-slug').value.trim() || slugify(title);
  const content = tinymce.get('blog-editor')?.getContent() || '';

  if (!title) {
    showEditorAlert('Title is required', 'error');
    return;
  }
  if (!content) {
    showEditorAlert('Content is required', 'error');
    return;
  }

  slug = slugify(slug || title);

  const existing = editingPostId ? allPosts.find((p) => p.id === editingPostId) : null;

  const payload = {
    title,
    slug,
    content,
    excerpt: document.getElementById('post-excerpt').value.trim() || null,
    author_name: document.getElementById('post-author').value.trim() || 'Ramdevra Forge',
    cover_image: document.getElementById('post-cover').value.trim() || null,
    status,
    published_at:
      status === 'published'
        ? existing?.published_at || new Date().toISOString()
        : null,
  };

  let error;
  if (editingPostId) {
    ({ error } = await supabase.from('blog_posts').update(payload).eq('id', editingPostId));
  } else {
    ({ error } = await supabase.from('blog_posts').insert(payload));
  }

  if (error) {
    showEditorAlert(error.message.includes('unique') ? 'Slug already exists — choose a different one.' : error.message, 'error');
    return;
  }

  showEditorAlert(status === 'published' ? 'Post published!' : 'Draft saved!', 'success');
  await loadPosts();
  setTimeout(() => {
    switchTab('blogs');
    document.getElementById('nav-editor').style.display = 'none';
  }, 800);
}

async function deletePost(id) {
  if (!confirm('Delete this post permanently?')) return;
  const { error } = await supabase.from('blog_posts').delete().eq('id', id);
  if (error) alert(error.message);
  else await loadPosts();
}

function showEditorAlert(msg, type) {
  const el = document.getElementById('editor-alert');
  el.className = `admin-alert admin-alert-${type === 'error' ? 'error' : 'success'}`;
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 4000);
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function truncate(str, len) {
  const s = String(str);
  return s.length <= len ? s : s.slice(0, len - 1) + '…';
}

async function main() {
  const auth = await requireAuth();
  if (!auth) return;
  supabase = auth.supabase;
  document.getElementById('admin-email').textContent = auth.session.user.email;

  document.getElementById('logout-btn').addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
  });

  document.querySelectorAll('.admin-nav a[data-tab]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      if (a.dataset.tab === 'editor') return;
      switchTab(a.dataset.tab);
    });
  });

  document.getElementById('lead-date-filter').addEventListener('change', renderLeads);
  document.getElementById('lead-status-filter').addEventListener('change', renderLeads);
  document.getElementById('export-leads-btn').addEventListener('click', exportLeadsCsv);
  document.getElementById('lead-modal-save').addEventListener('click', saveLeadModal);
  document.getElementById('lead-modal-close').addEventListener('click', () => {
    document.getElementById('lead-modal').style.display = 'none';
  });

  document.getElementById('new-post-btn').addEventListener('click', () => openEditor(null));
  document.getElementById('cancel-edit-btn').addEventListener('click', () => {
    switchTab('blogs');
    document.getElementById('nav-editor').style.display = 'none';
  });
  document.getElementById('save-draft-btn').addEventListener('click', () => savePost('draft'));
  document.getElementById('publish-btn').addEventListener('click', () => savePost('published'));

  document.getElementById('post-title').addEventListener('input', (e) => {
    if (!editingPostId && !document.getElementById('post-slug').dataset.manual) {
      document.getElementById('post-slug').value = slugify(e.target.value);
    }
  });
  document.getElementById('post-slug').addEventListener('input', () => {
    document.getElementById('post-slug').dataset.manual = '1';
  });

  document.getElementById('cover-upload').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadCoverFile(file);
      document.getElementById('post-cover').value = url;
      document.getElementById('cover-preview').innerHTML = `<img src="${url}" style="max-width:100%;border-radius:4px">`;
    } catch (err) {
      alert('Upload failed: ' + err.message);
    }
  });

  await Promise.all([loadLeads(), loadPosts()]);
}

main().catch(console.error);
