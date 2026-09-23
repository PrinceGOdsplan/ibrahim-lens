import type { RecordModel } from 'pocketbase'
import { pb } from '@/lib/pocketbase'
import { ALLOWED_IMAGE_TYPES, getMaxUploadBytes, getMaxUploadMb } from '@/lib/config'
import { listCollected } from '@/lib/list-pages'

export type MediaVault = 'gallery' | 'portfolio' | 'held'

export type MediaRecord = RecordModel & {
  file: string
  caption?: string
  in_portfolio: boolean
  portfolio_sort: number
  is_artist_portrait?: boolean
  vault?: MediaVault | ''
  copied_from?: string
  tags: string[]
  /** Image point to keep on screen when the frame is cropped, 0–100. */
  focal_x?: number
  focal_y?: number
}

export type AlbumRecord = RecordModel & {
  title: string
  images: string[]
}

export type WorkRecord = RecordModel & {
  title: string
  slug: string
  description?: string
  story_body?: string
  story_client?: string
  story_location?: string
  story_shot_at?: string
  show_on_website: boolean
  cover: string
  images: string[]
  sort: number
}

export type TagRecord = RecordModel & {
  name: string
}

export type BrandRecord = RecordModel & {
  key: string
  logo: string
  favicon?: string
}

export function mediaVault(record: MediaRecord): MediaVault {
  if (record.vault === 'portfolio') return 'portfolio'
  if (record.vault === 'held') return 'held'
  return 'gallery'
}

export function isPickPile(record: MediaRecord) {
  const vault = mediaVault(record)
  return vault === 'gallery' || vault === 'portfolio'
}

function isDeliveryCopy(record: MediaRecord) {
  return record.collectionName === 'delivery_files' || Boolean((record as { delivery?: string }).delivery)
}

function deliveryFileUrl(record: MediaRecord, token: string, thumb?: string) {
  const base = `${pb.baseUrl}/api/ibrahim/delivery-file/${encodeURIComponent(token)}/${encodeURIComponent(record.id)}/${encodeURIComponent(record.file)}`
  return thumb ? `${base}?thumb=${encodeURIComponent(thumb)}` : base
}

export function mediaThumbUrl(record: MediaRecord, thumb = '400x400', token?: string) {
  if (!record.file) return ''
  if (token && isDeliveryCopy(record)) return deliveryFileUrl(record, token, thumb)
  const url = pb.files.getURL(record, record.file, { thumb })
  if (!token) return url
  return `${url}${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`
}

export function mediaOriginalUrl(record: MediaRecord, token?: string, opts?: { download?: boolean }) {
  if (!record.file) return ''
  if (token && isDeliveryCopy(record)) {
    const url = deliveryFileUrl(record, token)
    return opts?.download ? `${url}${url.includes('?') ? '&' : '?'}dl=1` : url
  }
  const url = pb.files.getURL(record, record.file)
  if (!token) return url
  return `${url}${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`
}

/**
 * Candidate widths per context.
 *
 * Capped at three: PocketBase generates and stores a derived file per distinct
 * thumb size on first request, so every extra candidate multiplies both the
 * generation work and `pb_data` growth. Each set keeps 1200 — already used
 * across the app — so existing thumbnails are reused rather than orphaned.
 */
export const IMAGE_WIDTHS = {
  /** Full-bleed: hero, immersive backdrops. */
  full: [900, 1600, 2400],
  /** Roughly half the viewport: Work covers, lane cards. */
  half: [600, 1200, 1800],
  /** Masonry and grid columns. */
  column: [400, 800, 1200],
} as const

export type ImageWidthKey = keyof typeof IMAGE_WIDTHS

/**
 * Responsive sources for a photograph. Returns a `srcSet` of PocketBase thumbs
 * plus a default `src` for browsers that ignore it.
 */
export function mediaImageSources(record: MediaRecord, key: ImageWidthKey = 'column', token?: string) {
  if (!record.file) return { src: '', srcSet: undefined }

  const widths = IMAGE_WIDTHS[key]
  return {
    src: mediaThumbUrl(record, `${widths[1]}x0`, token),
    srcSet: widths.map((w) => `${mediaThumbUrl(record, `${w}x0`, token)} ${w}w`).join(', '),
  }
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return 'Only JPEG, PNG, and WebP images are allowed.'
  }
  const max = getMaxUploadBytes()
  if (file.size > max) {
    return `File exceeds the ${getMaxUploadMb()}MB upload limit.`
  }
  return null
}

