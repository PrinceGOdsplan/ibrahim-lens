/**
 * Removes volume-seed rows from a local PocketBase. Leaves curated demo intact.
 *
 *   npm run seed:volume:clear
 */
import fs from 'node:fs'
import {
  BOOKING_Q_BACKUP,
  VOL_MARK,
  WORK_SLUG_PREFIX,
  connectLocalAdmin,
  listByContains,
} from './volume-lib.ts'

async function deleteRows(label: string, rows: { id: string }[], del: (id: string) => Promise<unknown>) {
  for (const row of rows) {
    await del(row.id)
  }
  console.log(`  ${label}: deleted ${rows.length}`)
}

async function main() {
  const { pb, url } = await connectLocalAdmin()
  console.log(`Clearing volume rows on ${url}`)

  const people = await listByContains<{ id: string }>(pb, 'people', 'name', VOL_MARK)
  const personIds = new Set(people.map((row) => row.id))
  const bookings = (await pb.collection('bookings').getFullList<{ id: string; person: string; studio_notes?: string }>())
    .filter((row) => personIds.has(row.person) || String(row.studio_notes ?? '').includes(VOL_MARK))
  await deleteRows('bookings', bookings, (id) => pb.collection('bookings').delete(id))
  await deleteRows('people', people, (id) => pb.collection('people').delete(id))

  const inquiries = (await pb.collection('form_inquiries').getFullList<{ id: string; payload?: Record<string, unknown> }>())
    .filter((row) => JSON.stringify(row.payload ?? {}).includes(VOL_MARK))
  await deleteRows('inquiries', inquiries, (id) => pb.collection('form_inquiries').delete(id))

  await deleteRows(
    'testimonials',
    await listByContains(pb, 'testimonials', 'author_name', VOL_MARK),
    (id) => pb.collection('testimonials').delete(id),
  )
  await deleteRows(
    'faq',
    await listByContains(pb, 'faq_items', 'question', VOL_MARK),
    (id) => pb.collection('faq_items').delete(id),
  )
  await deleteRows(
    'albums',
    await listByContains(pb, 'albums', 'title', VOL_MARK),
    (id) => pb.collection('albums').delete(id),
  )
  await deleteRows(
    'work',
    await listByContains(pb, 'work_projects', 'slug', WORK_SLUG_PREFIX),
    (id) => pb.collection('work_projects').delete(id),
  )
  await deleteRows(
    'media',
    await listByContains(pb, 'media', 'caption', VOL_MARK),
    (id) => pb.collection('media').delete(id),
  )
  await deleteRows(
    'tags',
    await listByContains(pb, 'portfolio_tags', 'name', VOL_MARK),
    (id) => pb.collection('portfolio_tags').delete(id),
  )

  const list = await pb.collection('website_globals').getList(1, 1, {
    filter: 'key="site"',
    skipTotal: true,
  })
  const globals = list.items[0]
  if (globals && fs.existsSync(BOOKING_Q_BACKUP)) {
    const previous = JSON.parse(fs.readFileSync(BOOKING_Q_BACKUP, 'utf8'))
    await pb.collection('website_globals').update(globals.id, { booking_questions: previous })
    console.log('  booking_questions: restored from backup')
  }

  console.log('Volume rows cleared. Curated demo should remain.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
