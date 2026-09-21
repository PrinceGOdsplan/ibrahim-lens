/**
 * Local-only volume fill so Studio pagination and crowded forms can be walked.
 * Does not run schema or curated demo seed. Run `npm run seed` first.
 *
 *   npm run seed:volume
 */
import fs from 'node:fs'
import PocketBase from 'pocketbase'
import {
  BOOKING_Q_BACKUP,
  TARGET,
  VOL_MARK,
  VOL_QUESTION_PREFIX,
  WORK_SLUG_PREFIX,
  albumTitle,
  connectLocalAdmin,
  faqQuestion,
  fileFromDisk,
  galleryCaption,
  listByContains,
  listVolumeTiles,
  pad,
  personName,
  portfolioCaption,
  tagName,
  testimonialAuthor,
  workSlug,
  workTitle,
} from './volume-lib.ts'

const STATUSES = ['pending', 'confirmed', 'completed', 'declined', 'cancelled'] as const

const VOLUME_QUESTIONS = [
  {
    id: `${VOL_QUESTION_PREFIX}q1`,
    label: 'What kind of session?',
    type: 'choice',
    required: true,
    options: ['Portrait', 'Fashion brand', 'Lifestyle', 'Other'],
  },
  {
    id: `${VOL_QUESTION_PREFIX}q2`,
    label:
      'If we are travelling across more than one city in Nigeria for this shoot, which cities and roughly how many days should we hold for travel and setup?',
    type: 'text',
    required: false,
  },
  {
    id: `${VOL_QUESTION_PREFIX}q3`,
    label: 'Anything we should know?',
    type: 'textarea',
    required: false,
  },
  {
    id: `${VOL_QUESTION_PREFIX}q4`,
    label: 'Need hair and makeup on set?',
    type: 'yesno',
    required: false,
  },
  {
    id: `${VOL_QUESTION_PREFIX}q5`,
    label: 'Preferred mood',
    type: 'choice',
    required: false,
    options: ['Soft night', 'Daylight', 'Flash', 'Mixed', 'You decide', 'Reference later'],
  },
  {
    id: `${VOL_QUESTION_PREFIX}q6`,
    label: 'Approx. how many people?',
    type: 'text',
    required: false,
  },
  {
    id: `${VOL_QUESTION_PREFIX}q7`,
    label: 'Preferred city / location in Nigeria?',
    type: 'text',
    required: false,
  },
  {
    id: `${VOL_QUESTION_PREFIX}q8`,
    label: 'Usage — lookbook, campaign, personal brand, or something else?',
    type: 'textarea',
    required: false,
  },
]

function nextFile(tiles: string[], i: number) {
  return fileFromDisk(tiles[i % tiles.length]!)
}

async function fillTags(pb: PocketBase) {
  const existing = await listByContains<{ id: string; name: string }>(pb, 'portfolio_tags', 'name', VOL_MARK)
  const have = new Set(existing.map((row) => row.name))
  const ids = existing.map((row) => row.id)
  for (let n = 1; n <= TARGET.tags; n++) {
    const name = tagName(n)
    if (have.has(name)) continue
    const created = await pb.collection('portfolio_tags').create({ name })
    ids.push(created.id)
    have.add(name)
    console.log(`  tag: ${name}`)
  }
  return ids
}

async function fillMedia(
  pb: PocketBase,
  vault: 'gallery' | 'portfolio',
  target: number,
  captionAt: (n: number) => string,
  needle: string,
  tagIds: string[],
  tiles: string[],
) {
  const existing = await listByContains<{ id: string; caption?: string }>(pb, 'media', 'caption', needle)
  const have = new Set(existing.map((row) => row.caption))
  const ids = existing.map((row) => row.id)
  let created = 0
  for (let n = 1; n <= target; n++) {
    const caption = captionAt(n)
    if (have.has(caption)) continue
    const form = new FormData()
    form.append('file', nextFile(tiles, n + created))
    form.append('caption', caption)
    form.append('vault', vault)
    form.append('in_portfolio', vault === 'portfolio' ? 'true' : 'false')
    form.append('portfolio_sort', String(n * 10))
    const tagId = tagIds.length ? tagIds[(n - 1) % tagIds.length] : null
    if (tagId) form.append('tags', tagId)
    const record = await pb.collection('media').create(form)
    ids.push(record.id)
    have.add(caption)
    created += 1
    if (created % 40 === 0) console.log(`  media ${vault}: ${created} new…`)
  }
  console.log(`  media ${vault}: ${ids.length} total (${created} new)`)
  return ids
}

