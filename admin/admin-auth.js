import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/+esm';

const ADMIN_LOGIN = '/admin';
const ADMIN_DASHBOARD = '/admin/dashboard';

function getClient() {
  const cfg = window.SUPABASE_CONFIG;
  if (!cfg?.url || !cfg?.anonKey || cfg.url.includes('YOUR_') || cfg.anonKey.includes('YOUR_')) {
    throw new Error('Site configuration error. Contact your developer.');
  }
  return createClient(cfg.url, cfg.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
}

async function requireAuth() {
  const supabase = getClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    window.location.href = ADMIN_LOGIN;
    return null;
  }

  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
      window.location.href = ADMIN_LOGIN;
    }
  });

  return { supabase, session };
}

function showAlert(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
}

function friendlyAuthError(err) {
  const msg = err?.message || '';
  if (msg.includes('Invalid login credentials')) {
    return 'Invalid email or password. Check your credentials and try again.';
  }
  if (msg.includes('Email not confirmed')) {
    return 'Email not confirmed. In Supabase Dashboard → Authentication → Users, confirm your account or disable email confirmation.';
  }
  if (msg.includes('not configured')) {
    return 'Admin is temporarily unavailable. Configuration missing.';
  }
  return msg || 'Login failed. Please try again.';
}

// Login page
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = loginForm.querySelector('button[type="submit"]');
    const alertEl = document.getElementById('login-alert');
    if (alertEl) alertEl.style.display = 'none';
    btn.disabled = true;

    try {
      const supabase = getClient();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      window.location.href = ADMIN_DASHBOARD;
    } catch (err) {
      showAlert('login-alert', friendlyAuthError(err));
    } finally {
      btn.disabled = false;
    }
  });

  getClient()
    .auth.getSession()
    .then(({ data: { session } }) => {
      if (session) window.location.href = ADMIN_DASHBOARD;
    })
    .catch((err) => showAlert('login-alert', friendlyAuthError(err)));
}

export { getClient, requireAuth, showAlert, ADMIN_LOGIN, ADMIN_DASHBOARD };
