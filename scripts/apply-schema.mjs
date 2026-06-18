/**
 * Apply supabase/schema.sql via direct Postgres connection.
 * Requires DATABASE_URL — never commit this value.
 *
 * Usage: DATABASE_URL="postgresql://postgres:...@db....supabase.co:5432/postgres" npm run db:schema
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schemaPath = path.join(ROOT, 'supabase', 'schema.sql');

function loadEnvFile(filename) {
  const file = path.join(ROOT, filename);
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('Set DATABASE_URL to your Supabase direct connection string.');
  process.exit(1);
}

const sql = fs.readFileSync(schemaPath, 'utf8');
const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log('Connected. Applying schema…');
  await client.query(sql);
  console.log('Schema applied successfully.');
} catch (err) {
  console.error('Schema apply failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
