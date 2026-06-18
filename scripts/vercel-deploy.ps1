# Run AFTER: npx vercel login
# Sets Supabase env vars on Vercel (reads from .env.local — never committed).
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot\..

if (-not (Test-Path '.env.local')) {
  Write-Error 'Missing .env.local. Copy from .env.example and fill in values.'
}

Get-Content '.env.local' | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
  $k, $v = $_ -split '=', 2
  $k = $k.Trim()
  $v = $v.Trim()
  if ($k -in @('SUPABASE_URL', 'SUPABASE_ANON_KEY')) {
    Write-Host "Setting Vercel env: $k"
    foreach ($env in @('production', 'preview', 'development')) {
      $v | npx vercel env add $k $env --force 2>$null
    }
  }
}

Write-Host 'Deploying to production...'
npx vercel --prod --yes
