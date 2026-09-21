/**
 * Creates the photographer Studio account (and PocketBase superuser if missing).
 *
 * Usage:
 *   1. Copy .env.example → .env and set credentials
 *   2. docker compose up -d   (or run pocketbase serve with --dir=./pb_data)
 *   3. Optional realistic stills: npm run seed:ig  (local seed-assets only; not runtime)
 *   4. Backup ./pb_data before SEED_DEMO_FORCE=1 if you need to keep current uploads
 *   5. npm run seed
 *
 * First superuser is created via the PocketBase CLI (`superuser upsert`).
 * When Compose is running, upsert MUST go through `docker compose exec` so it
 * hits the same SQLite DB the API is serving (do not write pb_data from the host).
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { config } from 'dotenv'
import PocketBase from 'pocketbase'
import { ensureLibrarySchema, migratePortfolioVaults } from './ensure-schema.ts'
import { migrateBookingInquiries } from './migrate-bookings.ts'
import { seedDemoContent } from './seed-demo-content.ts'

config()

const pbUrl = process.env.VITE_POCKETBASE_URL ?? 'http://127.0.0.1:8090'
const pbDataDir = process.env.PB_DATA_DIR ?? './pb_data'

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required env: ${name}`)
  }
  return value
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function resolvePocketBaseBin(): string | null {
  if (process.env.POCKETBASE_BIN && existsSync(process.env.POCKETBASE_BIN)) {
    return process.env.POCKETBASE_BIN
  }
  const localWin = path.resolve('tools/pocketbase/pocketbase.exe')
  const localUnix = path.resolve('tools/pocketbase/pocketbase')
  if (existsSync(localWin)) return localWin
  if (existsSync(localUnix)) return localUnix
  return null
}

function dockerComposePocketBaseRunning(): boolean {
  const result = spawnSync('docker', ['compose', 'ps', '--status', 'running', '--services'], {
    encoding: 'utf8',
    shell: true,
  })
  if (result.status !== 0) return false
  const services = (result.stdout || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  return services.includes('pocketbase')
}

function shouldSeedViaDocker(): boolean {
  if (process.env.PB_SEED_VIA_DOCKER === '1') return true
  if (process.env.PB_SEED_VIA_DOCKER === '0') return false
  return dockerComposePocketBaseRunning()
}

function upsertSuperuser(email: string, password: string) {
  if (shouldSeedViaDocker()) {
    const result = spawnSync(
      'docker',
      [
        'compose',
        'exec',
        '-T',
        'pocketbase',
        '/usr/local/bin/pocketbase',
        'superuser',
        'upsert',
        email,
        password,
        '--dir=/pb_data',
      ],
      { encoding: 'utf8', shell: true },
    )
    if (result.status !== 0) {
      throw new Error(
        `docker compose exec superuser upsert failed: ${result.stderr || result.stdout || result.status}`,
      )
    }
    console.log('Upserted PocketBase superuser via Docker Compose.')
    return
  }

  const bin = resolvePocketBaseBin()
  if (!bin) {
    throw new Error(
      'Could not find PocketBase CLI. Set POCKETBASE_BIN, place a binary under tools/pocketbase/, or run `docker compose up -d` and re-run seed.',
    )
  }

  const result = spawnSync(bin, ['superuser', 'upsert', email, password, '--dir', pbDataDir], {
    encoding: 'utf8',
  })
  if (result.status !== 0) {
    throw new Error(`pocketbase superuser upsert failed: ${result.stderr || result.stdout || result.status}`)
  }
  console.log('Upserted PocketBase superuser via local CLI.')
}

async function authSuperuser(pb: PocketBase, email: string, password: string) {
  await pb.collection('_superusers').authWithPassword(email, password)
}

async function ensureSuperuser(pb: PocketBase, email: string, password: string) {
  try {
    await authSuperuser(pb, email, password)
    console.log('Authenticated as PocketBase superuser.')
    return
  } catch {
    // Create / update via CLI, then authenticate.
  }

  upsertSuperuser(email, password)

  let lastError: unknown
  for (let attempt = 1; attempt <= 8; attempt++) {
    try {
      await authSuperuser(pb, email, password)
      console.log('Authenticated as PocketBase superuser.')
      return
    } catch (error) {
      lastError = error
      await sleep(250 * attempt)
    }
  }

  throw new Error(
    `Superuser upsert ran, but API login still failed for ${email}. ` +
      `If Compose is up, re-run seed (it will use docker compose exec). ` +
      `Otherwise restart PocketBase and try again. Last error: ${String(lastError)}`,
  )
}

async function ensurePhotographer(pb: PocketBase, email: string, password: string) {
  const existing = await pb.collection('users').getList(1, 1, {
    filter: `email="${email.replaceAll('"', '\\"')}"`,
  })

  if (existing.totalItems > 0) {
    console.log(`Photographer already exists: ${email}`)
    return
  }

  await pb.collection('users').create({
    email,
    password,
    passwordConfirm: password,
    emailVisibility: true,
  })
  console.log(`Created photographer Studio account: ${email}`)
}

async function main() {
  const email = requireEnv('SEED_EMAIL', process.env.SEED_EMAIL)
  const password = requireEnv('SEED_PASSWORD', process.env.SEED_PASSWORD)
  const adminMail = requireEnv('PB_ADMIN_EMAIL', process.env.PB_ADMIN_EMAIL)
  const adminPass = requireEnv('PB_ADMIN_PASSWORD', process.env.PB_ADMIN_PASSWORD)

  const pb = new PocketBase(pbUrl)
  pb.autoCancellation(false)

  console.log(`Seeding against ${pbUrl}`)
  if (shouldSeedViaDocker()) {
    console.log('Detected running Compose PocketBase — using docker compose exec for superuser upsert.')
  }

  await ensureSuperuser(pb, adminMail, adminPass)
  await ensureLibrarySchema(pb)
  await ensurePhotographer(pb, email, password)
  await migrateBookingInquiries(pb)
  await seedDemoContent(pb)
  await migratePortfolioVaults(pb)
  console.log('Seed complete. Log in at /studio/login · preview http://127.0.0.1:5173/')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