async function fillAlbums(pb: PocketBase, galleryIds: string[]) {
  const existing = await listByContains<{ id: string; title: string }>(pb, 'albums', 'title', VOL_MARK)
  const have = new Set(existing.map((row) => row.title))
  for (let n = 1; n <= TARGET.albums; n++) {
    const title = albumTitle(n)
    if (have.has(title)) continue
    const images =
      n === 1 ? galleryIds.slice(0, TARGET.fatAlbumImages) : galleryIds.slice((n - 1) * 3, (n - 1) * 3 + 3)
    await pb.collection('albums').create({ title, images })
    console.log(`  album: ${title} (${images.length} frames)`)
  }
}

async function fillWork(pb: PocketBase, galleryIds: string[]) {
  const existing = await listByContains<{ id: string; slug: string }>(pb, 'work_projects', 'slug', WORK_SLUG_PREFIX)
  const have = new Set(existing.map((row) => row.slug))
  for (let n = 1; n <= TARGET.work; n++) {
    const slug = workSlug(n)
    if (have.has(slug)) continue
    const start = (n - 1) * 6
    const images = galleryIds.slice(start, start + 6)
    await pb.collection('work_projects').create({
      title: workTitle(n),
      slug,
      description: `${VOL_MARK} Sample Work story ${pad(n, 2)} — long enough to wrap in the Studio editor and on the public page.`,
      show_on_website: n <= TARGET.workPublished,
      images,
      cover: images[0] ?? undefined,
      sort: n,
    })
    console.log(`  work: ${slug}${n <= TARGET.workPublished ? ' (public)' : ''}`)
  }
}

async function fillPeople(pb: PocketBase) {
  const existing = await listByContains<{ id: string; name: string }>(pb, 'people', 'name', VOL_MARK)
  const have = new Set(existing.map((row) => row.name))
  const ids = existing.map((row) => row.id)
  for (let n = 1; n <= TARGET.people; n++) {
    const name = personName(n)
    if (have.has(name)) continue
    const national = `80000${pad(n, 5)}`
    const created = await pb.collection('people').create({
      name,
      phone_e164: `+234${national}`,
      phone_digits: national,
      email: `vol.person.${pad(n, 2)}@example.test`,
      notes: `${VOL_MARK} Volume person for list density.`,
    })
    ids.push(created.id)
    console.log(`  person: ${name}`)
  }
  return ids
}

async function fillBookings(pb: PocketBase, personIds: string[]) {
  const existing = await listByContains<{ id: string }>(pb, 'bookings', 'studio_notes', VOL_MARK)
  const need = Math.max(0, Math.min(TARGET.bookings, personIds.length) - existing.length)
  for (let i = 0; i < need; i++) {
    const n = existing.length + i + 1
    const person = personIds[(n - 1) % personIds.length]
    if (!person) break
    const day = new Date()
    day.setDate(day.getDate() + n)
    await pb.collection('bookings').create({
      person,
      status: STATUSES[(n - 1) % STATUSES.length],
      preferred_at: day.toISOString().slice(0, 16),
      answers: { note: `${VOL_MARK} answers ${pad(n, 2)}` },
      studio_notes: `${VOL_MARK} Booking ${pad(n, 2)}`,
      fee_ngn: 150_000 + n * 1000,
      amount_paid_ngn: n % 3 === 0 ? 150_000 : 0,
      source: 'manual',
    })
    console.log(`  booking: ${VOL_MARK} ${pad(n, 2)}`)
  }
}

