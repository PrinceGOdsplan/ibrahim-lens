import { Check, Loader2, RefreshCw, Square, X } from 'lucide-react'
import { useEffect, useRef, type RefObject } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { StudioIcon } from '@/components/studio/StudioIconButton'
import { mediaLabel, mediaThumbUrl, type MediaRecord } from '@/lib/library'
import { cn } from '@/lib/utils'
import type { PendingPhoto } from '@/components/studio/gallery/pending'

export function ThumbWall({
  items,
  pending,
  cols,
  activeId,
  loaded,
  emptyTitle,
  hasMore,
  loadingMore,
  onOpen,
  onNearEnd,
  onAdd,
  onRetry,
  onDismissPending,
  coverId,
  selectMode,
  selectedIds,
  onToggleSelect,
  scrollRoot,
}: {
  items: MediaRecord[]
  pending: PendingPhoto[]
  cols: number
  activeId: string | null
  loaded: boolean
  emptyTitle: string
  hasMore: boolean
  loadingMore: boolean
  onOpen: (id: string) => void
  onNearEnd: () => void
  onAdd: () => void
  onRetry: (id: string) => void
  onDismissPending: (id: string) => void
  coverId?: string
  selectMode?: boolean
  selectedIds?: string[]
  onToggleSelect?: (id: string) => void
  scrollRoot?: RefObject<HTMLElement | null>
}) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = sentinelRef.current
    if (!node || !hasMore || !loaded || loadingMore) return
    const root = scrollRoot?.current ?? null
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onNearEnd()
      },
      { root, rootMargin: '160px' },
    )
    observer.observe(node)
    // 8-wide walls fit a full page on screen; the sentinel never "enters" view.
    // Fill until the scroller can actually scroll, then stop and let IO take over.
    if (root && root.scrollHeight > root.clientHeight + 120) {
      return () => observer.disconnect()
    }
    const rootBox = root?.getBoundingClientRect()
    const box = node.getBoundingClientRect()
    const bottom = (rootBox?.bottom ?? window.innerHeight) + 160
    if (box.top < bottom) onNearEnd()
    return () => observer.disconnect()
  }, [hasMore, onNearEnd, items.length, loaded, loadingMore, scrollRoot])

  if (!loaded) {
    return (
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {Array.from({ length: cols * 2 }, (_, i) => (
          <Skeleton key={i} className="aspect-square" />
        ))}
      </div>
    )
  }

  if (!items.length && !pending.length) {
    return (
      <button
        type="button"
        onClick={onAdd}
        className="flex h-48 w-full flex-col items-center justify-center border border-dashed border-studio-border px-4 text-center text-sm text-studio-muted hover:border-studio-fg/40 hover:text-studio-fg"
      >
        {emptyTitle}
      </button>
    )
  }

  return (
    <div>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {pending.map((item) => (
          <div key={item.id} className="relative aspect-square overflow-hidden bg-studio-panel">
            <img src={item.preview} alt="" className="h-full w-full object-cover opacity-70" />
            <div className="absolute inset-0 flex items-center justify-center bg-studio-fg/25">
              {item.status === 'error' ? (
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-studio-bg text-studio-fg"
                    aria-label="Try again"
                    title={item.reason || 'Could not add this photo'}
                    onClick={() => onRetry(item.id)}
                  >
                    <StudioIcon icon={RefreshCw} />
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-studio-bg text-studio-muted"
                    aria-label="Remove"
                    onClick={() => onDismissPending(item.id)}
                  >
                    <StudioIcon icon={X} />
                  </button>
                </div>
              ) : (
                <StudioIcon icon={Loader2} className="h-5 w-5 animate-spin text-studio-bg" />
              )}
            </div>
          </div>
        ))}
        {items.map((item, index) => {
          const selected = selectMode && (selectedIds?.includes(item.id) ?? false)
          return (
            <div
              key={item.id}
              className={cn(
                'relative aspect-square overflow-hidden bg-studio-panel',
                !selectMode && activeId === item.id ? 'ring-2 ring-studio-fg/40 ring-offset-1 ring-offset-studio-bg' : '',
                selectMode && selected ? 'ring-2 ring-studio-accent ring-offset-1 ring-offset-studio-bg' : '',
              )}
            >
              <button
                type="button"
                onClick={() => (selectMode ? onToggleSelect?.(item.id) : onOpen(item.id))}
                aria-label={mediaLabel(item)}
                aria-pressed={selectMode ? selected : undefined}
                aria-current={!selectMode && activeId === item.id ? true : undefined}
                className="h-full w-full"
              >
                <img
                  src={mediaThumbUrl(item, '200x200')}
                  alt=""
                  loading={index < cols ? 'eager' : 'lazy'}
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </button>
              {selectMode ? (
                <span
                  className={cn(
                    'pointer-events-none absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-sm shadow-sm',
                    selected
                      ? 'bg-studio-fg text-studio-bg'
                      : 'bg-black/55 text-white ring-1 ring-white/90',
                  )}
                >
                  <StudioIcon icon={selected ? Check : Square} className="h-4 w-4" />
                </span>
              ) : null}
              {coverId === item.id ? (
                <span className="pointer-events-none absolute bottom-1.5 left-1.5 rounded bg-studio-bg/90 px-1.5 py-0.5 text-[10px] text-studio-fg">
                  Cover
                </span>
              ) : null}
            </div>
          )
        })}
      </div>
      <div ref={sentinelRef} className="h-8" />
      {loadingMore ? <p className="py-3 text-center text-xs text-studio-muted">Loading more…</p> : null}
    </div>
  )
}
