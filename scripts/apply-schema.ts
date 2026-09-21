/**
 * Idempotent schema apply (including assistant_thread). Superuser only.
 *
 * Local (default):
 *   npx tsx scripts/apply-schema.ts
 *
 * Production (explicit confirm required):
 *   PB_URL=https://ibrahimlens.com.ng PB_SCHEMA_CONFIRM=APPLY npx tsx scripts/apply-schema.ts
 *
 * Credentials: PB_ADMIN_EMAIL + PB_ADMIN_PASSWORD (loads deploy/.env then .env).
 * Does not seed demo content or touch uploads.
 */
import { config } from 'dotenv'
import { existsSync } from 'node:fs'
import PocketBase from 'pocketbase'
import { ensureLibrarySchema } from './ensure-schema.ts'

if (existsSync('deploy/.env')) {
  config({ path: 'deploy/.env' })
}
config()

const url = (process.env.PB_URL || process.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090').replace(
  /\/$/,
  '',
)
const email = process.env.PB_ADMIN_EMAIL
const password = process.env.PB_ADMIN_PASSWORD
if (!email || !password) {
  throw new Error('Missing PB_ADMIN_EMAIL or PB_ADMIN_PASSWORD')
}

function isLoopback(raw: string) {
  try {
    const host = new URL(raw).hostname
    return host === '127.0.0.1' || host === 'localhost' || host === '::1'
  } catch {
    return false
  }
}

if (!isLoopback(url) && process.env.PB_SCHEMA_CONFIRM !== 'APPLY') {
  throw new Error(
    `Refusing non-local schema apply to ${url}. Re-run with PB_SCHEMA_CONFIRM=APPLY after backing up pb_data.`,
  )
}

const pb = new PocketBase(url)
pb.autoCancellation(false)
await pb.collection('_superusers').authWithPassword(email, password)
await ensureLibrarySchema(pb)
console.log(`Schema applied on ${url}`)
