import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Check, Globe, Images, LayoutGrid, Search } from 'lucide-react'
import { StudioFullscreenModal } from '@/components/studio/StudioFullscreenModal'
import { StudioIcon } from '@/components/studio/StudioIconButton'
import { StudioTabs } from '@/components/studio/StudioTabs'
import {
  fileStem,
  isPickPile,
  listMediaPage,
  listTags,
  mediaLabel,
  mediaThumbUrl,
  mediaVault,
  type MediaRecord,
  type TagRecord,
} from '@/lib/library'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { pbErrorMessage } from '@/lib/pb-error'

const PICKER_ROOMS: { id: 'all' | 'gallery' | 'portfolio'; label: string; icon: typeof Images }[] = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'gallery', label: 'Gallery', icon: Images },
  { id: 'portfolio', label: 'Portfolio', icon: Globe },
]

type Filter = 'all' | 'gallery' | 'portfolio' | string

type Props = {
  open: boolean
  title?: string
  /** Preloaded images; if empty/omitted, pages Gallery + Portfolio on open. */
  images?: MediaRecord[]
  tags?: TagRecord[]
  selected?: string[]
  max?: number
  portfolioOnlyDefault?: boolean
  galleryOnlyDefault?: boolean
  onClose: () => void
  onDone: (selectedIds: string[]) => void
}

function vaultFor(filter: Filter): 'pick' | 'gallery' | 'portfolio' {
  if (filter === 'portfolio') return 'portfolio'
  if (filter === 'gallery') return 'gallery'
  return 'pick'
}

function tagIdFor(filter: Filter) {
  if (filter === 'all' || filter === 'gallery' || filter === 'portfolio') return undefined
  return filter
}

