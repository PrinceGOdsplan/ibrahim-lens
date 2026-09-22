/**
 * Ensures Library-related PocketBase collections exist (idempotent).
 * Called from `npm run seed` after superuser auth.
 */
import type PocketBase from 'pocketbase'

const AUTHED = '@request.auth.id != ""'
const MIME = ['image/jpeg', 'image/png', 'image/webp']
const FAVICON_MIME = [...MIME, 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon']
/** Held or Gallery photos on a published Work page. */
const MEDIA_VIA_PUBLISHED_WORK =
  '@collection.work_projects.show_on_website = true && (@collection.work_projects.images.id ?= id || @collection.work_projects.cover = id)'
/** About photo uploaded from Website settings (held, not on the Gallery wall). */
const MEDIA_VIA_PORTRAIT = 'is_artist_portrait = true'
/** Square grids + landscape hero crop (WxH = exact crop). */
const MEDIA_THUMBS = ['200x200', '400x400', '800x800', '1200x0', '1600x900']

function maxUploadBytes() {
  const mb = Number(process.env.MAX_UPLOAD_MB ?? process.env.VITE_MAX_UPLOAD_MB ?? 25)
  return Math.max(1, mb) * 1024 * 1024
}

async function getCollection(pb: PocketBase, name: string) {
  try {
    return await pb.collections.getOne(name)
  } catch {
    return null
  }
}

type FieldSpec = Record<string, unknown> & { name: string }
type CollectionLike = { id: string; name: string; fields?: unknown }

/** Adds any fields from `specs` that are missing on `collection`, in a single update. Idempotent. */
async function ensureFields<T extends CollectionLike>(pb: PocketBase, collection: T, specs: FieldSpec[]): Promise<T> {
  const existing = (collection.fields ?? []) as Array<{ name?: string }>
  const existingNames = new Set(existing.map((f) => f.name))
  const missing = specs.filter((spec) => !existingNames.has(spec.name))
  if (!missing.length) return collection
  const updated = await pb.collections.update(collection.id, {
    fields: [...existing, ...missing],
  })
  console.log(`Added field(s) to ${collection.name}: ${missing.map((f) => f.name).join(', ')}`)
  return updated as T
}

async function ensureVaultIncludesHeld<T extends CollectionLike>(pb: PocketBase, collection: T): Promise<T> {
  const fields = (collection.fields ?? []) as Array<{ name?: string; values?: string[] }>
  const vault = fields.find((f) => f.name === 'vault')
  const values = vault?.values ?? []
  if (values.includes('held') && values.includes('gallery') && values.includes('portfolio')) return collection
  const updated = await pb.collections.update(collection.id, {
    fields: fields.map((f) =>
      f.name === 'vault' ? { ...f, type: 'select', maxSelect: 1, values: ['gallery', 'portfolio', 'held'] } : f,
    ),
  })
  console.log('Updated media.vault values (gallery, portfolio, held)')
  return updated as T
}

/**
 * One-time migration: if no media is flagged `is_artist_portrait` yet, flag the first
 * media whose caption trims/case-folds to "artist" (the old convention this flag replaces).
 */
async function migrateArtistPortraitFlag(pb: PocketBase) {
  const flagged = await pb.collection('media').getList(1, 1, { filter: 'is_artist_portrait = true' })
  if (flagged.totalItems > 0) return

  const candidates = await pb.collection('media').getFullList<{ id: string; caption?: string }>({
    filter: 'caption != ""',
  })
  const artist = candidates.find((m) => (m.caption ?? '').trim().toLowerCase() === 'artist')
  if (artist) {
    await pb.collection('media').update(artist.id, { is_artist_portrait: true })
    console.log(`Migrated Artist portrait flag -> media ${artist.id} (was caption "Artist")`)
  }
}

type MediaMigrateRow = {
  id: string
  file: string
  caption?: string
  in_portfolio?: boolean
  portfolio_sort?: number
  vault?: string
  tags?: string[]
  is_artist_portrait?: boolean
}

/**
 * Idempotent: Gallery originals stay in vault=gallery; former in_portfolio flags become
 * Portfolio vault copies (file duplicated). Safe to re-run.
 */
export async function migratePortfolioVaults(pb: PocketBase) {
  const all = await pb.collection('media').getFullList<MediaMigrateRow>()
  if (!all.length) return

  let promoted = 0
  let normalized = 0

  for (const row of all) {
    if (row.vault === 'portfolio') {
      if (!row.in_portfolio) {
        await pb.collection('media').update(row.id, { in_portfolio: true })
        normalized++
      }
      continue
    }

    if (row.vault === 'held') continue

    // Default / empty vault → gallery
    if (row.vault !== 'gallery') {
      await pb.collection('media').update(row.id, { vault: 'gallery' })
      normalized++
    }

    if (!row.in_portfolio) continue

    const existingCopies = await pb.collection('media').getFullList<MediaMigrateRow>({
      filter: `copied_from = "${row.id}" && vault = "portfolio"`,
    })
    if (!existingCopies.length) {
      if (!row.file) {
        await pb.collection('media').update(row.id, { in_portfolio: false, vault: 'gallery' })
        continue
      }
      const url = pb.files.getURL(row, row.file)
      const res = await fetch(url)
      if (!res.ok) {
        console.warn(`  vault migrate: could not fetch ${row.id} (${res.status})`)
        continue
      }
      const blob = await res.blob()
      const filename = row.file.includes('/') ? row.file.split('/').pop()! : row.file
      const file = new File([blob], filename || 'photo.jpg', { type: blob.type || 'image/jpeg' })
      const form = new FormData()
      form.append('file', file)
      if (row.caption) form.append('caption', row.caption)
      form.append('vault', 'portfolio')
      form.append('copied_from', row.id)
      form.append('in_portfolio', 'true')
      form.append('portfolio_sort', String(row.portfolio_sort ?? 0))
      if (row.tags?.length) {
        for (const tagId of row.tags) form.append('tags', tagId)
      }
      await pb.collection('media').create(form)
      promoted++
    }

    await pb.collection('media').update(row.id, {
      vault: 'gallery',
      in_portfolio: false,
    })
  }

  if (promoted || normalized) {
    console.log(`Portfolio vault migrate: ${promoted} copy(ies) created, ${normalized} row(s) normalized`)
  }
}

export async function ensureLibrarySchema(pb: PocketBase) {
  const maxSize = maxUploadBytes()

  let tags = await getCollection(pb, 'portfolio_tags')
  if (!tags) {
    tags = await pb.collections.create({
      name: 'portfolio_tags',
      type: 'base',
      listRule: AUTHED,
      viewRule: '',
      createRule: AUTHED,
      updateRule: AUTHED,
      deleteRule: AUTHED,
      fields: [
        { name: 'name', type: 'text', required: true, min: 1, max: 64 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_portfolio_tags_name ON portfolio_tags (name)'],
    })
    console.log('Created collection: portfolio_tags')
  }

  let media = await getCollection(pb, 'media')
  if (!media) {
    media = await pb.collections.create({
      name: 'media',
      type: 'base',
      listRule: AUTHED,
      viewRule: '',
      createRule: AUTHED,
      updateRule: AUTHED,
      deleteRule: AUTHED,
      fields: [
        {
          name: 'file',
          type: 'file',
          required: true,
          maxSelect: 1,
          maxSize,
          mimeTypes: MIME,
          thumbs: MEDIA_THUMBS,
        },
        { name: 'caption', type: 'text', max: 500 },
        { name: 'in_portfolio', type: 'bool' },
        { name: 'portfolio_sort', type: 'number' },
        { name: 'is_artist_portrait', type: 'bool' },
        {
          name: 'vault',
          type: 'select',
          maxSelect: 1,
          values: ['gallery', 'portfolio', 'held'],
        },
        {
          name: 'tags',
          type: 'relation',
          collectionId: tags.id,
          maxSelect: 20,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    console.log('Created collection: media')
  } else {
    const fields = (media.fields ?? []) as { name?: string; thumbs?: string[]; id?: string }[]
    const fileField = fields.find((f) => f.name === 'file')
    const have = new Set(fileField?.thumbs ?? [])
    const missing = MEDIA_THUMBS.filter((t) => !have.has(t))
    if (fileField && missing.length) {
      await pb.collections.update(media.id, {
        fields: fields.map((f) => (f.name === 'file' ? { ...f, thumbs: MEDIA_THUMBS } : f)),
      })
      media = await getCollection(pb, 'media')
      console.log(`Updated media.file thumbs (+${missing.join(', ')})`)
    }
  }
  if (!media) throw new Error('media collection missing after create/update')
  media = await ensureFields(pb, media, [
    { name: 'is_artist_portrait', type: 'bool' },
    {
      name: 'vault',
      type: 'select',
      maxSelect: 1,
      values: ['gallery', 'portfolio', 'held'],
    },
    { name: 'focal_x', type: 'number', min: 0, max: 100 },
    { name: 'focal_y', type: 'number', min: 0, max: 100 },
  ])
  media = await ensureVaultIncludesHeld(pb, media)
  // Self-relation must be added after media exists (cannot embed on first create cleanly for upgrades).
  media = await ensureFields(pb, media, [
    {
      name: 'copied_from',
      type: 'relation',
      collectionId: media.id,
      maxSelect: 1,
    },
  ])
  await migrateArtistPortraitFlag(pb)
  await migratePortfolioVaults(pb)

  let albums = await getCollection(pb, 'albums')
  if (!albums) {
    albums = await pb.collections.create({
      name: 'albums',
      type: 'base',
      listRule: AUTHED,
      viewRule: AUTHED,
      createRule: AUTHED,
      updateRule: AUTHED,
      deleteRule: AUTHED,
      fields: [
        { name: 'title', type: 'text', required: true, min: 1, max: 120 },
        {
          name: 'images',
          type: 'relation',
          collectionId: media.id,
          maxSelect: 500,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    console.log('Created collection: albums')
  }

  let work = await getCollection(pb, 'work_projects')
  if (!work) {
    work = await pb.collections.create({
      name: 'work_projects',
      type: 'base',
      listRule: AUTHED,
      viewRule: '',
      createRule: AUTHED,
      updateRule: AUTHED,
      deleteRule: AUTHED,
      fields: [
        { name: 'title', type: 'text', required: true, min: 1, max: 160 },
        { name: 'slug', type: 'text', required: true, min: 1, max: 160, pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
        { name: 'description', type: 'text', max: 5000 },
        { name: 'show_on_website', type: 'bool' },
        {
          name: 'cover',
          type: 'relation',
          collectionId: media.id,
          maxSelect: 1,
        },
        {
          name: 'images',
          type: 'relation',
          collectionId: media.id,
          maxSelect: 500,
        },
        { name: 'sort', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_work_projects_slug ON work_projects (slug)'],
    })
    console.log('Created collection: work_projects')
  }

  work = await ensureFields(pb, work, [
    { name: 'story_body', type: 'text', max: 20000 },
    { name: 'story_client', type: 'text', max: 160 },
    { name: 'story_location', type: 'text', max: 160 },
    { name: 'story_shot_at', type: 'date' },
  ])

  let brand = await getCollection(pb, 'brand_settings')
  if (!brand) {
    brand = await pb.collections.create({
      name: 'brand_settings',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: AUTHED,
      updateRule: AUTHED,
      deleteRule: AUTHED,
      fields: [
        { name: 'key', type: 'text', required: true, min: 1, max: 40 },
        {
          name: 'logo',
          type: 'file',
          maxSelect: 1,
          maxSize,
          mimeTypes: MIME,
          thumbs: ['200x0'],
        },
        {
          name: 'favicon',
          type: 'file',
          maxSelect: 1,
          maxSize,
          mimeTypes: FAVICON_MIME,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_brand_settings_key ON brand_settings (key)'],
    })
    console.log('Created collection: brand_settings')
  } else {
    brand = await ensureFields(pb, brand, [
      {
        name: 'favicon',
        type: 'file',
        maxSelect: 1,
        maxSize,
        mimeTypes: FAVICON_MIME,
      },
    ])
  }

  // Tags are readable publicly (Portfolio filters); only Studio can mutate
  await pb.collections.update(tags.id, {
    listRule: '',
    viewRule: '',
    createRule: AUTHED,
    updateRule: AUTHED,
    deleteRule: AUTHED,
  })
  await pb.collections.update(media.id, {
    listRule: `${AUTHED} || vault = "portfolio" || in_portfolio = true || ${MEDIA_VIA_PORTRAIT} || (${MEDIA_VIA_PUBLISHED_WORK})`,
    viewRule: `${AUTHED} || vault = "portfolio" || in_portfolio = true || ${MEDIA_VIA_PORTRAIT} || (${MEDIA_VIA_PUBLISHED_WORK})`,
    createRule: AUTHED,
    updateRule: AUTHED,
    deleteRule: AUTHED,
  })
  await pb.collections.update(work.id, {
    listRule: `${AUTHED} || show_on_website = true`,
    viewRule: `${AUTHED} || show_on_website = true`,
    createRule: AUTHED,
    updateRule: AUTHED,
    deleteRule: AUTHED,
  })
  if (albums) {
    await pb.collections.update(albums.id, {
      listRule: AUTHED,
      viewRule: AUTHED,
      createRule: AUTHED,
      updateRule: AUTHED,
      deleteRule: AUTHED,
    })
  }

  console.log(`Library schema ready (max upload ${Math.round(maxSize / 1024 / 1024)}MB).`)
  await ensureWebsiteSchema(pb)
  await ensureClientsSchema(pb)
}

export async function ensureWebsiteSchema(pb: PocketBase) {
  const AUTHED = '@request.auth.id != ""'
  const media = await getCollection(pb, 'media')
  if (!media) throw new Error('media collection required before website schema')

  let globals = await getCollection(pb, 'website_globals')
  if (!globals) {
    globals = await pb.collections.create({
      name: 'website_globals',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: AUTHED,
      updateRule: AUTHED,
      deleteRule: AUTHED,
      fields: [
        { name: 'key', type: 'text', required: true, max: 40 },
        { name: 'home_tagline', type: 'text', max: 280 },
        {
          name: 'home_featured',
          type: 'relation',
          collectionId: media.id,
          maxSelect: 12,
        },
        { name: 'about_body', type: 'text', max: 20000 },
        { name: 'contact_email', type: 'text', max: 120 },
        { name: 'contact_phone', type: 'text', max: 64 },
        { name: 'contact_location', type: 'text', max: 200 },
        { name: 'social_instagram', type: 'text', max: 160 },
        { name: 'contact_fields', type: 'json' },
        { name: 'booking_questions', type: 'json' },
        { name: 'booking_calendar_enabled', type: 'bool' },
        { name: 'booking_help_text', type: 'text', max: 500 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_website_globals_key ON website_globals (key)'],
    })
    console.log('Created collection: website_globals')
  }

  globals = await ensureFields(pb, globals, [
    { name: 'social_instagram', type: 'text', max: 160 },
    // Home curator (lanes, atmosphere, Work picks, About tease)
    { name: 'home_lanes', type: 'json' },
    { name: 'home_lanes_headline', type: 'text', max: 160 },
    { name: 'atmosphere_mode', type: 'text', max: 20 },
    { name: 'atmosphere_ids', type: 'json' },
    { name: 'home_work', type: 'json' },
    { name: 'about_tease_headline', type: 'text', max: 280 },
    { name: 'about_tease_lead', type: 'text', max: 500 },
    // About / Contact voice
    { name: 'about_subtitle', type: 'text', max: 280 },
    { name: 'contact_h1', type: 'text', max: 120 },
    { name: 'contact_intro', type: 'text', max: 500 },
    { name: 'write_blurb', type: 'text', max: 500 },
    // Site chrome
    { name: 'footer_blurb', type: 'text', max: 500 },
    { name: 'eyebrows', type: 'json' },
    { name: 'privacy_body', type: 'text', max: 50000 },
    { name: 'terms_body', type: 'text', max: 50000 },
    { name: 'site_display_name', type: 'text', max: 120 },
  ])

  // service_packages removed: Soft night Home uses lanes/Work picks instead of a packages
  // teaser (see openspec/changes/studio-website-cms). This permanently deletes any existing
  // package records and the collection itself — BACK UP ./pb_data before running this against
  // a database that still has packages you want to keep.
  const packages = await getCollection(pb, 'service_packages')
  if (packages) {
    const rows = await pb.collection('service_packages').getFullList()
    for (const row of rows) {
      await pb.collection('service_packages').delete(row.id)
    }
    await pb.collections.delete(packages.id)
    console.log(`Removed collection: service_packages (deleted ${rows.length} record(s))`)
  }

  let testimonials = await getCollection(pb, 'testimonials')
  if (!testimonials) {
    testimonials = await pb.collections.create({
      name: 'testimonials',
      type: 'base',
      listRule: `${AUTHED} || published = true`,
      viewRule: `${AUTHED} || published = true`,
      createRule: AUTHED,
      updateRule: AUTHED,
      deleteRule: AUTHED,
      fields: [
        { name: 'quote', type: 'text', required: true, max: 2000 },
        { name: 'author_name', type: 'text', required: true, max: 120 },
        { name: 'author_role', type: 'text', max: 160 },
        { name: 'published', type: 'bool' },
        { name: 'sort', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    console.log('Created collection: testimonials')
  } else {
    const fieldNames = new Set((testimonials.fields ?? []).map((f: { name?: string }) => f.name))
    if (!fieldNames.has('author_role')) {
      await pb.collections.update(testimonials.id, {
        fields: [...(testimonials.fields ?? []), { name: 'author_role', type: 'text', max: 160 }],
      })
      console.log('Added field testimonials.author_role')
    }
    await pb.collections.update(testimonials.id, {
      listRule: `${AUTHED} || published = true`,
      viewRule: `${AUTHED} || published = true`,
    })
  }

  let faq = await getCollection(pb, 'faq_items')
  if (!faq) {
    faq = await pb.collections.create({
      name: 'faq_items',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: AUTHED,
      updateRule: AUTHED,
      deleteRule: AUTHED,
      fields: [
        { name: 'question', type: 'text', required: true, max: 300 },
        { name: 'answer', type: 'text', required: true, max: 4000 },
        { name: 'sort', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    console.log('Created collection: faq_items')
  }

  let seo = await getCollection(pb, 'seo_meta')
  if (!seo) {
    seo = await pb.collections.create({
      name: 'seo_meta',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: AUTHED,
      updateRule: AUTHED,
      deleteRule: AUTHED,
      fields: [
        { name: 'page_key', type: 'text', required: true, max: 40 },
        { name: 'title', type: 'text', max: 120 },
        { name: 'description', type: 'text', max: 320 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_seo_meta_page_key ON seo_meta (page_key)'],
    })
    console.log('Created collection: seo_meta')
  }

  let inquiries = await getCollection(pb, 'form_inquiries')
  if (!inquiries) {
    inquiries = await pb.collections.create({
      name: 'form_inquiries',
      type: 'base',
      listRule: AUTHED,
      viewRule: AUTHED,
      createRule: `${AUTHED} || (@request.body.kind = "contact")`,
      updateRule: AUTHED,
      deleteRule: AUTHED,
      fields: [
        { name: 'kind', type: 'text', required: true, max: 40 },
        { name: 'payload', type: 'json', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    console.log('Created collection: form_inquiries')
  } else {
    await pb.collections.update(inquiries.id, {
      createRule: `${AUTHED} || (@request.body.kind = "contact")`,
    })
  }

  await pb.collections.update(globals.id, {
    listRule: '',
    viewRule: '',
    createRule: AUTHED,
    updateRule: AUTHED,
    deleteRule: AUTHED,
  })

  // Ensure singleton site row exists (avoids Strict Mode create races in the app)
  const siteRows = await pb.collection('website_globals').getList(1, 1, { filter: 'key="site"' })
  if (!siteRows.items[0]) {
    try {
      await pb.collection('website_globals').create({
        key: 'site',
        home_tagline: 'Soft night portraits and fashion, held in quiet light.',
        home_featured: [],
        about_body: '',
        booking_questions: [],
        booking_calendar_enabled: true,
        booking_help_text: '',
      })
      console.log('Seeded website_globals site row')
    } catch {
      // Another process may have created it
    }
  }

  console.log('Website schema ready.')
}

export async function ensureClientsSchema(pb: PocketBase) {
  const AUTHED = '@request.auth.id != ""'
  const media = await getCollection(pb, 'media')
  const albums = await getCollection(pb, 'albums')
  const work = await getCollection(pb, 'work_projects')
  if (!media || !albums || !work) {
    throw new Error('media, albums, and work_projects are required before clients schema')
  }

  const deliveryGuest =
    'token != "" && token = @request.query.token && revoked != true && expires_at > @now'
  const deliveryFeedbackGuest =
    '@request.query.token != "" && delivery.token = @request.query.token && delivery.revoked != true && delivery.expires_at > @now'
  const mediaViaDelivery =
    `@request.query.token != "" && @collection.deliveries.token = @request.query.token && @collection.deliveries.revoked != true && @collection.deliveries.expires_at > @now && @collection.deliveries.images.id ?= id`

  let deliveries = await getCollection(pb, 'deliveries')
  if (!deliveries) {
    deliveries = await pb.collections.create({
      name: 'deliveries',
      type: 'base',
      listRule: `${AUTHED} || (${deliveryGuest})`,
      viewRule: `${AUTHED} || (${deliveryGuest})`,
      createRule: AUTHED,
      updateRule: AUTHED,
      deleteRule: AUTHED,
      fields: [
        { name: 'token', type: 'text', required: true, min: 16, max: 64 },
        { name: 'client_name', type: 'text', required: true, min: 1, max: 160 },
        { name: 'client_email', type: 'text', max: 120 },
        {
          name: 'source_type',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['images', 'albums', 'work'],
        },
        {
          name: 'images',
          type: 'relation',
          collectionId: media.id,
          maxSelect: 500,
        },
        {
          name: 'albums',
          type: 'relation',
          collectionId: albums.id,
          maxSelect: 50,
        },
        {
          name: 'work',
          type: 'relation',
          collectionId: work.id,
          maxSelect: 1,
        },
        { name: 'expires_at', type: 'date', required: true },
        { name: 'revoked', type: 'bool' },
        { name: 'downloaded_at', type: 'date' },
        { name: 'expiry_mail_sent_at', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_deliveries_token ON deliveries (token)'],
    })
    console.log('Created collection: deliveries')
  } else {
    await pb.collections.update(deliveries.id, {
      listRule: `${AUTHED} || (${deliveryGuest})`,
      viewRule: `${AUTHED} || (${deliveryGuest})`,
      createRule: AUTHED,
      updateRule: AUTHED,
      deleteRule: AUTHED,
    })
  }

  let feedback = await getCollection(pb, 'delivery_feedback')
  if (!feedback) {
    feedback = await pb.collections.create({
      name: 'delivery_feedback',
      type: 'base',
      listRule: AUTHED,
      viewRule: AUTHED,
      createRule: `${AUTHED} || (${deliveryFeedbackGuest})`,
      updateRule: AUTHED,
      deleteRule: AUTHED,
      fields: [
        {
          name: 'delivery',
          type: 'relation',
          collectionId: deliveries.id,
          maxSelect: 1,
          required: true,
        },
        { name: 'message', type: 'text', required: true, max: 4000 },
        {
          name: 'selected_images',
          type: 'relation',
          collectionId: media.id,
          maxSelect: 100,
        },
        { name: 'client_name', type: 'text', max: 160 },
        { name: 'reviewed', type: 'bool' },
        { name: 'promoted', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    console.log('Created collection: delivery_feedback')
  } else {
    await pb.collections.update(feedback.id, {
      createRule: `${AUTHED} || (${deliveryFeedbackGuest})`,
    })
  }

  // Guests with a valid delivery token can view those images (for gallery + downloads).
  await pb.collections.update(media.id, {
    listRule: `${AUTHED} || vault = "portfolio" || in_portfolio = true || ${MEDIA_VIA_PORTRAIT} || (${mediaViaDelivery}) || (${MEDIA_VIA_PUBLISHED_WORK})`,
    viewRule: `${AUTHED} || vault = "portfolio" || in_portfolio = true || ${MEDIA_VIA_PORTRAIT} || (${mediaViaDelivery}) || (${MEDIA_VIA_PUBLISHED_WORK})`,
    createRule: AUTHED,
    updateRule: AUTHED,
    deleteRule: AUTHED,
  })

  const maxSize = maxUploadBytes()
  const deliveryFileGuest =
    '@request.query.token != "" && delivery.token = @request.query.token && delivery.revoked != true && delivery.expires_at > @now'
  let deliveryFiles = await getCollection(pb, 'delivery_files')
  if (!deliveryFiles) {
    deliveryFiles = await pb.collections.create({
      name: 'delivery_files',
      type: 'base',
      listRule: `${AUTHED} || (${deliveryFileGuest})`,
      viewRule: `${AUTHED} || (${deliveryFileGuest})`,
      createRule: AUTHED,
      updateRule: AUTHED,
      deleteRule: AUTHED,
      fields: [
        {
          name: 'delivery',
          type: 'relation',
          collectionId: deliveries.id,
          maxSelect: 1,
          required: true,
        },
        {
          name: 'media',
          type: 'relation',
          collectionId: media.id,
          maxSelect: 1,
        },
        {
          name: 'file',
          type: 'file',
          required: true,
          maxSelect: 1,
          maxSize,
          mimeTypes: MIME,
          thumbs: MEDIA_THUMBS,
        },
        { name: 'caption', type: 'text', max: 500 },
        { name: 'sort', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    console.log('Created collection: delivery_files')
  } else {
    await pb.collections.update(deliveryFiles.id, {
      listRule: `${AUTHED} || (${deliveryFileGuest})`,
      viewRule: `${AUTHED} || (${deliveryFileGuest})`,
      createRule: AUTHED,
      updateRule: AUTHED,
      deleteRule: AUTHED,
    })
  }

  console.log('Clients schema ready.')
  await ensureBookingOpsSchema(pb)
  await ensureStudioOpsSchema(pb)
}

export async function ensureBookingOpsSchema(pb: PocketBase) {
  const AUTHED = '@request.auth.id != ""'

  let people = await getCollection(pb, 'people')
  if (!people) {
    people = await pb.collections.create({
      name: 'people',
      type: 'base',
      listRule: AUTHED,
      viewRule: AUTHED,
      createRule: AUTHED,
      updateRule: AUTHED,
      deleteRule: AUTHED,
      fields: [
        { name: 'name', type: 'text', required: true, min: 1, max: 160 },
        { name: 'phone_e164', type: 'text', required: true, max: 24 },
        { name: 'phone_digits', type: 'text', required: true, max: 24 },
        { name: 'email', type: 'text', max: 120 },
        { name: 'notes', type: 'text', max: 5000 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_people_phone_digits ON people (phone_digits)'],
    })
    console.log('Created collection: people')
  } else {
    await pb.collections.update(people.id, {
      listRule: AUTHED,
      viewRule: AUTHED,
      createRule: AUTHED,
      updateRule: AUTHED,
      deleteRule: AUTHED,
    })
  }

  let bookings = await getCollection(pb, 'bookings')
  if (!bookings) {
    bookings = await pb.collections.create({
      name: 'bookings',
      type: 'base',
      listRule: AUTHED,
      viewRule: AUTHED,
      createRule: '',
      updateRule: AUTHED,
      deleteRule: AUTHED,
      fields: [
        {
          name: 'person',
          type: 'relation',
          collectionId: people.id,
          maxSelect: 1,
          required: false,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['needs_contact', 'pending', 'confirmed', 'completed', 'declined', 'cancelled'],
        },
        { name: 'preferred_at', type: 'text', max: 64 },
        { name: 'answers', type: 'json' },
        { name: 'studio_notes', type: 'text', max: 8000 },
        { name: 'fee_ngn', type: 'number' },
        { name: 'amount_paid_ngn', type: 'number' },
        { name: 'source', type: 'text', max: 40 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    console.log('Created collection: bookings')
  } else {
    type BookingField = { name?: string; required?: boolean }
    const fields = JSON.parse(JSON.stringify(bookings.fields ?? [])) as BookingField[]
    const personField = fields.find((f) => f.name === 'person')
    if (personField?.required) {
      await pb.collections.update(bookings.id, {
        fields: fields.map((f) => (f.name === 'person' ? { ...f, required: false } : f)),
      })
      console.log('Updated bookings.person: not required (guest create; hook sets Person)')
    }
  }

  let events = await getCollection(pb, 'booking_events')
  if (!events) {
    events = await pb.collections.create({
      name: 'booking_events',
      type: 'base',
      listRule: AUTHED,
      viewRule: AUTHED,
      createRule: AUTHED,
      updateRule: null,
      deleteRule: AUTHED,
      fields: [
        {
          name: 'booking',
          type: 'relation',
          collectionId: bookings.id,
          maxSelect: 1,
          required: true,
          cascadeDelete: true,
        },
        { name: 'type', type: 'text', required: true, max: 64 },
        { name: 'actor', type: 'text', max: 120 },
        { name: 'before', type: 'json' },
        { name: 'after', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      ],
    })
    console.log('Created collection: booking_events')
  }

  // Existing installs created this collection with deleteRule: null and no
  // cascade. Removal of a booking must take its events with it.
  {
    type EventField = { name?: string; id?: string; cascadeDelete?: boolean }
    const fields = JSON.parse(JSON.stringify(events.fields ?? [])) as EventField[]
    const next = fields.map((f) => (f.name === 'booking' ? { ...f, cascadeDelete: true } : f))
    const bookingField = next.find((f) => f.name === 'booking')
    const needsDeleteRule = events.deleteRule !== AUTHED
    const needsCreateRule = events.createRule !== AUTHED
    const needsCascade = bookingField?.cascadeDelete !== true
    if (needsDeleteRule || needsCreateRule || needsCascade) {
      events = await pb.collections.update(events.id, {
        createRule: AUTHED,
        deleteRule: AUTHED,
        fields: next,
      })
      console.log('Updated booking_events: authenticated delete, cascade on booking')
    }
  }

  // Optional person + booking on deliveries
  const deliveries = await getCollection(pb, 'deliveries')
  if (deliveries && people && bookings) {
    const fields = (deliveries.fields ?? []) as Array<{ name?: string; id?: string }>
    const hasPerson = fields.some((f) => f.name === 'person')
    const hasBooking = fields.some((f) => f.name === 'booking')
    const hasNotes = fields.some((f) => f.name === 'studio_notes')
    if (!hasPerson || !hasBooking || !hasNotes) {
      const next = [...fields]
      if (!hasPerson) {
        next.push({
          name: 'person',
          type: 'relation',
          collectionId: people.id,
          maxSelect: 1,
        } as never)
      }
      if (!hasBooking) {
        next.push({
          name: 'booking',
          type: 'relation',
          collectionId: bookings.id,
          maxSelect: 1,
        } as never)
      }
      if (!hasNotes) {
        next.push({ name: 'studio_notes', type: 'text', max: 8000 } as never)
      }
      await pb.collections.update(deliveries.id, { fields: next })
      console.log('Updated deliveries with person/booking/studio_notes')
    }
  }

  console.log('Booking ops schema ready.')
}

function defaultNoticeChannelsSeed(awayEmailOn = true) {
  const inbound = { email: awayEmailOn, inApp: true, mobile: false }
  return {
    booking: { ...inbound },
    message: { ...inbound },
    feedback: { ...inbound },
  }
}

export async function ensureStudioOpsSchema(pb: PocketBase) {
  const AUTHED = '@request.auth.id != ""'

  const users = await getCollection(pb, 'users')
  if (users) {
    await ensureFields(pb, users, [
      { name: 'last_seen_at', type: 'date' },
      {
        name: 'avatar',
        type: 'file',
        maxSelect: 1,
        maxSize: 5_000_000,
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      },
    ])
    await pb.collections.update(users.id, { createRule: null })
  }

  const deliveries = await getCollection(pb, 'deliveries')
  if (deliveries) {
    await ensureFields(pb, deliveries, [
      { name: 'downloaded_at', type: 'date' },
      { name: 'expiry_mail_sent_at', type: 'date' },
    ])
  }

  let notices = await getCollection(pb, 'notification_settings')
  if (!notices) {
    notices = await pb.collections.create({
      name: 'notification_settings',
      type: 'base',
      listRule: AUTHED,
      viewRule: AUTHED,
      createRule: AUTHED,
      updateRule: AUTHED,
      deleteRule: AUTHED,
      fields: [
        { name: 'key', type: 'text', required: true, min: 1, max: 40 },
        { name: 'notify_email', type: 'text', max: 120 },
        { name: 'photographer_away', type: 'bool' },
        { name: 'client_gallery', type: 'bool' },
        { name: 'client_downloaded', type: 'bool' },
        { name: 'client_expiring', type: 'bool' },
        { name: 'channels', type: 'json' },
        { name: 'last_send_error', type: 'text', max: 500 },
        { name: 'last_sent_at', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_notification_settings_key ON notification_settings (key)'],
    })
    console.log('Created collection: notification_settings')
  } else {
    const namesBefore = new Set(
      ((notices.fields ?? []) as Array<{ name?: string }>).map((f) => f.name),
    )
    await ensureFields(pb, notices, [
      { name: 'notify_email', type: 'text', max: 120 },
      { name: 'photographer_away', type: 'bool' },
      { name: 'client_gallery', type: 'bool' },
      { name: 'client_downloaded', type: 'bool' },
      { name: 'client_expiring', type: 'bool' },
      { name: 'channels', type: 'json' },
      { name: 'last_send_error', type: 'text', max: 500 },
      { name: 'last_sent_at', type: 'date' },
    ])
    if (!namesBefore.has('client_downloaded') || !namesBefore.has('channels')) {
      const list = await pb.collection('notification_settings').getList(1, 1, {
        filter: 'key="notifications"',
      })
      if (list.items[0]) {
        const row = list.items[0] as { photographer_away?: boolean }
        await pb.collection('notification_settings').update(list.items[0].id, {
          client_downloaded: true,
          client_expiring: true,
          channels: list.items[0].channels ?? defaultNoticeChannelsSeed(row.photographer_away !== false),
        })
        console.log('Applied factory notice defaults after new fields')
      }
    }
  }

  const existing = await pb.collection('notification_settings').getList(1, 1, {
    filter: 'key="notifications"',
  })
  const seedEmail = process.env.SEED_EMAIL ?? ''
  if (!existing.items[0]) {
    await pb.collection('notification_settings').create({
      key: 'notifications',
      notify_email: seedEmail,
      photographer_away: true,
      client_gallery: true,
      client_downloaded: true,
      client_expiring: true,
      channels: defaultNoticeChannelsSeed(true),
      last_send_error: '',
    })
    console.log('Seeded notification_settings singleton')
  } else {
    const row = existing.items[0] as {
      id: string
      photographer_away?: boolean
      client_gallery?: boolean
      client_downloaded?: boolean
      client_expiring?: boolean
      channels?: { booking?: { email?: boolean }; feedback?: { email?: boolean }; upload?: { email?: boolean } }
      notify_email?: string
    }
    const patch: Record<string, unknown> = {}
    if (row.channels == null || row.channels === '') {
      patch.channels = defaultNoticeChannelsSeed(row.photographer_away !== false)
      patch.client_downloaded = true
      patch.client_expiring = true
    }
    if (row.client_gallery == null) patch.client_gallery = true
    if (!row.notify_email && seedEmail) patch.notify_email = seedEmail
    if (Object.keys(patch).length) {
      await pb.collection('notification_settings').update(row.id, patch)
      console.log('Migrated notification_settings singleton')
    }
  }

  if (users) {
    const existingPushes = await getCollection(pb, 'push_subscriptions')
    if (!existingPushes) {
      await pb.collections.create({
        name: 'push_subscriptions',
        type: 'base',
        listRule: `${AUTHED} && user = @request.auth.id`,
        viewRule: `${AUTHED} && user = @request.auth.id`,
        createRule: `${AUTHED} && user = @request.auth.id`,
        updateRule: `${AUTHED} && user = @request.auth.id`,
        deleteRule: `${AUTHED} && user = @request.auth.id`,
        fields: [
          { name: 'user', type: 'relation', collectionId: users.id, maxSelect: 1, required: true },
          { name: 'endpoint', type: 'text', required: true, max: 2000 },
          { name: 'p256dh', type: 'text', max: 200 },
          { name: 'auth', type: 'text', max: 200 },
          { name: 'device_secret', type: 'text', required: true, min: 16, max: 80 },
          { name: 'pending', type: 'json' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_push_subscriptions_secret ON push_subscriptions (device_secret)',
          'CREATE UNIQUE INDEX idx_push_subscriptions_endpoint ON push_subscriptions (endpoint)',
        ],
      })
      console.log('Created collection: push_subscriptions')
    }
  }

  let assistant = await getCollection(pb, 'assistant_thread')
  if (!assistant) {
    assistant = await pb.collections.create({
      name: 'assistant_thread',
      type: 'base',
      listRule: AUTHED,
      viewRule: AUTHED,
      createRule: AUTHED,
      updateRule: AUTHED,
      deleteRule: AUTHED,
      fields: [
        { name: 'key', type: 'text', required: true, min: 1, max: 40 },
        { name: 'messages', type: 'json' },
        { name: 'model_messages', type: 'json' },
        { name: 'summary', type: 'text', max: 8000 },
        { name: 'in_flight', type: 'bool' },
        { name: 'in_flight_at', type: 'date' },
        { name: 'credit_warned_at', type: 'date' },
        { name: 'credit_empty', type: 'bool' },
        { name: 'picker_token', type: 'text', max: 80 },
        { name: 'flight_token', type: 'text', max: 80 },
        { name: 'meta', type: 'json' },
        { name: 'memory', type: 'text', max: 8000 },
        { name: 'assistant_name', type: 'text', max: 64 },
        {
          name: 'assistant_avatar',
          type: 'file',
          maxSelect: 1,
          maxSize: 5_000_000,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          thumbs: ['200x200'],
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_assistant_thread_key ON assistant_thread (key)'],
    })
    console.log('Created collection: assistant_thread')
  } else {
    await ensureFields(pb, assistant, [
      { name: 'messages', type: 'json' },
      { name: 'model_messages', type: 'json' },
      { name: 'summary', type: 'text', max: 8000 },
      { name: 'in_flight', type: 'bool' },
      { name: 'in_flight_at', type: 'date' },
      { name: 'credit_warned_at', type: 'date' },
      { name: 'credit_empty', type: 'bool' },
      { name: 'picker_token', type: 'text', max: 80 },
      { name: 'flight_token', type: 'text', max: 80 },
      { name: 'meta', type: 'json' },
      { name: 'memory', type: 'text', max: 8000 },
      { name: 'assistant_name', type: 'text', max: 64 },
      {
        name: 'assistant_avatar',
        type: 'file',
        maxSelect: 1,
        maxSize: 5_000_000,
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        thumbs: ['200x200'],
      },
    ])
  }

  const assistantRow = await pb.collection('assistant_thread').getList(1, 1, {
    filter: 'key="studio"',
  })
  if (!assistantRow.items[0]) {
    await pb.collection('assistant_thread').create({
      key: 'studio',
      messages: [],
      model_messages: [],
      summary: '',
      in_flight: false,
      credit_empty: false,
      picker_token: '',
      meta: [],
    })
    console.log('Seeded assistant_thread singleton')
  }

  console.log('Studio ops schema ready.')
}