export function fileStem(name: string) {
  const base = name.includes('/') ? name.split('/').pop()! : name
  const dot = base.lastIndexOf('.')
  return (dot > 0 ? base.slice(0, dot) : base).trim()
}

function fileExtension(name: string) {
  const base = name.includes('/') ? name.split('/').pop()! : name
  const match = base.match(/\.(jpe?g|png|webp)$/i)
  return match ? match[0].toLowerCase().replace('jpeg', 'jpg') : ''
}

function sanitizePhotoName(name: string) {
  const stripped = name.trim().replace(/\.(jpe?g|png|webp)$/i, '')
  return stripped
    .replace(/[<>:"/\\|?*\u0000-\u001f]+/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\.+$/g, '')
    .slice(0, 80)
}

/** Apply a display name to the File so PocketBase stores it instead of the camera filename. */
export function namedImageFile(file: File, name: string): File {
  const stem = sanitizePhotoName(name) || fileStem(file.name) || 'photo'
  const ext =
    fileExtension(file.name) ||
    (file.type === 'image/png' ? '.png' : file.type === 'image/webp' ? '.webp' : '.jpg')
  const filename = `${stem}${ext}`
  if (filename === file.name) return file
  return new File([file], filename, { type: file.type, lastModified: file.lastModified })
}

export function mediaLabel(record: Pick<MediaRecord, 'caption' | 'file'>) {
  const caption = record.caption?.trim()
  if (caption) return caption
  return fileStem(record.file || '') || 'Untitled'
}

export function studioDownloadFilename(item: Pick<MediaRecord, 'caption' | 'file'>) {
  const match = item.file?.match(/\.(jpe?g|png|webp)$/i)
  const ext = match ? match[0].toLowerCase().replace('jpeg', 'jpg') : '.jpg'
  const stem =
    mediaLabel(item)
      .replace(/[^\w\s.-]+/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 80) || 'photograph'
  return `${stem}${ext}`
}

export function photoMatchesQuery(item: MediaRecord, q: string) {
  const needle = q.trim().toLowerCase()
  if (!needle) return true
  const hay = `${item.caption ?? ''} ${fileStem(item.file || '')} ${item.file ?? ''}`.toLowerCase()
  return hay.includes(needle)
}

export function sortPhotos(items: MediaRecord[], sort: 'date' | 'name' | 'tag') {
  return [...items].sort((a, b) => {
    if (sort === 'name') {
      return mediaLabel(a).localeCompare(mediaLabel(b)) || (b.created || '').localeCompare(a.created || '')
    }
    if (sort === 'tag') {
      const ta = ((a.expand?.tags as TagRecord[] | undefined)?.[0]?.name || a.tags?.[0] || '').toString()
      const tb = ((b.expand?.tags as TagRecord[] | undefined)?.[0]?.name || b.tags?.[0] || '').toString()
      return ta.localeCompare(tb) || mediaLabel(a).localeCompare(mediaLabel(b))
    }
    return (b.created || '').localeCompare(a.created || '')
  })
}

export function filterCollectionPhotos(
  items: MediaRecord[],
  opts: { q?: string; tagId?: string; sort?: 'date' | 'name' | 'tag' },
) {
  const tagId = opts.tagId?.trim()
  const filtered = items.filter((item) => {
    if (tagId && !(item.tags ?? []).includes(tagId)) return false
    return photoMatchesQuery(item, opts.q ?? '')
  })
  return sortPhotos(filtered, opts.sort ?? 'date')
}

/** All media (both vaults). Prefer listMediaPage for Gallery walls; pickers still use this. */
export async function listMedia() {
  try {
    return await listCollected<MediaRecord>('media', {
      sort: '-created',
      expand: 'tags',
    })
  } catch {
    return listCollected<MediaRecord>('media', { sort: '-created' })
  }
}

export const MEDIA_WALL_PAGE = 24

export async function getMedia(id: string) {
  return pb.collection('media').getOne<MediaRecord>(id, { expand: 'tags' })
}

/** Count media without loading every row (Dashboard pulse). */
export async function countMedia() {
  try {
    const result = await pb.collection('media').getList(1, 1, { skipTotal: false })
    if (result.totalItems >= 0) return result.totalItems
  } catch {
    /* COUNT can 400 on a crowded local library */
  }
  return 0
}

/** Count media created since an ISO timestamp without loading every row. */
export async function countMediaCreatedSince(isoFrom: string | null) {
  if (!isoFrom) return countMedia()
  const safe = isoFrom.replaceAll('"', '')
  try {
    const result = await pb.collection('media').getList(1, 1, {
      filter: `created >= "${safe}"`,
      skipTotal: false,
    })
    if (result.totalItems >= 0) return result.totalItems
  } catch {
    /* ignore */
  }
  return 0
}

export async function listMediaPage(opts: {
  page: number
  vault: MediaVault | 'pick'
  tagId?: string
  q?: string
  sort?: 'date' | 'name' | 'tag'
  perPage?: number
}) {
  const perPage = opts.perPage ?? MEDIA_WALL_PAGE
  const vaultFilter =
    opts.vault === 'portfolio'
      ? 'vault = "portfolio"'
      : opts.vault === 'held'
        ? 'vault = "held"'
        : opts.vault === 'pick'
          ? '(vault = "gallery" || vault = "portfolio")'
          : 'vault = "gallery"'
  const tagId = opts.tagId?.replaceAll('"', '')
  const q = opts.q?.replaceAll('\\', '').replaceAll('"', '').trim()
  const parts = [vaultFilter]
  if (tagId) parts.push(`tags.id ?= "${tagId}"`)
  if (q) parts.push(`(file ~ "${q}" || caption ~ "${q}")`)
  const filter = parts.join(' && ')
  const sort = opts.sort === 'name' ? 'caption,file' : '-created'
  const query = { filter, sort, skipTotal: true }
  const fetchPage = () => pb.collection('media').getList<MediaRecord>(opts.page, perPage, query)

  let result
  try {
    result = await fetchPage()
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 250))
    result = await fetchPage()
  }
  const hasMore = result.items.length >= perPage
  return {
    items: result.items,
    page: result.page,
    hasMore,
    totalPages: hasMore ? result.page + 1 : result.page,
    totalItems: result.totalItems,
  }
}

