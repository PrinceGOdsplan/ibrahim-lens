/**
 * Deletes leftover Picsum `demo_portrait` files from production and pulls
 * their IDs out of Home / Work relations.
 */
import { config } from 'dotenv'
import PocketBase, { type RecordModel } from 'pocketbase'

config({ path: '.env.prod.local' })

const PROD = 'https://ibrahimlens.com.ng'

type Media = RecordModel & { file: string }
type Work = RecordModel & { cover: string; images: string[] }
type Globals = RecordModel & {
  home_featured?: string[]
  atmosphere_ids?: string[]
  home_work?: string[]
  home_lanes?: { image?: string }[] | string
}

function ids(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : []
}

async function main() {
  const pb = new PocketBase(PROD)
  pb.autoCancellation(false)
  await pb.collection('_superusers').authWithPassword(
    process.env.PB_ADMIN_EMAIL!,
    process.env.PB_ADMIN_PASSWORD!,
  )

  const media = (await pb.collection('media').getFullList()) as Media[]
  const drop = new Set(
    media.filter((row) => /demo_portrait/i.test(row.file) || /demo-portrait/i.test(row.file)).map((row) => row.id),
  )
  console.log(`demo_portrait records: ${drop.size}`)
  if (!drop.size) return

  const keep = (list: unknown) => ids(list).filter((id) => !drop.has(id))

  const globals = (await pb.collection('website_globals').getFirstListItem('key="site"')) as Globals
  let lanes = globals.home_lanes
  if (typeof lanes === 'string') {
    try {
      lanes = JSON.parse(lanes)
    } catch {
      lanes = []
    }
  }
  const nextLanes = Array.isArray(lanes)
    ? lanes.map((lane) => {
        if (!lane || typeof lane !== 'object') return lane
        const image = (lane as { image?: string }).image
        if (image && drop.has(image)) return { ...lane, image: '' }
        return lane
      })
    : lanes

  await pb.collection('website_globals').update(globals.id, {
    home_featured: keep(globals.home_featured),
    atmosphere_ids: keep(globals.atmosphere_ids),
    home_work: keep(globals.home_work),
    home_lanes: nextLanes,
  })

  const works = (await pb.collection('work_projects').getFullList()) as Work[]
  for (const work of works) {
    const images = keep(work.images)
    let cover = drop.has(work.cover) ? '' : work.cover
    if (cover && !images.includes(cover) && images[0]) cover = images[0]
    await pb.collection('work_projects').update(work.id, { images, cover })
  }

  for (const id of drop) {
    await pb.collection('media').delete(id)
    console.log(`  deleted ${id}`)
  }
  console.log('Done.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
