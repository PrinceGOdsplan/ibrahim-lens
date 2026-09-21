/**
 * Removes template demo photos, Work, and testimonials from production.
 * Keeps Studio accounts, tags, FAQ, SEO, and contact/booking copy.
 *
 * Usage: npx tsx scripts/clear-demo.ts
 */
import { config } from 'dotenv'
import PocketBase from 'pocketbase'

config({ path: '.env.prod.local' })

async function deleteAll(pb: PocketBase, collection: string) {
  const rows = await pb.collection(collection).getFullList()
  for (const row of rows) {
    await pb.collection(collection).delete(row.id)
  }
  console.log(`  ${collection}: deleted ${rows.length}`)
}

async function main() {
  const pbUrl = process.env.VITE_POCKETBASE_URL?.trim() || 'https://ibrahimlens.com.ng'
  const email = process.env.PB_ADMIN_EMAIL
  const password = process.env.PB_ADMIN_PASSWORD
  if (!email || !password) throw new Error('Missing PB_ADMIN_EMAIL / PB_ADMIN_PASSWORD')

  const pb = new PocketBase(pbUrl)
  pb.autoCancellation(false)
  await pb.collection('_superusers').authWithPassword(email, password)
  console.log(`Clearing demo content on ${pbUrl}`)

  for (const collection of ['work_projects', 'albums', 'testimonials', 'media']) {
    try {
      await deleteAll(pb, collection)
    } catch (error) {
      console.warn(`  skip ${collection}:`, String(error))
    }
  }

  const globals = await pb.collection('website_globals').getList(1, 1, { filter: 'key="site"' })
  if (globals.items[0]) {
    await pb.collection('website_globals').update(globals.items[0].id, {
      home_featured: [],
      atmosphere_ids: [],
      home_work: [],
    })
    console.log('  website_globals: cleared featured / atmosphere / home Work')
  }

  console.log('Done. Public pages will be empty until Ibrahim uploads real photos.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