export async function listGalleryMedia() {
  const all = await listMedia()
  return all.filter((m) => mediaVault(m) === 'gallery')
}

export async function listPortfolioMedia() {
  const load = (expand?: string) =>
    listCollected<MediaRecord>('media', {
      filter: 'vault = "portfolio"',
      sort: 'portfolio_sort,created',
      ...(expand ? { expand } : {}),
    })
  try {
    return await load('tags')
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 250))
    return load()
  }
}

/** Gallery + Portfolio only — what Studio pickers attach from. */
export async function listPickPileMedia() {
  try {
    return await listCollected<MediaRecord>('media', {
      filter: 'vault = "gallery" || vault = "portfolio"',
      sort: '-created',
      expand: 'tags',
    })
  } catch {
    return listCollected<MediaRecord>('media', {
      filter: 'vault = "gallery" || vault = "portfolio"',
      sort: '-created',
    })
  }
}

export type MediaUploadDest = {
  vault?: 'gallery' | 'portfolio' | 'held'
  albumId?: string
  workId?: string
  /** When uploading several Portfolio files, pass an incrementing sort so we don't re-list each time. */
  portfolioSort?: number
}

export function prepareImageFile(file: File): File {
  const named = file.type || guessImageType(file.name)
  const type = named === 'image/jpg' ? 'image/jpeg' : named
  if (type === file.type || !type) return file
  return new File([file], file.name, { type, lastModified: file.lastModified })
}

function guessImageType(name: string) {
  const lower = name.toLowerCase()
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg'
  return ''
}

async function createMediaRecord(form: FormData) {
  try {
    return await pb.collection('media').create<MediaRecord>(form)
  } catch (error) {
    const status = (error as { status?: number } | null)?.status
    if (status && status !== 500 && status !== 429) throw error
    await new Promise((resolve) => setTimeout(resolve, 400))
    return pb.collection('media').create<MediaRecord>(form)
  }
}

