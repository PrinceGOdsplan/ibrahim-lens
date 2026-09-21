/**
 * Enables PocketBase S3-compatible storage (Cloudflare R2) against production.
 *
 * Reads R2_* and PB_ADMIN_* from .env.prod.local. Does not copy existing files —
 * run rclone against pb_data/storage first so live URLs keep working.
 *
 * Usage: npx tsx scripts/enable-r2.ts
 */
import { config } from 'dotenv'
import PocketBase from 'pocketbase'

config({ path: '.env.prod.local' })

function requireEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing ${name} in .env.prod.local`)
  return value
}

async function main() {
  const pbUrl = process.env.VITE_POCKETBASE_URL?.trim() || 'https://ibrahimlens.com.ng'
  const adminEmail = requireEnv('PB_ADMIN_EMAIL')
  const adminPassword = requireEnv('PB_ADMIN_PASSWORD')
  const endpoint = requireEnv('R2_ENDPOINT').replace(/\/$/, '')
  const bucket = requireEnv('R2_BUCKET')
  const accessKey = requireEnv('R2_ACCESS_KEY_ID')
  const secret = requireEnv('R2_SECRET_ACCESS_KEY')

  if (endpoint.includes('.r2.cloudflarestorage.com/')) {
    throw new Error('R2_ENDPOINT must be the account URL only, with no bucket path.')
  }

  const pb = new PocketBase(pbUrl)
  pb.autoCancellation(false)
  await pb.collection('_superusers').authWithPassword(adminEmail, adminPassword)

  const s3 = {
    enabled: true,
    bucket,
    region: 'auto',
    endpoint,
    accessKey,
    secret,
    forcePathStyle: false,
  }

  console.log(`Saving R2 settings on ${pbUrl} (bucket ${bucket})…`)
  const current = await pb.settings.getAll()
  await pb.settings.update({
    ...current,
    s3,
  })
  console.log('PocketBase file storage is now R2.')

  await pb.send('/api/settings/test/s3', {
    method: 'POST',
    body: { filesystem: 'storage' },
  })
  console.log('R2 connection test passed.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
