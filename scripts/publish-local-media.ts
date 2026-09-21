/**
 * Copies photos actually used on the local site (featured, lanes, atmosphere,
 * Work, artist portrait, public Portfolio) up to production.
 *
 * Usage: npx tsx scripts/publish-local-media.ts
 */
import { config } from 'dotenv'
import PocketBase, { type RecordModel } from 'pocketbase'

config({ path: '.env' })
const localUrl = process.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090'
const localAdmin = process.env.PB_ADMIN_EMAIL!
const localPass = process.env.PB_ADMIN_PASSWORD!

config({ path: '.env.prod.local', override: true })
const prodUrl = 'https://ibrahimlens.com.ng'
const prodAdmin = process.env.PB_ADMIN_EMAIL!
const prodPass = process.env.PB_ADMIN_PASSWORD!

type Media = RecordModel & {
  file: string
  caption?: string
  vault?: string
  in_portfolio?: boolean
  portfolio_sort?: number
  is_artist_portrait?: boolean
  tags?: string[]
}

type Work = RecordModel & {
  title: string
  slug: string
  description?: string
  show_on_website: boolean
  cover: string
  images: string[]
  sort: number
}

type Globals = RecordModel & {
  home_featured?: string[]
  home_lanes?: { image?: string }[] | string
  atmosphere_ids?: string[]
  home_work?: string[]
}

function asIdList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((item) => (typeof item === 'string' ? item : String(item))).filter(Boolean)
}

function laneImageIds(lanes: Globals['home_lanes']): string[] {
  const parsed = typeof lanes === 'string' ? (JSON.parse(lanes) as unknown) : lanes
  if (!Array.isArray(parsed)) return []
  return parsed
    .map((lane) => (lane && typeof lane === 'object' ? String((lane as { image?: string }).image || '') : ''))
    .filter(Boolean)
}

async function downloadFile(url: string, filename: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`download ${filename} failed: ${res.status}`)
  const type = res.headers.get('content-type') || 'image/jpeg'
  const bytes = Buffer.from(await res.arrayBuffer())
  return new File([bytes], filename, { type })
}

async function main() {
  const local = new PocketBase(localUrl)
  local.autoCancellation(false)
  await local.collection('_superusers').authWithPassword(localAdmin, localPass)

  const prod = new PocketBase(prodUrl)
  prod.autoCancellation(false)
  await prod.collection('_superusers').authWithPassword(prodAdmin, prodPass)

  const globals = (await local.collection('website_globals').getFirstListItem('key="site"')) as Globals
  const works = (await local.collection('work_projects').getFullList({
    filter: 'show_on_website = true',
    sort: 'sort',
  })) as Work[]
  const artist = (await local.collection('media').getFullList({
    filter: 'is_artist_portrait = true',
  })) as Media[]
  const portfolio = (await local.collection('media').getFullList({
    filter: 'vault = "portfolio"',
    sort: 'portfolio_sort',
  })) as Media[]

  const used = new Set<string>([
    ...asIdList(globals.home_featured),
    ...asIdList(globals.atmosphere_ids),
    ...asIdList(globals.home_work),
    ...laneImageIds(globals.home_lanes),
    ...artist.map((row) => row.id),
    ...works.flatMap((work) => [work.cover, ...asIdList(work.images)]),
    ...portfolio.map((row) => row.id),
  ])

  const allMedia = (await local.collection('media').getFullList()) as Media[]
  const byId = new Map(allMedia.map((row) => [row.id, row]))
  const ordered = [...used].map((id) => byId.get(id)).filter((row): row is Media => Boolean(row && row.file))

  console.log(`Local used media: ${ordered.length} (of ${used.size} ids)`)
  console.log(`Work on website: ${works.length}`)
  console.log(`Uploading to ${prodUrl}…`)

  const idMap = new Map<string, string>()
  for (const [i, row] of ordered.entries()) {
    const url = local.files.getURL(row, row.file)
    const filename = row.file.includes('/') ? row.file.split('/').pop()! : row.file
    const file = await downloadFile(url, filename)
    const form = new FormData()
    form.append('file', file)
    form.append('caption', row.caption || '')
    form.append('vault', 'gallery')
    form.append('in_portfolio', 'false')
    form.append('portfolio_sort', String(row.portfolio_sort || (i + 1) * 10))
    if (row.is_artist_portrait) form.append('is_artist_portrait', 'true')
    const created = await prod.collection('media').create(form)
    idMap.set(row.id, created.id)
    console.log(`  ${i + 1}/${ordered.length} ${filename}`)
  }

  // One-way Portfolio copies for public pages.
  const portfolioIds = new Map<string, string>()
  for (const [i, row] of ordered.entries()) {
    const shouldPromote = row.vault === 'portfolio' || row.in_portfolio || used.has(row.id)
    if (!shouldPromote) continue
    const galleryId = idMap.get(row.id)
    if (!galleryId) continue
    const gallery = (await prod.collection('media').getOne(galleryId)) as Media
    const url = prod.files.getURL(gallery, gallery.file)
    const filename = gallery.file.includes('/') ? gallery.file.split('/').pop()! : gallery.file
    const file = await downloadFile(url, filename)
    const form = new FormData()
    form.append('file', file)
    form.append('caption', gallery.caption || '')
    form.append('vault', 'portfolio')
    form.append('copied_from', galleryId)
    form.append('in_portfolio', 'true')
    form.append('portfolio_sort', String(gallery.portfolio_sort || (i + 1) * 10))
    if (gallery.is_artist_portrait) form.append('is_artist_portrait', 'true')
    const copy = await prod.collection('media').create(form)
    portfolioIds.set(row.id, copy.id)
  }
  console.log(`  portfolio copies: ${portfolioIds.size}`)

  const map = (id: string) => portfolioIds.get(id) || idMap.get(id) || ''
  const mapList = (ids: unknown) => asIdList(ids).map(map).filter(Boolean)

  let lanes = globals.home_lanes
  if (typeof lanes === 'string') {
    try {
      lanes = JSON.parse(lanes) as Globals['home_lanes']
    } catch {
      lanes = []
    }
  }
  const nextLanes = Array.isArray(lanes)
    ? lanes.map((lane) => {
        if (!lane || typeof lane !== 'object') return lane
        const image = (lane as { image?: string }).image
        return image ? { ...lane, image: map(image) } : lane
      })
    : lanes

  const prodGlobals = await prod.collection('website_globals').getFirstListItem('key="site"')
  await prod.collection('website_globals').update(prodGlobals.id, {
    home_featured: mapList(globals.home_featured),
    atmosphere_ids: mapList(globals.atmosphere_ids),
    home_work: mapList(globals.home_work),
    home_lanes: nextLanes,
  })
  console.log('  website_globals: featured, lanes, atmosphere, home Work')

  for (const work of works) {
    const payload = {
      title: work.title,
      slug: work.slug,
      description: work.description || '',
      show_on_website: true,
      cover: map(work.cover),
      images: mapList(work.images),
      sort: work.sort,
    }
    const existing = await prod.collection('work_projects').getList(1, 1, { filter: `slug="${work.slug}"` })
    if (existing.items[0]) await prod.collection('work_projects').update(existing.items[0].id, payload)
    else await prod.collection('work_projects').create(payload)
    console.log(`  work: ${work.title}`)
  }

  console.log('Done.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