async function fillInquiries(pb: PocketBase) {
  const existing = await pb.collection('form_inquiries').getFullList<{ id: string; payload?: Record<string, unknown> }>()
  const vol = existing.filter((row) => String(row.payload?.name ?? '').includes(VOL_MARK))
  let created = 0
  for (let n = vol.length + 1; n <= TARGET.inquiries; n++) {
    try {
      await pb.collection('form_inquiries').create({
        kind: 'contact',
        payload: {
          name: `${VOL_MARK} Writer ${pad(n, 2)}`,
          phone: `+23480000${pad(n, 5)}`,
          message: `${VOL_MARK} Write-inbox row ${pad(n, 2)} — long enough to wrap in Clients → Inbox.`,
          inbox_read: false,
        },
      })
      created += 1
      console.log(`  inquiry: ${VOL_MARK} Writer ${pad(n, 2)}`)
    } catch (error) {
      console.warn(
        `  inquiry: stopped at ${vol.length + created} of ${TARGET.inquiries} (${String(error)}). Public create is rate-limited; re-run seed:volume after that window to add more.`,
      )
      break
    }
  }
}

async function fillTestimonials(pb: PocketBase) {
  const existing = await listByContains<{ id: string; author_name: string }>(pb, 'testimonials', 'author_name', VOL_MARK)
  const have = new Set(existing.map((row) => row.author_name))
  for (let n = 1; n <= TARGET.testimonials; n++) {
    const author_name = testimonialAuthor(n)
    if (have.has(author_name)) continue
    await pb.collection('testimonials').create({
      quote: `${VOL_MARK} Quote ${pad(n, 2)} — the session felt intentional and the gallery had presence without a posing marathon.`,
      author_name,
      author_role: `Volume client · Lagos`,
      published: n % 4 !== 0,
      sort: 100 + n,
    })
    console.log(`  testimonial: ${author_name}`)
  }
}

async function fillFaq(pb: PocketBase) {
  const existing = await listByContains<{ id: string; question: string }>(pb, 'faq_items', 'question', VOL_MARK)
  const have = new Set(existing.map((row) => row.question))
  for (let n = 1; n <= TARGET.faq; n++) {
    const question = faqQuestion(n)
    if (have.has(question)) continue
    await pb.collection('faq_items').create({
      question,
      answer: `${VOL_MARK} Answer ${pad(n, 2)} — most portrait and fashion galleries are ready within 10–21 days, depending on volume.`,
      sort: 100 + n,
    })
    console.log(`  faq: ${question}`)
  }
}

function hasVolumeQuestions(questions: unknown) {
  if (!Array.isArray(questions)) return false
  const vol = questions.filter((q) => typeof q === 'object' && q && String((q as { id?: string }).id ?? '').startsWith(VOL_QUESTION_PREFIX))
  return vol.length >= TARGET.bookingQuestions
}

async function fillBookingQuestions(pb: PocketBase) {
  const list = await pb.collection('website_globals').getList(1, 1, { filter: 'key="site"' })
  const globals = list.items[0]
  if (!globals) {
    console.warn('  website_globals: missing site row — run npm run seed first')
    return
  }
  if (hasVolumeQuestions(globals.booking_questions)) {
    console.log('  booking_questions: already at volume cap')
    return
  }
  if (!fs.existsSync(BOOKING_Q_BACKUP)) {
    fs.writeFileSync(BOOKING_Q_BACKUP, JSON.stringify(globals.booking_questions ?? [], null, 2), 'utf8')
    console.log('  booking_questions: backed up previous questions')
  }
  await pb.collection('website_globals').update(globals.id, {
    booking_questions: VOLUME_QUESTIONS,
  })
  console.log(`  booking_questions: set ${VOLUME_QUESTIONS.length} vol_ questions`)
}

async function main() {
  const { pb, url } = await connectLocalAdmin()
  console.log(`Volume seed against ${url}`)
  const tiles = listVolumeTiles()
  console.log(`  tiles: ${tiles.length} local file(s)`)

  const tagIds = await fillTags(pb)
  const galleryIds = await fillMedia(pb, 'gallery', TARGET.gallery, galleryCaption, `${VOL_MARK} Gallery`, tagIds, tiles)
  await fillMedia(pb, 'portfolio', TARGET.portfolio, portfolioCaption, `${VOL_MARK} Portfolio`, tagIds, tiles)
  await fillAlbums(pb, galleryIds)
  await fillWork(pb, galleryIds)
  const personIds = await fillPeople(pb)
  await fillBookings(pb, personIds)
  await fillInquiries(pb)
  await fillTestimonials(pb)
  await fillFaq(pb)
  await fillBookingQuestions(pb)
  console.log('Volume seed ready. Walk Studio Library, Website, Clients, and /contact#booking.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