export async function uploadMedia(file: File, caption = '', dest: MediaUploadDest = {}) {
  const upload = prepareImageFile(file)
  const error = validateImageFile(upload)
  if (error) throw new Error(error)

  let vault: MediaVault = dest.vault === 'portfolio' ? 'portfolio' : 'gallery'
  if (dest.vault === 'held' || dest.albumId || dest.workId) vault = 'held'

  const form = new FormData()
  form.append('file', upload)
  if (caption) form.append('caption', caption)
  form.append('vault', vault)
  form.append('in_portfolio', vault === 'portfolio' ? 'true' : 'false')

  if (vault === 'portfolio') {
    const nextSort =
      dest.portfolioSort ??
      (await listPortfolioMedia()).reduce((max, m) => Math.max(max, m.portfolio_sort || 0), 0) + 1
    form.append('portfolio_sort', String(nextSort))
  } else {
    form.append('portfolio_sort', '0')
  }

  const created = await createMediaRecord(form)
  if (dest.albumId) await addMediaToAlbum(dest.albumId, created.id)
  if (dest.workId) await addMediaToWork(dest.workId, created.id)
  return created
}

export async function findPortfolioCopies(galleryId: string) {
  return listCollected<MediaRecord>('media', {
    filter: `copied_from = "${galleryId}" && vault = "portfolio"`,
  })
}

export async function hasPortfolioCopy(galleryId: string) {
  const copies = await findPortfolioCopies(galleryId)
  return copies.length > 0
}

/** One-way promote: duplicate file into Portfolio vault. Idempotent if a copy already exists. */
export async function promoteToPortfolio(galleryId: string) {
  const existing = await findPortfolioCopies(galleryId)
  if (existing.length) return existing[0]

  const source = await pb.collection('media').getOne<MediaRecord>(galleryId)
  if (mediaVault(source) === 'portfolio') {
    throw new Error('This photo is already in Portfolio.')
  }
  if (!source.file) throw new Error('Photo has no file to copy.')

  const url = mediaOriginalUrl(source)
  const res = await fetch(url)
  if (!res.ok) throw new Error('Could not read photo file for Portfolio copy.')
  const blob = await res.blob()
  const filename = source.file.includes('/') ? source.file.split('/').pop()! : source.file
  const file = new File([blob], filename || 'photo.jpg', { type: blob.type || 'image/jpeg' })

  const portfolio = await listPortfolioMedia()
  const nextSort = portfolio.reduce((max, m) => Math.max(max, m.portfolio_sort || 0), 0) + 1

  const form = new FormData()
  form.append('file', file)
  if (source.caption) form.append('caption', source.caption)
  form.append('vault', 'portfolio')
  form.append('copied_from', galleryId)
  form.append('in_portfolio', 'true')
  form.append('portfolio_sort', String(nextSort))
  for (const tagId of source.tags ?? []) {
    form.append('tags', tagId)
  }

  return pb.collection('media').create<MediaRecord>(form)
}

/**
 * Delete a Gallery photo. If Portfolio copies exist and mode is omitted, throws with code NEED_MODE.
 * mode `gallery-only` keeps Portfolio copies; `both` deletes copies too.
 */
export async function deleteGalleryMedia(id: string, mode?: 'gallery-only' | 'both') {
  const copies = await findPortfolioCopies(id)
  if (copies.length && !mode) {
    const err = new Error('NEED_MODE') as Error & { copies: MediaRecord[] }
    err.copies = copies
    throw err
  }
  if (mode === 'both' && copies.length) {
    await Promise.all(copies.map((c) => pb.collection('media').delete(c.id)))
  }
  if (mode === 'gallery-only' && copies.length) {
    // Drop the link while the Gallery photo still exists. PocketBase re-checks
    // every relation on the next Portfolio save, so a dangling copied_from fails it.
    await Promise.all(copies.map((copy) => pb.collection('media').update(copy.id, { copied_from: '' })))
  }
  return pb.collection('media').delete(id)
}

export async function deletePortfolioMedia(id: string) {
  return pb.collection('media').delete(id)
}

export async function deleteMedia(id: string) {
  return pb.collection('media').delete(id)
}