/** Shared Studio image picker — pick from Gallery or Portfolio, then Done. */
export function StudioImageGallery({
  open,
  title = 'Pick photos',
  images: imagesProp,
  tags: tagsProp,
  selected: selectedProp,
  max,
  portfolioOnlyDefault,
  galleryOnlyDefault,
  onClose,
  onDone,
}: Props) {
  const [loaded, setLoaded] = useState<MediaRecord[]>([])
  const [tags, setTags] = useState<TagRecord[]>([])
  const [filter, setFilter] = useState<Filter>(galleryOnlyDefault ? 'gallery' : portfolioOnlyDefault ? 'portfolio' : 'all')
  const [selected, setSelected] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchApplied, setSearchApplied] = useState('')
  const [ready, setReady] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const pageRef = useRef(0)
  const loadingRef = useRef(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const preload = Boolean(imageKeyFrom(imagesProp))

  const selectedKey = (selectedProp ?? []).join('\0')
  const imageKey = imageKeyFrom(imagesProp)
  const tagKey = tagsProp?.map((tag) => tag.id).join('\0') ?? ''

  useEffect(() => {
    const id = window.setTimeout(() => setSearchApplied(searchQuery.trim()), 250)
    return () => window.clearTimeout(id)
  }, [searchQuery])

  const fetchPage = useCallback(
    async (reset: boolean) => {
      if (loadingRef.current) return
      loadingRef.current = true
      if (!reset) setLoadingMore(true)
      try {
        const nextPage = reset ? 1 : pageRef.current + 1
        const result = await listMediaPage({
          page: nextPage,
          vault: vaultFor(filter),
          tagId: tagIdFor(filter),
          q: searchApplied || undefined,
          sort: 'date',
        })
        pageRef.current = result.page
        setHasMore(result.hasMore)
        setLoaded((prev) => {
          if (reset) return result.items
          const seen = new Set(prev.map((item) => item.id))
          return [...prev, ...result.items.filter((item) => !seen.has(item.id))]
        })
      } catch (e) {
        if (reset) setError(pbErrorMessage(e, 'Could not load your photos.'))
      } finally {
        loadingRef.current = false
        setLoadingMore(false)
        setReady(true)
      }
    },
    [filter, searchApplied],
  )

  useEffect(() => {
    if (!open) return

    setSelected(selectedKey ? selectedKey.split('\0') : [])
    setFilter(galleryOnlyDefault ? 'gallery' : portfolioOnlyDefault ? 'portfolio' : 'all')
    setSearchQuery('')
    setSearchApplied('')
    setError(null)

    if (imageKey && imagesProp?.length) {
      setLoaded(imagesProp.filter(isPickPile))
      if (tagsProp) setTags(tagsProp)
      setHasMore(false)
      setReady(true)
      return
    }

    let cancelled = false
    setReady(false)
    setLoaded([])
    pageRef.current = 0
    setHasMore(true)
    if (!tagsProp) {
      listTags()
        .then((rows) => {
          if (!cancelled) setTags(rows)
        })
        .catch(() => undefined)
    } else {
      setTags(tagsProp)
    }

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot by id keys
  }, [open, selectedKey, imageKey, tagKey, portfolioOnlyDefault, galleryOnlyDefault])

  useEffect(() => {
    if (!open || preload) return
    pageRef.current = 0
    setLoaded([])
    setReady(false)
    void fetchPage(true)
  }, [open, preload, fetchPage])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node || !hasMore || preload) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void fetchPage(false)
      },
      { rootMargin: '80px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, fetchPage, preload, loaded.length])

  const visible = useMemo(() => {
    if (!preload) return loaded
    if (filter === 'all') return loaded
    if (filter === 'gallery') return loaded.filter((m) => mediaVault(m) === 'gallery')
    if (filter === 'portfolio') {
      return loaded.filter((m) => mediaVault(m) === 'portfolio' || m.in_portfolio)
    }
    return loaded.filter((m) => (m.tags ?? []).includes(filter))
  }, [loaded, filter, preload])

  const searchNorm = searchApplied.toLowerCase()
  const filtered = useMemo(() => {
    if (!preload || !searchNorm) return visible
    return visible.filter((item) => {
      const label = mediaLabel(item).toLowerCase()
      const file = (item.file || '').toLowerCase()
      const stem = fileStem(item.file || '').toLowerCase()
      return label.includes(searchNorm) || file.includes(searchNorm) || stem.includes(searchNorm)
    })
  }, [visible, searchNorm, preload])

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (typeof max === 'number' && prev.length >= max) return prev
      return [...prev, id]
    })
  }

  return (
    <StudioFullscreenModal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-studio-muted">
            {selected.length} selected
            {typeof max === 'number' ? ` · max ${max}` : ''}
          </p>
          <div className="flex gap-4 text-xs">
            <button type="button" className="text-studio-muted hover:text-studio-fg" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="text-studio-fg underline" onClick={() => onDone(selected)}>
              Done
            </button>
          </div>
        </div>
      }
    >
      {error ? <p className="mb-3 text-sm text-studio-danger">{error}</p> : null}
      <label className="mb-3 flex items-center gap-2 text-studio-muted">
        <StudioIcon icon={Search} className="h-3.5 w-3.5 shrink-0" />
        <span className="sr-only">Search photos</span>
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by name"
          className="min-w-0 flex-1 border-0 border-b border-studio-border/70 bg-transparent py-1 text-base text-studio-fg placeholder:text-studio-muted focus-visible:border-studio-fg focus-visible:outline-none md:text-sm"
        />
      </label>
      <div className="mb-4">
        <StudioTabs
          value={filter}
          onChange={setFilter}
          aria-label="Photo rooms"
          primary={PICKER_ROOMS}
          secondary={tags.map((tag) => ({ id: tag.id, label: tag.name }))}
        />
      </div>
      {!ready ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
          {Array.from({ length: 16 }, (_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      ) : !filtered.length ? (
        <p className="text-sm text-studio-muted">
          {searchNorm
            ? 'No photos match your search. Try another name or filter.'
            : 'No photos here yet. Upload in Gallery or Portfolio, or try another filter.'}
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
          {filtered.map((item) => {
            const on = selected.includes(item.id)
            const atMax = typeof max === 'number' && selected.length >= max && !on
            return (
              <button
                key={item.id}
                type="button"
                disabled={atMax}
                aria-pressed={on}
                aria-label={`${on ? 'Deselect' : 'Select'} ${item.caption?.trim() || 'untitled photo'}`}
                onClick={() => toggle(item.id)}
                className={cn(
                  'relative overflow-hidden rounded-md border bg-studio-panel',
                  on ? 'border-studio-accent ring-2 ring-studio-accent/40' : 'border-studio-border',
                  atMax ? 'opacity-40' : '',
                )}
              >
                <img
                  src={mediaThumbUrl(item, '200x200')}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="aspect-square w-full object-cover"
                />
                {on ? (
                  <span className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center bg-studio-panel/90 text-studio-fg">
                    <StudioIcon icon={Check} className="h-3.5 w-3.5" />
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      )}
      <div ref={sentinelRef} className="h-8" />
      {loadingMore ? <p className="py-3 text-center text-xs text-studio-muted">Loading more…</p> : null}
    </StudioFullscreenModal>
  )
}

function imageKeyFrom(images?: MediaRecord[]) {
  return images?.map((item) => item.id).join('\0') ?? ''
}
