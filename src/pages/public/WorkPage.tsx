import { Link } from 'react-router-dom'
import { PublicBreadcrumbs } from '@/components/public/PublicBreadcrumbs'
import { SubjectCover } from '@/components/public/SubjectCover'
import { Alert } from '@/components/ui/alert'
import { LoadingAnnouncement, Skeleton } from '@/components/ui/skeleton'
import { listPublicWork, type MediaRecord, type WorkRecord } from '@/lib/library'
import { publicErrorMessage } from '@/lib/pb-error'
import { useAsyncData } from '@/lib/useAsyncData'
import { usePageSeo } from '@/lib/usePageSeo'

function coverRecord(work: WorkRecord): MediaRecord | null {
  const expanded = work.expand?.cover as MediaRecord | MediaRecord[] | undefined
  const cover = Array.isArray(expanded) ? expanded[0] : expanded
  if (cover?.file) return cover
  const firstId = work.images?.[0]
  if (!firstId) return null
  const images = work.expand?.images as MediaRecord[] | undefined
  return images?.find((img) => img.id === firstId) ?? null
}

export function WorkPage() {
  usePageSeo('work', 'Work · Ibrahim Lens')
  const { status, data, error, retry } = useAsyncData(listPublicWork)
  const items = data ?? []

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <PublicBreadcrumbs items={[{ label: 'Work' }]} />
      <h1 className="mt-2 font-display text-5xl leading-[1.05] md:text-7xl">Work</h1>
      <p className="street-body mt-4 max-w-md text-sm">Full shoot stories — process, people, details.</p>

      {status === 'error' ? (
        <Alert variant="error" tone="public" className="mt-6" onRetry={retry}>
          {publicErrorMessage(error, 'Could not load Work.')}
        </Alert>
      ) : null}

      {status === 'loading' ? (
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <LoadingAnnouncement label="Loading work" />
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} tone="public" className="aspect-[4/5]" />
          ))}
        </div>
      ) : null}

      {status === 'ready' && items.length ? (
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((work, index) => {
            const cover = coverRecord(work)
            return (
              <Link key={work.id} to={`/work/${work.slug}`} className="group relative block overflow-hidden bg-public-fg/5">
                <div className="aspect-[4/5] overflow-hidden">
                  {cover ? (
                    <SubjectCover
                      record={cover}
                      widthKey="half"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      alt={work.title}
                      loading={index < 3 ? 'eager' : 'lazy'}
                      decoding="async"
                      className="transition duration-700 group-hover:scale-[1.03]"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                </div>
                <h2 className="absolute bottom-5 left-5 right-5 font-display text-2xl text-white sm:text-3xl">{work.title}</h2>
              </Link>
            )
          })}
        </div>
      ) : null}

      {status === 'ready' && !items.length ? (
        <p className="mt-10 text-public-body">No public Work projects yet.</p>
      ) : null}
    </section>
  )
}