/** @deprecated Prefer promoteToPortfolio / deletePortfolioMedia */
export async function setPortfolioMembership(id: string, inPortfolio: boolean, portfolioSort?: number) {
  if (inPortfolio) {
    return promoteToPortfolio(id)
  }
  const record = await pb.collection('media').getOne<MediaRecord>(id)
  if (mediaVault(record) === 'portfolio') {
    await deletePortfolioMedia(id)
    return record
  }
  const data: Record<string, unknown> = { in_portfolio: false }
  if (typeof portfolioSort === 'number') data.portfolio_sort = portfolioSort
  return updateMedia(id, data)
}

/** PocketBase validates every relation on update, including ones the patch does not change. */
function missingRelationFields(error: unknown) {
  const err = error as {
    response?: { data?: Record<string, { code?: string }> }
    data?: Record<string, { code?: string }>
  }
  const data = err.response?.data ?? err.data
  if (!data || typeof data !== 'object') return [] as string[]
  return Object.entries(data)
    .filter(([, info]) => info?.code === 'validation_missing_rel_records')
    .map(([field]) => field)
}

async function updateMedia(id: string, data: Record<string, unknown>) {
  try {
    return await pb.collection('media').update<MediaRecord>(id, data)
  } catch (error) {
    const broken = missingRelationFields(error)
    if (!broken.length) throw error
    const patch = { ...data }
    if (broken.includes('copied_from')) patch.copied_from = ''
    if (broken.includes('tags')) {
      const [record, tags] = await Promise.all([
        pb.collection('media').getOne<MediaRecord>(id),
        listTags(),
      ])
      const live = new Set(tags.map((tag) => tag.id))
      patch.tags = (record.tags ?? []).filter((tagId) => live.has(tagId))
    }
    return pb.collection('media').update<MediaRecord>(id, patch)
  }
}

export async function reorderPortfolio(orderedIds: string[]) {
  await Promise.all(
    orderedIds.map((id, index) =>
      updateMedia(id, {
        vault: 'portfolio',
        in_portfolio: true,
        portfolio_sort: index + 1,
      }),
    ),
  )
}

export async function setMediaTags(id: string, tagIds: string[]) {
  return updateMedia(id, { tags: tagIds })
}

export async function updateMediaCaption(id: string, caption: string) {
  return updateMedia(id, { caption: caption.trim() })
}

/** Flags `id` as the Artist portrait, clearing any other flagged image first. Pass `null` to clear. */
export async function setArtistPortrait(id: string | null) {
  const flagged = await listCollected<MediaRecord>('media', {
    filter: 'is_artist_portrait = true',
  })
  await Promise.all(
    flagged.filter((item) => item.id !== id).map((item) => updateMedia(item.id, { is_artist_portrait: false })),
  )
  if (id) {
    return updateMedia(id, { is_artist_portrait: true })
  }
  return null
}

export async function getArtistPortrait() {
  try {
    return await pb.collection('media').getFirstListItem<MediaRecord>('is_artist_portrait = true')
  } catch {
    return null
  }
}

/**
 * Client-side idempotent migrate: in_portfolio Gallery rows → Portfolio copies.
 * Only fetches rows that still need work — never the whole library.
 */
let vaultMigrationDone = false

export async function ensureGalleryVaultMigration() {
  if (vaultMigrationDone) return
  const filter = 'in_portfolio = true && vault != "portfolio" && vault != "held"'
  let page = 1
  const perPage = 40
  for (;;) {
    let result
    try {
      result = await pb.collection('media').getList<MediaRecord>(page, perPage, { filter })
    } catch {
      return
    }
    if (!result.items.length) {
      vaultMigrationDone = true
      return
    }
    for (const row of result.items) {
      if (mediaVault(row) !== 'gallery') continue
      await promoteToPortfolio(row.id)
      await pb.collection('media').update(row.id, { vault: 'gallery', in_portfolio: false })
    }
    if (result.items.length < perPage) {
      vaultMigrationDone = true
      return
    }
    page += 1
  }
}

export async function listTags() {
  return listCollected<TagRecord>('portfolio_tags', { sort: 'name' })
}

export function normalizeTagName(name: string) {
  return name.trim().replace(/\s+/g, ' ')
}

export function tagKey(name: string) {
  return normalizeTagName(name).toLocaleLowerCase()
}

