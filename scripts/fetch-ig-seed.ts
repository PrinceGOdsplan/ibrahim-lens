/**
 * One-shot Instagram stills fetch for local demo seed only.
 * Never used by the public site at runtime.
 *
 * Prefer: gallery-dl on PATH (or `python -m gallery_dl`).
 * Fallback: instaloader if installed.
 *
 * Usage: npm run seed:ig
 * Soft-cap: IG_SEED_MAX (default 40). Fetches as many as the tool allows up to the cap.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HANDLE = process.env.IG_SEED_HANDLE?.replace(/^@/, '') || 'ibra.himlens'
const MAX = Math.max(1, Number(process.env.IG_SEED_MAX || 40))
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, 'seed-assets', 'instagram')

const IMAGE_RE = /\.(jpe?g|png|webp)$/i

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true })
}

function countImages(dir: string) {
  if (!fs.existsSync(dir)) return 0
  return fs.readdirSync(dir).filter((f) => IMAGE_RE.test(f)).length
}

function flattenImagesIntoOut(root: string) {
  if (!fs.existsSync(root)) return
  const stack = [root]
  const collected: string[] = []
  while (stack.length) {
    const dir = stack.pop()!
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name)
      const st = fs.statSync(full)
      if (st.isDirectory()) stack.push(full)
      else if (IMAGE_RE.test(name)) collected.push(full)
    }
  }
  collected.sort()
  let i = 0
  for (const src of collected) {
    if (i >= MAX) break
    const ext = path.extname(src).toLowerCase() || '.jpg'
    const dest = path.join(OUT_DIR, `ig-${String(i + 1).padStart(3, '0')}${ext}`)
    fs.copyFileSync(src, dest)
    i += 1
  }
  // Remove nested download trees if different from OUT_DIR
  for (const name of fs.readdirSync(root)) {
    const full = path.join(root, name)
    if (full === OUT_DIR) continue
    const st = fs.statSync(full)
    if (st.isDirectory()) fs.rmSync(full, { recursive: true, force: true })
    else if (!IMAGE_RE.test(name) || !name.startsWith('ig-')) fs.rmSync(full, { force: true })
  }
}

function tryCommand(command: string, args: string[], label: string) {
  console.log(`Trying ${label}…`)
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: false,
    env: process.env,
    windowsHide: true,
  })
  if (result.error) {
    console.warn(`  ${label} not available:`, result.error.message)
    return false
  }
  if (result.status !== 0) {
    console.warn(`  ${label} exited with code ${result.status}`)
    return false
  }
  return true
}

function tryPythonModule(module: string, args: string[], label: string) {
  return tryCommand('python', ['-m', module, ...args], label)
}

function main() {
  ensureDir(OUT_DIR)
  const staging = path.join(OUT_DIR, '_download')
  ensureDir(staging)

  console.log(`Fetching Instagram stills for @${HANDLE} → ${OUT_DIR}`)
  console.log(`Soft-cap: ${MAX} images. Public runtime never hits Instagram.`)

  const profileUrl = `https://www.instagram.com/${HANDLE}/`
  const browser = process.env.IG_COOKIES_BROWSER?.trim() // e.g. chrome, edge, firefox

  let ok = false
  if (browser) {
    ok = tryCommand(
      'gallery-dl',
      ['--dest', staging, '--cookies-from-browser', browser, profileUrl],
      `gallery-dl (--cookies-from-browser ${browser})`,
    )
    if (!ok) {
      ok = tryPythonModule(
        'gallery_dl',
        ['--dest', staging, '--cookies-from-browser', browser, profileUrl],
        `python -m gallery_dl (--cookies-from-browser ${browser})`,
      )
    }
  }

  if (!ok) {
    ok = tryCommand('gallery-dl', ['--dest', staging, profileUrl], 'gallery-dl')
  }

  if (!ok) {
    ok = tryPythonModule('gallery_dl', ['--dest', staging, profileUrl], 'python -m gallery_dl')
  }

  if (!ok) {
    ok = tryCommand(
      'instaloader',
      [
        '--dirname-pattern',
        staging,
        '--no-videos',
        '--no-metadata-json',
        '--no-captions',
        '--fast-update',
        '--max-connection-attempts',
        '1',
        HANDLE,
      ],
      'instaloader',
    )
  }

  if (!ok) {
    ok = tryPythonModule(
      'instaloader',
      [
        '--dirname-pattern',
        staging,
        '--no-videos',
        '--no-metadata-json',
        '--no-captions',
        '--fast-update',
        '--max-connection-attempts',
        '1',
        HANDLE,
      ],
      'python -m instaloader',
    )
  }

  if (!ok) {
    console.warn('')
    console.warn('Could not fetch Instagram stills automatically (login wall / rate limit is common).')
    console.warn('Try with browser cookies after a short wait:')
    console.warn('  $env:IG_COOKIES_BROWSER="chrome"; npm run seed:ig')
    console.warn('Or: gallery-dl --cookies-from-browser chrome ' + profileUrl)
    console.warn('Seed will keep existing / Picsum media if this folder stays empty.')
    process.exitCode = 1
    return
  }

  // Clear previous normalized ig-* files
  for (const name of fs.readdirSync(OUT_DIR)) {
    if (name.startsWith('ig-') && IMAGE_RE.test(name)) {
      fs.rmSync(path.join(OUT_DIR, name), { force: true })
    }
  }

  flattenImagesIntoOut(staging)
  fs.rmSync(staging, { recursive: true, force: true })

  const n = countImages(OUT_DIR)
  if (!n) {
    console.warn('Fetch finished but no still images were found.')
    process.exitCode = 1
    return
  }
  console.log(`Ready: ${n} still(s) in ${OUT_DIR}`)
  console.log('Next: backup pb_data if needed, then SEED_DEMO_FORCE=1 npm run seed')
}

main()
