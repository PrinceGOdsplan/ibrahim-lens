/**
 * Idempotent schema apply (including assistant_thread). Superuser only.
 * Hits local PocketBase on :8090 so Compose/tunnel URL mix-ups cannot skip the DB.
 */
import { config } from 'dotenv'
import PocketBase from 'pocketbase'
import { ensureLibrarySchema } from './ensure-schema.ts'

config()

const url = 'http://127.0.0.1:8090'
const email = process.env.PB_ADMIN_EMAIL
const password = process.env.PB_ADMIN_PASSWORD
if (!email || !password) {
  throw new Error('Missing PB_ADMIN_EMAIL or PB_ADMIN_PASSWORD')
}

const pb = new PocketBase(url)
pb.autoCancellation(false)
await pb.collection('_superusers').authWithPassword(email, password)
await ensureLibrarySchema(pb)
console.log('Schema applied on local PocketBase.')