/** Collapse case/whitespace variants so the public filter row offers one control. */
export function groupTagsForFilter(tags: TagRecord[]) {
  const byKey = new Map<string, TagRecord[]>()
  for (const tag of tags) {
    const key = tagKey(tag.name)
    const list = byKey.get(key) ?? []
    list.push(tag)
    byKey.set(key, list)
  }
  return [...byKey.values()]
    .map((group) => {
      const preferred = group.find((t) => t.name === normalizeTagName(t.name) && /[A-Z]/.test(t.name)) ?? group[0]
      return { id: preferred.id, name: preferred.name, ids: group.map((t) => t.id) }
    })
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
}

export async function createTag(name: string) {
  const trimmed = normalizeTagName(name)
  if (!trimmed) throw new Error('Tag name is required.')
  const existing = await listTags()
  const collision = existing.find((tag) => tagKey(tag.name) === tagKey(trimmed))
  if (collision) {
    throw new Error(`Tag “${collision.name}” already exists.`)
  }
  try {
    return await pb.collection('portfolio_tags').create<TagRecord>({ name: trimmed })
  } catch (error: unknown) {
    const err = error as {
      message?: string
      response?: { message?: string; data?: { name?: { message?: string } } }
    }
    const message =
      err.response?.data?.name?.message || err.response?.message || err.message || 'Could not create tag.'
    if (message.toLowerCase().includes('unique') || message.toLowerCase().includes('already')) {
      throw new Error(`Tag “${trimmed}” already exists.`)
    }
    throw new Error(message)
  }
}

export async function addMediaToAlbum(albumId: string, mediaId: string) {
  const album = await pb.collection('albums').getOne<AlbumRecord>(albumId)
  const images = Array.from(new Set([...(album.images ?? []), mediaId]))
  return pb.collection('albums').update<AlbumRecord>(albumId, { images })
}

async function countAlbumWorkHolders(mediaId: string) {
  const [albums, works] = await Promise.all([listAlbums(), listWork()])
  let n = 0
  for (const album of albums) {
    if (album.images?.includes(mediaId)) n++
  }
  for (const work of works) {
    if (work.images?.includes(mediaId) || work.cover === mediaId) n++
  }
  return n
}

/** Deletes a held photo when no album or Work still holds it. Gallery/Portfolio rows are left. */
export async function deleteHeldIfOrphan(mediaId: string) {
  let record: MediaRecord
  try {
    record = await getMedia(mediaId)
  } catch {
    return
  }
  if (mediaVault(record) !== 'held') return
  if (record.is_artist_portrait) return
  if ((await countAlbumWorkHolders(mediaId)) > 0) return
  await pb.collection('media').delete(mediaId)
}

/** Upload an About photo from Website settings. Stored held so it does not appear on the Gallery wall. */
export async function replaceArtistPortrait(file: File) {
  const previous = await getArtistPortrait()
  const created = await uploadMedia(file, '', { vault: 'held' })
  await setArtistPortrait(created.id)
  if (previous && previous.id !== created.id && mediaVault(previous) === 'held') {
    await deleteHeldIfOrphan(previous.id)
  }
  return created
}

export async function deleteHeldMedia(id: string) {
  const [albums, works] = await Promise.all([listAlbums(), listWork()])
  await Promise.all(
    albums
      .filter((album) => album.images?.includes(id))
      .map((album) =>
        pb.collection('albums').update(album.id, {
          images: (album.images ?? []).filter((imageId) => imageId !== id),
        }),
      ),
  )
  await Promise.all(
    works
      .filter((work) => work.images?.includes(id) || work.cover === id)
      .map((work) =>
        pb.collection('work_projects').update(work.id, {
          images: (work.images ?? []).filter((imageId) => imageId !== id),
          cover: work.cover === id ? '' : work.cover,
        }),
      ),
  )
  await pb.collection('media').delete(id)
}

export async function removeMediaFromAlbum(albumId: string, mediaId: string) {
  const album = await pb.collection('albums').getOne<AlbumRecord>(albumId)
  const updated = await pb.collection('albums').update<AlbumRecord>(albumId, {
    images: (album.images ?? []).filter((id) => id !== mediaId),
  })
  await deleteHeldIfOrphan(mediaId)
  return updated
}

export async function addMediaToWork(workId: string, mediaId: string) {
  const work = await pb.collection('work_projects').getOne<WorkRecord>(workId)
  const images = Array.from(new Set([...(work.images ?? []), mediaId]))
  return pb.collection('work_projects').update<WorkRecord>(workId, { images })
}

