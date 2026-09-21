/**
 * Shared helpers for local-only volume seed / teardown.
 * Never call this against a remote PocketBase.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'
import PocketBase from 'pocketbase'

config()

export const VOL_MARK = '[vol]'
export const WORK_SLUG_PREFIX = 'vol-work-'
export const VOL_QUESTION_PREFIX = 'vol_'

export const TARGET = {
  gallery: 160,
  portfolio: 60,
  tags: 12,
  albums: 20,
  fatAlbumImages: 80,
  work: 15,
  workPublished: 5,
  people: 40,
  bookings: 40,
  inquiries: 20,
  testimonials: 20,
  faq: 20,
  bookingQuestions: 8,
} as const

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
export const TILE_PATH = path.join(SCRIPT_DIR, 'seed-assets', 'volume', 'tile.jpg')
export const IG_DIR = path.join(SCRIPT_DIR, 'seed-assets', 'instagram')
export const BOOKING_Q_BACKUP = path.join(SCRIPT_DIR, '.volume-booking-questions.json')

const LOOPBACK = new Set(['localhost', '127.0.0.1', '::1'])

export function pocketBaseUrl() {
  return process.env.VITE_POCKETBASE_URL?.trim() || 'http://127.0.0.1:8090'
}

export function assertLocalPocketBaseUrl(url: string) {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new Error(`Volume seed only runs against a local PocketBase. Invalid URL: ${url}`)
  }
  const host = parsed.hostname.replace(/^\[|\]$/g, '').toLowerCase()
  if (!LOOPBACK.has(host)) {
    throw new Error(
      `Volume seed refuses non-local PocketBase (${parsed.hostname}). Use http://127.0.0.1:8090.`,
    )
  }
}

export function requireEnv(name: string, value: string | undefined) {
  if (!value) throw new Error(`Missing required env: ${name}`)
  return value
}

export function pad(n: number, width = 3) {
  return String(n).padStart(width, '0')
}

export function galleryCaption(n: number) {
  return `${VOL_MARK} Gallery ${pad(n)}`
}

export function portfolioCaption(n: number) {
  return `${VOL_MARK} Portfolio ${pad(n)}`
}

export function tagName(n: number) {
  return `${VOL_MARK} Tag ${pad(n, 2)}`
}

export function albumTitle(n: number) {
  return `${VOL_MARK} Album ${pad(n, 2)}`
}

export function workSlug(n: number) {
  return `${WORK_SLUG_PREFIX}${pad(n, 2)}`
}

export function workTitle(n: number) {
  return `${VOL_MARK} Work ${pad(n, 2)}`
}

export function personName(n: number) {
  return `${VOL_MARK} Person ${pad(n, 2)}`
}

export function testimonialAuthor(n: number) {
  return `${VOL_MARK} Client ${pad(n, 2)}`
}

export function faqQuestion(n: number) {
  return `${VOL_MARK} Question ${pad(n, 2)}?`
}

export async function connectLocalAdmin() {
  const url = pocketBaseUrl()
  assertLocalPocketBaseUrl(url)
  const email = requireEnv('PB_ADMIN_EMAIL', process.env.PB_ADMIN_EMAIL)
  const password = requireEnv('PB_ADMIN_PASSWORD', process.env.PB_ADMIN_PASSWORD)
  const pb = new PocketBase(url)
  pb.autoCancellation(false)
  await pb.collection('_superusers').authWithPassword(email, password)
  return { pb, url }
}

const IMAGE_RE = /\.(jpe?g|png|webp)$/i

export function listVolumeTiles() {
  if (!fs.existsSync(TILE_PATH)) {
    throw new Error(`Missing local volume tile: ${TILE_PATH}`)
  }
  const tiles = [TILE_PATH]
  if (fs.existsSync(IG_DIR)) {
    for (const file of fs.readdirSync(IG_DIR).filter((f) => IMAGE_RE.test(f)).sort()) {
      tiles.push(path.join(IG_DIR, file))
    }
  }
  return tiles
}

export function fileFromDisk(abs: string) {
  const bytes = fs.readFileSync(abs)
  const ext = path.extname(abs).toLowerCase()
  const type = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
  return new File([bytes], path.basename(abs), { type })
}

export async function listByContains<T extends { id: string }>(
  pb: PocketBase,
  collection: string,
  field: string,
  needle: string,
) {
  const safe = needle.replaceAll('\\', '').replaceAll('"', '')
  try {
    return await pb.collection(collection).getFullList<T>({
      filter: `${field} ~ "${safe}"`,
    })
  } catch {
    const all = await pb.collection(collection).getFullList<T>()
    return all.filter((row) => String((row as Record<string, unknown>)[field] ?? '').includes(needle))
  }
}
