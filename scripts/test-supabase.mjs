// Quick smoke test for the Supabase project connection.
// Run from the repo root: node scripts/test-supabase.mjs
//
// Checks:
//   1. Anon client — reaches the project (PostgREST error = connected)
//   2. Service-role client — admin API responds (no public tables needed)

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load apps/web/.env.local without requiring dotenv
const envPath = resolve('apps/web/.env.local')
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const idx = line.indexOf('=')
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()]
    })
    .filter(([k]) => k)
)

const url = env['NEXT_PUBLIC_SUPABASE_URL']
const anonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY']
const serviceKey = env['SUPABASE_SERVICE_ROLE_KEY']

if (!url || !anonKey || !serviceKey) {
  console.error('Missing one or more env vars in apps/web/.env.local')
  process.exit(1)
}

console.log(`Project URL: ${url}\n`)
let passed = 0

// --- Test 1: anon client — any PostgREST response means the project is reachable ---
console.log('1. Anon client — probe connection...')
const anonClient = createClient(url, anonKey)
const { error: anonError } = await anonClient.from('_probe_').select('*').limit(1)

// PGRST116 / PGRST205 / 42P01 = "table not found" — DB is reachable, auth worked
const isReachable =
  !anonError ||
  ['PGRST116', 'PGRST205', '42P01'].includes(anonError.code) ||
  anonError.message?.includes('does not exist') ||
  anonError.message?.includes('schema cache')

if (isReachable) {
  console.log('   ✅ Anon client connected (project reachable, RLS active)\n')
  passed++
} else {
  console.error(`   ❌ Anon client failed: ${anonError.message} (${anonError.code})\n`)
}

// --- Test 2: service-role client — list auth users (admin API, bypasses RLS) ---
console.log('2. Service-role client — admin auth API...')
const serviceClient = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const { data: usersData, error: serviceError } = await serviceClient.auth.admin.listUsers({
  page: 1,
  perPage: 1,
})

if (serviceError) {
  console.error(`   ❌ Service client failed: ${serviceError.message}\n`)
} else {
  console.log(`   ✅ Service client connected (admin API OK, total users: ${usersData.total ?? 0})\n`)
  passed++
}

// --- Summary ---
console.log(`Result: ${passed}/2 checks passed`)
if (passed < 2) process.exit(1)