export async function removeMediaFromWork(workId: string, mediaId: string) {
  const work = await pb.collection('work_projects').getOne<WorkRecord>(workId)
  const nextImages = (work.images ?? []).filter((id) => id !== mediaId)
  const patch: Partial<WorkRecord> = { images: nextImages }
  if (work.cover === mediaId) patch.cover = ''
  const updated = await pb.collection('work_projects').update<WorkRecord>(workId, patch)
  await deleteHeldIfOrphan(mediaId)
  return updated
}

export async function renameTag(id: string, name: string) {
  const trimmed = normalizeTagName(name)
  if (!trimmed) throw new Error('Tag name is required.')
  const existing = await listTags()
  const collision = existing.find((tag) => tag.id !== id && tagKey(tag.name) === tagKey(trimmed))
  if (collision) {
    throw new Error(`Tag “${collision.name}” already exists.`)
  }
  return pb.collection('portfolio_tags').update<TagRecord>(id, { name: trimmed })
}

export async function deleteTag(id: string) {
  return pb.collection('portfolio_tags').delete(id)
}

/** Fetch specific media rows (covers / one album). Caps each filter so PocketBase stays happy. */
export async function listMediaByIds(ids: string[]) {
  const unique = [...new Set(ids.filter(Boolean))]
  if (!unique.length) return [] as MediaRecord[]
  const rows: MediaRecord[] = []
  const seen = new Set<string>()
  const chunkSize = 30
  for (let i = 0; i < unique.length; i += chunkSize) {
    const chunk = unique.slice(i, i + chunkSize)
    const filter = chunk.map((id) => `id = "${id.replaceAll('"', '')}"`).join(' || ')
    const page = await listCollected<MediaRecord>('media', { filter })
    for (const item of page) {
      if (seen.has(item.id)) continue
      seen.add(item.id)
      rows.push(item)
    }
  }
  return rows
}

export async function listAlbums() {
  return listCollected<AlbumRecord>('albums', { sort: 'title' })
}

/** Album list plus first-image expand for cover thumbs — not every frame. */
export async function listAlbumsWithCovers() {
  const albums = await listAlbums()
  const media = await listMediaByIds(albums.map((row) => row.images?.[0] ?? '').filter(Boolean))
  const byId = new Map(media.map((item) => [item.id, item]))
  return albums.map((row) => {
    const first = row.images?.[0]
    const rec = first ? byId.get(first) : undefined
    return rec ? { ...row, expand: { images: [rec] } } : row
  })
}

export async function createAlbum(title: string) {
  return pb.collection('albums').create<AlbumRecord>({ title: title.trim(), images: [] })
}

export async function renameAlbum(id: string, title: string) {
  return pb.collection('albums').update<AlbumRecord>(id, { title: title.trim() })
}

export async function deleteAlbum(id: string) {
  const album = await pb.collection('albums').getOne<AlbumRecord>(id)
  const ids = album.images ?? []
  await pb.collection('albums').delete(id)
  await Promise.all(ids.map((mediaId) => deleteHeldIfOrphan(mediaId)))
}

export async function setAlbumImages(id: string, imageIds: string[]) {
  return pb.collection('albums').update<AlbumRecord>(id, { images: imageIds })
}

export async function listWork() {
  try {
    return await listCollected<WorkRecord>('work_projects', {
      sort: 'sort,title',
      expand: 'cover',
    })
  } catch {
    return listCollected<WorkRecord>('work_projects', { sort: 'sort,title' })
  }
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 160)
}

export async function createWork(input: {
  title: string
  slug?: string
  description?: string
  images?: string[]
  showOnWebsite?: boolean
}) {
  const title = input.title.trim()
  const slug = (input.slug?.trim() || slugify(title)) || `work-${Date.now()}`
  return pb.collection('work_projects').create<WorkRecord>({
    title,
    slug,
    description: input.description ?? '',
    images: input.images ?? [],
    show_on_website: input.showOnWebsite ?? false,
    sort: 0,
  })
}

export async function updateWork(
  id: string,
  data: Partial<{
    title: string
    slug: string
    description: string
    story_body: string
    story_client: string
    story_location: string
    story_shot_at: string
    images: string[]
    cover: string
    show_on_website: boolean
    sort: number
  }>,
) {
  return pb.collection('work_projects').update<WorkRecord>(id, data)
}

