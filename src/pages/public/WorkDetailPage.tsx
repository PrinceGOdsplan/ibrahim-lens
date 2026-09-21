import { useCallback, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ImageImmersive } from '@/components/public/ImageImmersive'
import { PublicBreadcrumbs } from '@/components/public/PublicBreadcrumbs'
import { LoadingAnnouncement, Skeleton, SkeletonText } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/format'
import { getPublicWorkBySlug, listPublicWork, mediaImageSources, type MediaRecord, type WorkRecord } from '@/lib/library'
import { useAsyncData } from '@/lib/useAsyncData'
import { usePageSeo } from '@/lib/usePageSeo'

export function WorkDetailPage() {
  const { slug } = useParams()
  const [immersiveIndex, setImmersiveIndex] = useState<number | null>(null)

  const loader = useCallback(async () => {
    if (!slug) throw new Error('Missing slug')
    const [work, all] = await Promise.all([getPublicWorkBySlug(slug), listPublicWork()])
    return { work, all }
  }, [slug])

  const { status, data, retry } = useAsyncData(loader, [slug])
  const work = data?.work
  usePageSeo(
    'work',
    'Work · Ibrahim Lens',
    work ? `${work.title} · Ibrahim Lens` : undefined,
    work?.description,
  )

  const images = (work?.expand?.images as MediaRecord[] | undefined) ?? []
  const next = useMemo(() => {
    const all = data?.all ?? []
    if (!work || all.length < 2) return null
    const i = all.findIndex((w) => w.id === work.id)
    if (i < 0) return all.find((w) => w.id !== work.id) ?? null
    return all[(i + 1) % all.length] ?? null
  }, [data, work])

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <PublicBreadcrumbs
        items={[
          { label: 'Work', to: '/work' },
          { label: work?.title ?? (status === 'error' ? 'Not found' : '…') },
        ]}
      />

      {status === 'loading' ? (
        <>
          <LoadingAnnouncement label="Loading project" />
          <Skeleton tone="public" className="mt-2 h-14 w-2/3 max-w-xl" />
          <SkeletonText tone="public" lines={2} className="mt-5 max-w-2xl" />
          <div className="public-masonry mt-12">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="public-masonry-item">
                <Skeleton tone="public" className="aspect-[4/5]" />
              </div>
            ))}
          </div>
        </>
      ) : null}

      {status === 'error' ? (
        <>
          <h1 className="mt-2 font-display text-5xl leading-[1.05]">Not found</h1>
          <p className="street-body mt-4">
            This Work project is not available on the website. It may be private or the link is incorrect.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link to="/work" className="tap-link inline-block border-b border-public-fg/60 pb-1 text-sm tracking-wide">
              Back to Work
            </Link>
            <button type="button" onClick={retry} className="tap-link text-sm text-public-muted underline underline-offset-4 hover:text-public-fg">
              Try again
            </button>
          </div>
        </>
      ) : null}

      {status === 'ready' && work ? (
        <>
          <h1 className="mt-2 font-display text-5xl leading-[1.05] md:text-6xl">{work.title}</h1>
          <StoryFacts work={work} />
          {work.description ? (
            <p className="street-body mt-5 max-w-2xl text-lg leading-relaxed">{work.description}</p>
          ) : null}
          {work.story_body?.trim() ? (
            <div className="street-body mt-6 max-w-2xl whitespace-pre-wrap text-base leading-relaxed">
              {work.story_body.trim()}
            </div>
          ) : null}
          <div className="public-masonry mt-12">
            {images.map((img, index) => (
              <button
                key={img.id}
                type="button"
                className="public-masonry-item block w-full overflow-hidden bg-public-fg/5"
                onClick={() => setImmersiveIndex(index)}
              >
                <img
                  {...mediaImageSources(img, 'column')}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  alt={img.caption || work.title}
                  className="h-auto w-full transition duration-500 hover:opacity-90"
                  loading={index < 6 ? 'eager' : 'lazy'}
                  decoding="async"
                />
              </button>
            ))}
          </div>
          {!images.length ? <p className="mt-10 text-public-body">No photographs in this project yet.</p> : null}

          <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-10 sm:flex-row sm:items-center sm:justify-between">
            {next ? (
              <Link to={`/work/${next.slug}`} className="tap-link text-public-fg underline-offset-4 hover:underline">
                Next story: {next.title}
              </Link>
            ) : (
              <Link to="/work" className="tap-link text-public-muted hover:text-public-fg">
                All Work
              </Link>
            )}
            <Link to="/contact#booking" className="street-cta-primary w-fit">
              Book a session
            </Link>
          </div>

          {immersiveIndex !== null ? (
            <ImageImmersive
              images={images}
              index={immersiveIndex}
              onClose={() => setImmersiveIndex(null)}
              onIndexChange={setImmersiveIndex}
              altFallback={work.title}
            />
          ) : null}
        </>
      ) : null}
    </section>
  )
}

function StoryFacts({ work }: { work: WorkRecord }) {
  const facts = [
    work.story_client?.trim() ? { label: 'Client', value: work.story_client.trim() } : null,
    work.story_location?.trim() ? { label: 'Location', value: work.story_location.trim() } : null,
    work.story_shot_at?.trim() ? { label: 'When', value: formatDate(work.story_shot_at) } : null,
  ].filter(Boolean) as { label: string; value: string }[]
  if (!facts.length) return null
  return (
    <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-public-muted">
      {facts.map((fact) => (
        <div key={fact.label}>
          <dt className="street-eyebrow">{fact.label}</dt>
          <dd className="mt-1 text-public-body">{fact.value}</dd>
        </div>
      ))}
    </dl>
  )
}
