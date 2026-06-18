/**
 * Copy to config.js for local dev, or run: npm run config:generate
 * On Vercel, set SUPABASE_URL + SUPABASE_ANON_KEY in project env vars.
 */
window.SUPABASE_CONFIG = {
  url: 'https://YOUR_PROJECT_REF.supabase.co',
  anonKey: 'YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY',
};
