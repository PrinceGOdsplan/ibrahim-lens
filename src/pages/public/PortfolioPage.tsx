import { useMemo, useState } from 'react'
import { ImageImmersive } from '@/components/public/ImageImmersive'
import { PublicBreadcrumbs } from '@/components/public/PublicBreadcrumbs'
import { Alert } from '@/components/ui/alert'
import { LoadingAnnouncement, Skeleton } from '@/components/ui/skeleton'
import {
  groupTagsForFilter,
  listPublicPortfolio,
  listTags,
  mediaImageSources,
  type MediaRecord,
} from '@/lib/library'
import { publicErrorMessage } from '@/lib/pb-error'
import { useAsyncData } from '@/lib/useAsyncData'
import { usePageSeo } from '@/lib/usePageSeo'
import { cn } from '@/lib/utils'

const loadPortfolio = () =>
  Promise.all([listPublicPortfolio(), listTags()]).then(([media, tagList]) => ({ media, tagList }))

export function PortfolioPage() {
  usePageSeo('portfolio', 'Portfolio · Ibrahim Lens')
  const [activeIds, setActiveIds] = useState<string[] | null>(null)
  const [immersiveIndex, setImmersiveIndex] = useState<number | null>(null)
  const { status, data, error, retry } = useAsyncData(loadPortfolio)

  const filters = groupTagsForFilter(data?.tagList ?? [])

  const visible = useMemo<MediaRecord[]>(() => {
    const media = data?.media ?? []
    if (!activeIds) return media
    return media.filter((item) => (item.tags ?? []).some((id) => activeIds.includes(id)))
  }, [data, activeIds])

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <PublicBreadcrumbs items={[{ label: 'Portfolio' }]} />
      <p className="street-eyebrow">Portfolio</p>
      <h1 className="mt-2 font-display text-5xl leading-[1.05] md:text-7xl">Selected frames</h1>
      <p className="street-body mt-4 max-w-md text-sm">Portraits, fashion, lifestyle — curated frames.</p>

      {status === 'error' ? (
        <Alert variant="error" tone="public" className="mt-6" onRetry={retry}>
          {publicErrorMessage(error, 'Could not load the portfolio.')}
        </Alert>
      ) : null}

      {filters.length ? (
        <div className="mt-10 flex flex-wrap gap-2" role="toolbar" aria-label="Filter by tag">
          <button
            type="button"
            aria-pressed={!activeIds}
            className={cn(
              'tap-target rounded-full border px-4 text-sm',
              !activeIds
                ? 'border-public-fg bg-public-fg text-public-bg'
                : 'border-public-fg/25 text-public-muted hover:border-public-fg/50 hover:text-public-fg',
            )}
            onClick={() => setActiveIds(null)}
          >
            All
          </button>
          {filters.map((tag) => {
            const on = Boolean(activeIds?.some((id) => tag.ids.includes(id)))
            return (
              <button
                key={tag.id}
                type="button"
                aria-pressed={on}
                className={cn(
                  'tap-target rounded-full border px-4 text-sm',
                  on
                    ? 'border-public-fg bg-public-fg text-public-bg'
                    : 'border-public-fg/25 text-public-muted hover:border-public-fg/50 hover:text-public-fg',
                )}
                onClick={() => setActiveIds(tag.ids)}
              >
                {tag.name}
              </button>
            )
          })}
        </div>
      ) : null}

      {status === 'loading' ? (
        <div className="public-masonry mt-12">
          <LoadingAnnouncement label="Loading portfolio" />
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className="public-masonry-item">
              <Skeleton tone="public" className={i % 3 === 1 ? 'aspect-[3/4]' : 'aspect-[4/5]'} />
            </div>
          ))}
        </div>
      ) : null}

      <div className="public-masonry mt-12">
        {visible.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className="public-masonry-item group block w-full overflow-hidden bg-public-fg/5 text-left"
            onClick={() => setImmersiveIndex(index)}
            aria-label={`Open ${item.caption || 'photograph'} full size`}
          >
            <img
              {...mediaImageSources(item, 'column')}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              alt={item.caption || 'Portfolio photograph'}
              className="h-auto w-full transition duration-700 group-hover:opacity-90"
              loading={index < 6 ? 'eager' : 'lazy'}
              decoding="async"
            />
          </button>
        ))}
      </div>

      {status === 'ready' && !visible.length ? (
        <p className="mt-10 text-public-body">
          {activeIds ? 'No frames match that filter yet.' : 'No Portfolio images published yet.'}
        </p>
      ) : null}

      {immersiveIndex !== null ? (
        <ImageImmersive
          images={visible}
          index={immersiveIndex}
          onClose={() => setImmersiveIndex(null)}
          onIndexChange={setImmersiveIndex}
          altFallback="Portfolio image"
        />
      ) : null}
    </section>
  )
}
