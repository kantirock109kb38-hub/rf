import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm';

function getClient() {
  const cfg = window.SUPABASE_CONFIG;
  if (!cfg?.url || !cfg?.anonKey || cfg.url.includes('YOUR_') || cfg.anonKey.includes('YOUR_')) {
    throw new Error('Configure Supabase env vars and run npm run config:generate.');
  }
  return createClient(cfg.url, cfg.anonKey);
}

async function requireAuth() {
  const supabase = getClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = 'index.html';
    return null;
  }
  return { supabase, session };
}

function showAlert(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
}

// Login page
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = loginForm.querySelector('button[type="submit"]');
    btn.disabled = true;

    try {
      const supabase = getClient();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      window.location.href = 'dashboard.html';
    } catch (err) {
      showAlert('login-alert', err.message || 'Login failed');
    } finally {
      btn.disabled = false;
    }
  });

  getClient().auth.getSession().then(({ data: { session } }) => {
    if (session) window.location.href = 'dashboard.html';
  });
}

export { getClient, requireAuth, showAlert };