export async function deleteWork(id: string) {
  const work = await pb.collection('work_projects').getOne<WorkRecord>(id)
  const ids = [...new Set([...(work.images ?? []), work.cover].filter(Boolean))]
  await pb.collection('work_projects').delete(id)
  await Promise.all(ids.map((mediaId) => deleteHeldIfOrphan(mediaId)))
}

/** Sets `sort` on each Work project to its 1-based position in `ids`. */
export async function reorderWork(ids: string[]) {
  await Promise.all(ids.map((id, index) => pb.collection('work_projects').update(id, { sort: index + 1 })))
}

export async function getBrandSettings() {
  const list = await pb.collection('brand_settings').getList<BrandRecord>(1, 1, {
    filter: 'key="site"',
  })
  return list.items[0] ?? null
}

export async function upsertBrandLogo(file: File) {
  const error = validateImageFile(file)
  if (error) throw new Error(error)

  const existing = await getBrandSettings()
  const form = new FormData()
  form.append('logo', file)
  form.append('key', 'site')

  if (existing) {
    return pb.collection('brand_settings').update<BrandRecord>(existing.id, form)
  }
  return pb.collection('brand_settings').create<BrandRecord>(form)
}

export async function upsertBrandFavicon(file: File) {
  const max = getMaxUploadMb() * 1024 * 1024
  if (file.size > max) throw new Error(`Favicon must be under ${getMaxUploadMb()}MB.`)
  const ok = /^(image\/(jpeg|png|webp|svg\+xml|x-icon|vnd\.microsoft\.icon)|image\/ico)$/i.test(file.type)
  if (!ok && !/\.(ico|png|jpe?g|webp|svg)$/i.test(file.name)) {
    throw new Error('Use an ICO, PNG, JPEG, WebP, or SVG favicon.')
  }

  const existing = await getBrandSettings()
  const form = new FormData()
  form.append('favicon', file)
  form.append('key', 'site')

  if (existing) {
    return pb.collection('brand_settings').update<BrandRecord>(existing.id, form)
  }
  return pb.collection('brand_settings').create<BrandRecord>(form)
}

export function brandLogoUrl(record: BrandRecord | null) {
  if (!record?.logo) return ''
  return pb.files.getURL(record, record.logo, { thumb: '200x0' })
}

export function brandFaviconUrl(record: BrandRecord | null) {
  if (!record?.favicon) return ''
  return pb.files.getURL(record, record.favicon)
}

/** Document icon for public pages. Falls back to the built-in SVG when Brand has none. */
export function applyDocumentFavicon(href: string) {
  if (typeof document === 'undefined') return
  const url = href || '/favicon.svg'
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!el) {
    el = document.createElement('link')
    el.rel = 'icon'
    document.head.appendChild(el)
  }
  el.href = url
  if (/\.svg(\?|$)/i.test(url)) el.type = 'image/svg+xml'
  else if (/\.png(\?|$)/i.test(url)) el.type = 'image/png'
  else if (/\.ico(\?|$)/i.test(url)) el.type = 'image/x-icon'
  else el.removeAttribute('type')
}

export async function listPublicPortfolio() {
  try {
    return await listCollected<MediaRecord>('media', {
      filter: 'vault = "portfolio"',
      sort: 'portfolio_sort,created',
    })
  } catch {
    // Pre-migration / missing vault field fallback
    return listCollected<MediaRecord>('media', {
      filter: 'in_portfolio = true',
      sort: 'portfolio_sort,created',
    })
  }
}

export async function listPublicWork() {
  try {
    return await listCollected<WorkRecord>('work_projects', {
      filter: 'show_on_website = true',
      sort: 'sort,title',
      expand: 'cover',
    })
  } catch {
    return listCollected<WorkRecord>('work_projects', {
      filter: 'show_on_website = true',
      sort: 'sort,title',
    })
  }
}

export async function getPublicWorkBySlug(slug: string) {
  const work = await pb.collection('work_projects').getFirstListItem<WorkRecord>(
    `slug="${slug.replaceAll('"', '\\"')}" && show_on_website = true`,
    { expand: 'cover' },
  )
  const images = await listMediaByIds(work.images ?? [])
  return {
    ...work,
    expand: {
      ...work.expand,
      images,
    },
  }
}
