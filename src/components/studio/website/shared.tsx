import type { ReactNode } from 'react'
import { mediaThumbUrl, type MediaRecord } from '@/lib/library'
import { cn } from '@/lib/utils'

/** Opens a public route in a new tab — lets the photographer verify a Website tab's live page. */
export function OpenPublicPageLink({ href, label = 'Open public page' }: { href: string; label?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-xs font-medium tracking-wide text-studio-accent hover:opacity-80"
    >
      {label} →
    </a>
  )
}

/** Multi-select image grid (Home featured, atmosphere manual picks). */
export function MultiImagePicker({
  images,
  selected,
  onToggle,
  busy,
  max,
  emptyHint = 'Add images to Portfolio in Gallery first.',
}: {
  images: MediaRecord[]
  selected: string[]
  onToggle: (id: string) => void
  busy?: boolean
  max?: number
  emptyHint?: string
}) {
  if (!images.length) {
    return <p className="text-sm text-studio-muted">{emptyHint}</p>
  }
  const set = new Set(selected)
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {images.map((item) => {
        const on = set.has(item.id)
        const atMax = typeof max === 'number' && selected.length >= max
        const disabled = !!busy || (!on && atMax)
        return (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(item.id)}
            className={cn(
              'overflow-hidden rounded-lg border text-left transition-opacity',
              on ? 'border-studio-accent ring-2 ring-studio-accent/30' : 'border-studio-border',
              disabled && !on ? 'opacity-40' : '',
            )}
          >
            <img src={mediaThumbUrl(item, '400x400')} alt="" className="aspect-square w-full object-cover" />
            <div className="px-2 py-1 text-[11px] text-studio-muted">
              {on ? 'Selected' : disabled ? 'Max reached' : 'Click to select'}
            </div>
          </button>
        )
      })}
    </div>
  )
}

/** Single-select mini image grid (a lane's image). */
export function MiniImagePicker({
  images,
  value,
  onChange,
  busy,
  emptyHint = 'Add Portfolio images to pick one.',
}: {
  images: MediaRecord[]
  value?: string
  onChange: (id: string | undefined) => void
  busy?: boolean
  emptyHint?: string
}) {
  if (!images.length) {
    return <p className="text-xs text-studio-muted">{emptyHint}</p>
  }
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
      {images.map((item) => {
        const on = item.id === value
        return (
          <button
            key={item.id}
            type="button"
            disabled={busy}
            onClick={() => onChange(on ? undefined : item.id)}
            className={cn(
              'overflow-hidden rounded-md border',
              on ? 'border-studio-accent ring-2 ring-studio-accent/30' : 'border-studio-border',
            )}
            title={item.caption || undefined}
          >
            <img src={mediaThumbUrl(item, '200x200')} alt="" className="aspect-square w-full object-cover" />
          </button>
        )
      })}
    </div>
  )
}

/** Muted callout — coaching copy for empty states, feature ownership hints. */
export function Coach({ children }: { children: ReactNode }) {
  return <p className="rounded-md border border-dashed border-studio-border bg-studio-bg px-3 py-2 text-xs text-studio-muted">{children}</p>
}
