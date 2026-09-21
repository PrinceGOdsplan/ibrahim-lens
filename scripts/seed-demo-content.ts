/**
 * Fills sample website + Portfolio/Work so the public site looks complete.
 * Idempotent: skips sections that already have content unless SEED_DEMO_FORCE=1.
 * With FORCE=1, refreshes copy, packages, testimonials, FAQ, SEO, featured, and Work.
 * Prefers local Instagram stills in scripts/seed-assets/instagram/ when present (seed/dev only).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type PocketBase from 'pocketbase'

const FORCE = process.env.SEED_DEMO_FORCE === '1'
const IG_SOFT_CAP = Math.max(1, Number(process.env.IG_SEED_MAX || 40))
const IG_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'seed-assets', 'instagram')

const DEMO_IMAGES: { seed: number; file: string; caption: string }[] = [
  { seed: 11, file: 'demo-lifestyle-1.jpg', caption: 'Lifestyle presence' },
  { seed: 22, file: 'demo-portrait-1.jpg', caption: 'Studio portrait' },
  { seed: 33, file: 'demo-fashion-1.jpg', caption: 'Lookbook frame' },
  { seed: 44, file: 'demo-lifestyle-2.jpg', caption: 'Night energy' },
  { seed: 55, file: 'demo-portrait-2.jpg', caption: 'Milestone session' },
  { seed: 66, file: 'demo-fashion-2.jpg', caption: 'Campaign light' },
  { seed: 77, file: 'demo-lifestyle-3.jpg', caption: 'Culture frame' },
  { seed: 88, file: 'demo-portrait-3.jpg', caption: 'Personal brand' },
  { seed: 99, file: 'demo-fashion-3.jpg', caption: 'Brand story' },
  { seed: 111, file: 'demo-lifestyle-4.jpg', caption: 'Across Nigeria' },
  { seed: 122, file: 'demo-portrait-4.jpg', caption: 'Attitude portrait' },
  { seed: 133, file: 'demo-fashion-4.jpg', caption: 'Editorial colour' },
]

const IMAGE_RE = /\.(jpe?g|png|webp)$/i

function listIgStills() {
  if (!fs.existsSync(IG_DIR)) return [] as { abs: string; file: string }[]
  return fs
    .readdirSync(IG_DIR)
    .filter((f) => IMAGE_RE.test(f))
    .sort()
    .slice(0, IG_SOFT_CAP)
    .map((file) => ({ abs: path.join(IG_DIR, file), file }))
}

async function count(pb: PocketBase, collection: string) {
  const list = await pb.collection(collection).getList(1, 1)
  return list.totalItems
}

async function fetchDemoImage(seed: number, filename: string) {
  const url = `https://picsum.photos/seed/ibrahim-lens-${seed}/1600/1200`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download demo image (${res.status})`)
  const bytes = Buffer.from(await res.arrayBuffer())
  return new File([bytes], filename, { type: 'image/jpeg' })
}

function fileFromDisk(abs: string, filename: string) {
  const bytes = fs.readFileSync(abs)
  const ext = path.extname(filename).toLowerCase()
  const type = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
  return new File([bytes], filename, { type })
}

async function upsertByFilter(
  pb: PocketBase,
  collection: string,
  filter: string,
  payload: Record<string, unknown>,
  label: string,
) {
  const existing = await pb.collection(collection).getFullList({ filter })
  if (existing[0]) {
    await pb.collection(collection).update(existing[0].id, payload)
    console.log(`  ${label} (updated)`)
    return existing[0].id
  }
  const created = await pb.collection(collection).create(payload)
  console.log(`  ${label}`)
  return created.id
}

export async function seedDemoContent(pb: PocketBase) {
  console.log('Seeding template / demo content…')

  // --- Demo Portfolio images ---
  const mediaCount = await count(pb, 'media')
  const mediaIds: string[] = []
  const igStills = listIgStills()

  if (FORCE && igStills.length) {
    console.log(`  media: preferring ${igStills.length} local Instagram still(s) from seed-assets`)
    const existingPortfolio = await pb.collection('media').getFullList({
      filter: 'in_portfolio = true',
    })
    for (const row of existingPortfolio) {
      try {
        await pb.collection('media').update(row.id, { in_portfolio: false })
      } catch {
        /* ignore */
      }
    }
    let artistId: string | null = null
    for (const [i, item] of igStills.entries()) {
      try {
        const isArtist = item.file.toLowerCase() === 'ig-004.jpg'
        const file = fileFromDisk(item.abs, item.file)
        const form = new FormData()
        form.append('file', file)
        form.append('caption', isArtist ? 'Artist' : `Frame ${i + 1}`)
        form.append('vault', 'gallery')
        form.append('in_portfolio', 'true')
        form.append('portfolio_sort', String(isArtist ? 5 : (i + 1) * 10))
        if (isArtist) form.append('is_artist_portrait', 'true')
        const record = await pb.collection('media').create(form)
        mediaIds.push(record.id)
        if (isArtist) artistId = record.id
        console.log(`  media: ${item.file}${isArtist ? ' (artist)' : ''}`)
      } catch (error) {
        console.warn(`  media skip (${item.file}):`, String(error))
      }
    }
    if (artistId) {
      // Keep artist first in list for About / home tease lookups via caption
      mediaIds.sort((a, b) => (a === artistId ? -1 : b === artistId ? 1 : 0))
    }
    if (!mediaIds.length) {
      console.warn('  media: Instagram assets present but none uploaded — falling back')
    }
  }

  if (!mediaIds.length && (FORCE || mediaCount < 8)) {
    if (FORCE && !igStills.length) {
      console.warn('  media: no Instagram seed-assets found — using Picsum placeholders (run npm run seed:ig first)')
    }
    const existing = await pb.collection('media').getFullList({
      filter: 'in_portfolio = true',
      sort: 'portfolio_sort',
    })
    mediaIds.push(...existing.map((m) => m.id))

    const target = DEMO_IMAGES.length
    for (const [i, item] of DEMO_IMAGES.entries()) {
      if (mediaIds.length >= target) break
      try {
        const file = await fetchDemoImage(item.seed, item.file)
        const form = new FormData()
        form.append('file', file)
        form.append('caption', item.caption)
        form.append('vault', 'gallery')
        form.append('in_portfolio', 'true')
        form.append('portfolio_sort', String((i + 1) * 10))
        const record = await pb.collection('media').create(form)
        mediaIds.push(record.id)
        console.log(`  media: ${item.file}`)
      } catch (error) {
        console.warn(`  media skip (${item.file}):`, String(error))
      }
    }
  }

  if (!mediaIds.length) {
    const existing = await pb.collection('media').getFullList({
      filter: 'in_portfolio = true',
      sort: 'portfolio_sort',
    })
    mediaIds.push(...existing.map((m) => m.id))
    console.log(`  media: using ${mediaIds.length} existing Portfolio image(s)`)
  }

  // --- Tags ---
  for (const name of ['Portraits', 'Fashion', 'Lifestyle']) {
    try {
      await upsertByFilter(pb, 'portfolio_tags', `name="${name}"`, { name }, `tag: ${name}`)
    } catch {
      /* unique race */
    }
  }

  // --- Globals ---
  const globalsList = await pb.collection('website_globals').getList(1, 1, { filter: 'key="site"' })
  const globals =
    globalsList.items[0] ??
    (await pb.collection('website_globals').create({
      key: 'site',
      home_featured: [],
      contact_fields: [],
      booking_questions: [],
    }))

  const aboutEmpty = !String(globals.about_body ?? '').trim()
  const featuredEmpty = !(globals.home_featured as string[] | undefined)?.length
  const oldCopy = String(globals.home_tagline ?? '').includes('Quiet luxury')

  if (FORCE || aboutEmpty || featuredEmpty || oldCopy) {
    // Hero / featured: skip Artist portrait; pick a spread across the set
    let artistRecordId: string | null = null
    try {
      const artistRows = await pb.collection('media').getFullList({ filter: 'caption="Artist" && in_portfolio=true' })
      artistRecordId = artistRows[0]?.id ?? null
    } catch {
      /* ignore */
    }
    const forHero = mediaIds.filter((id) => id !== artistRecordId)
    const featured: string[] = []
    const step = Math.max(1, Math.floor(forHero.length / 6))
    for (let i = 0; i < forHero.length && featured.length < 6; i += step) {
      featured.push(forHero[i]!)
    }
    while (featured.length < Math.min(6, forHero.length)) {
      const next = forHero.find((id) => !featured.includes(id))
      if (!next) break
      featured.push(next)
    }

    await pb.collection('website_globals').update(globals.id, {
      home_tagline: 'Portraits & fashion — shooting across Nigeria.',
      home_featured: featured,
      about_body: [
        'Ibrahim Lens is a Nigerian photographer booked for portraits and fashion brand work.',
        '',
        'Lifestyle and celebrity frames sit alongside that core — culture, attitude, and images with presence. Sessions travel across Nigeria when the shoot calls for it.',
        '',
        'Browse the portfolio and Work, then book a session. WhatsApp is available if you prefer a direct chat.',
      ].join('\n'),
      contact_email: 'hello@ibrahimlens.ng',
      contact_phone: '+234 906 712 1929',
      contact_location: 'Based in Nigeria · Available nationwide',
      social_instagram: 'ibra.himlens',
      booking_questions: [
        {
          id: 'session_type',
          label: 'What kind of session?',
          type: 'choice',
          required: true,
          options: ['Portrait', 'Fashion brand', 'Lifestyle', 'Other'],
        },
        { id: 'people', label: 'Approx. how many people?', type: 'text', required: false },
        { id: 'location', label: 'Preferred city / location in Nigeria?', type: 'text', required: false },
        { id: 'notes', label: 'Anything we should know?', type: 'textarea', required: false },
      ],
      booking_calendar_enabled: true,
      booking_help_text:
        'Pick any preferred date and time — this is a request. Prefer WhatsApp? Use the link on this page.',
    })
    const heroCaptions = [
      'Less talk. More visuals.',
      'Portraits & fashion — shooting across Nigeria.',
      'Street style, real motion.',
      'Visuals brands can actually feel.',
      'Available for shoots across Nigeria.',
      'Clean light. Strong attitude.',
    ]
    for (const [i, caption] of heroCaptions.entries()) {
      const id = featured[i]
      if (!id) break
      try {
        await pb.collection('media').update(id, { caption })
      } catch {
        /* ignore */
      }
    }
    // Restore artist caption if hero caption overwrite hit it (shouldn't)
    if (artistRecordId) {
      try {
        await pb.collection('media').update(artistRecordId, { caption: 'Artist', is_artist_portrait: true })
      } catch {
        /* ignore */
      }
    }
    console.log('  website_globals: portraits/fashion identity + featured + contact')
  }

  // Service packages removed — Soft night Home uses lanes/Work picks, not a packages teaser
  // (see openspec/changes/studio-website-cms). The service_packages collection itself is
  // deleted by ensure-schema.ts, so nothing seeds here anymore.

  // --- Testimonials ---
  if (FORCE || (await count(pb, 'testimonials')) === 0) {
    if (FORCE) {
      const all = await pb.collection('testimonials').getFullList()
      for (const row of all) await pb.collection('testimonials').delete(row.id)
    }
    const items = [
      {
        quote:
          'Our birthday portraits had presence without feeling stiff — the gallery made everyone look like themselves at their best.',
        author_name: 'Chioma A.',
        author_role: 'Portrait client · Lekki',
        published: true,
        sort: 1,
      },
      {
        quote: 'He got the attitude right on set. Strong frames, clear direction, no soft brochure energy.',
        author_name: 'Tunde O.',
        author_role: 'Personal brand · Victoria Island',
        published: true,
        sort: 2,
      },
      {
        quote: 'Clean fashion frames that worked for Instagram and our lookbook. Fast turnaround, clear direction.',
        author_name: 'Adaeze K.',
        author_role: 'Brand lead · Fashion label',
        published: true,
        sort: 3,
      },
      {
        quote: 'From the first frame to delivery, everything felt intentional. We’ll book again for our next campaign.',
        author_name: 'Ifeanyi M.',
        author_role: 'Founder · Fashion brand',
        published: true,
        sort: 4,
      },
      {
        quote: 'Portraits that finally look like me online — bold light, no awkward posing marathon.',
        author_name: 'Ngozi E.',
        author_role: 'Personal brand · Yaba',
        published: true,
        sort: 5,
      },
      {
        quote: 'Lifestyle frames with real culture energy — the kind of images people stop scrolling for.',
        author_name: 'Sola & Kemi',
        author_role: 'Lifestyle clients · Abuja',
        published: true,
        sort: 6,
      },
    ]
    for (const item of items) {
      await upsertByFilter(
        pb,
        'testimonials',
        `author_name="${item.author_name.replaceAll('"', '\\"')}"`,
        item,
        `testimonial: ${item.author_name}`,
      )
    }
  }

  // --- FAQ ---
  if (FORCE || (await count(pb, 'faq_items')) === 0) {
    if (FORCE) {
      const all = await pb.collection('faq_items').getFullList()
      for (const row of all) await pb.collection('faq_items').delete(row.id)
    }
    const items = [
      {
        question: 'How do I book?',
        answer:
          'Send a booking request with your preferred date and time, or WhatsApp directly. We’ll confirm on your +234 number.',
        sort: 1,
      },
      {
        question: 'Where do you shoot?',
        answer: 'Across Nigeria — Lagos and beyond when the shoot calls for it.',
        sort: 2,
      },
      {
        question: 'How long until I receive photos?',
        answer: 'Most portrait and fashion galleries are ready within 10–21 days, depending on volume.',
        sort: 3,
      },
      {
        question: 'Do you shoot fashion brands?',
        answer: 'Yes — lookbooks, campaigns, and brand work. Portraits and fashion are the core bookings. See Work.',
        sort: 4,
      },
    ]
    for (const item of items) {
      await upsertByFilter(
        pb,
        'faq_items',
        `question="${item.question.replaceAll('"', '\\"')}"`,
        item,
        `faq: ${item.question}`,
      )
    }
  }

  // --- SEO ---
  const seoPages = [
    {
      page_key: 'home',
      title: 'Ibrahim Lens · Portraits & Fashion',
      description: 'Portraits and fashion brand photography across Nigeria. Lifestyle and culture frames.',
    },
    {
      page_key: 'about',
      title: 'About · Ibrahim Lens',
      description: 'Nigerian photographer booked for portraits and fashion brands. Shoots across Nigeria.',
    },
    {
      page_key: 'portfolio',
      title: 'Portfolio · Ibrahim Lens',
      description: 'Selected frames — portraits, fashion, and lifestyle.',
    },
    {
      page_key: 'work',
      title: 'Work · Ibrahim Lens',
      description: 'Fashion and portrait project stories.',
    },
    {
      page_key: 'contact',
      title: 'Book · Ibrahim Lens',
      description: 'Book a portrait or fashion session. Available across Nigeria.',
    },
  ]
  for (const page of seoPages) {
    const existing = await pb.collection('seo_meta').getList(1, 1, {
      filter: `page_key="${page.page_key}"`,
    })
    if (FORCE || !existing.items[0]) {
      if (existing.items[0]) await pb.collection('seo_meta').update(existing.items[0].id, page)
      else await pb.collection('seo_meta').create(page)
      console.log(`  seo: ${page.page_key}`)
    }
  }

  // --- Work projects (3 public) — spread seed stills across projects ---
  if (mediaIds.length >= 3) {
    let artistRecordId: string | null = null
    try {
      const artistRows = await pb.collection('media').getFullList({ filter: 'caption="Artist" && in_portfolio=true' })
      artistRecordId = artistRows[0]?.id ?? null
    } catch {
      /* ignore */
    }
    const pool = mediaIds.filter((id) => id !== artistRecordId)
    const n = pool.length
    const a = Math.max(4, Math.ceil(n / 3))
    const b = Math.max(4, Math.ceil((n - a) / 2))
    const chunks = [
      {
        title: 'Atelier Night — brand lookbook',
        slug: 'atelier-night-lookbook',
        description:
          'Fashion brand lookbook — colour, attitude, and frames built for campaign and social use.',
        images: pool.slice(0, a),
        cover: pool[1] ?? pool[0],
        sort: 1,
      },
      {
        title: 'Chioma at 30',
        slug: 'chioma-at-30',
        description: 'Portrait session — presence, milestone energy, gallery-ready selects.',
        images: pool.slice(a, a + b),
        cover: pool[a] ?? pool[0],
        sort: 2,
      },
      {
        title: 'Night energy — lifestyle set',
        slug: 'night-energy-lifestyle',
        description:
          'Lifestyle and culture frames — attitude, atmosphere, and images that carry presence.',
        images: pool.slice(a + b),
        cover: pool[a + b] ?? pool[0],
        sort: 3,
      },
    ]

    for (const work of chunks) {
      if (!work.images.length) continue
      await upsertByFilter(
        pb,
        'work_projects',
        `slug="${work.slug}"`,
        { ...work, show_on_website: true },
        `work: ${work.title} (${work.images.length} frames)`,
      )
    }

    // Retire old sample slugs if present
    for (const slug of ['golden-hour-walk', 'island-celebration']) {
      const legacy = await pb.collection('work_projects').getFullList({ filter: `slug="${slug}"` })
      if (legacy[0] && FORCE) {
        await pb.collection('work_projects').update(legacy[0].id, { show_on_website: false })
        console.log(`  work: ${slug} hidden`)
      }
    }
  }

  console.log('Template content ready. Open the public site to preview.')
}
