import { useEffect, useId, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { StudioIcon } from '@/components/studio/StudioIconButton'

export type CollectionCard = {
  id: string
  title: string
  coverUrl?: string
  hint?: string
}

export function CollectionWall({
  items,
  loaded,
  emptyTitle,
  onOpen,
  onAdd,
  onMove,
  cols = 3,
}: {
  items: CollectionCard[]
  loaded: boolean
  emptyTitle: string
  onOpen: (id: string) => void
  onAdd: () => void
  onMove?: (id: string, direction: -1 | 1) => void
  cols?: number
}) {
  const grid = { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }

  if (!loaded) {
    return (
      <div className="grid gap-3" style={grid}>
        {Array.from({ length: cols * 2 }, (_, i) => (
          <Skeleton key={i} className="aspect-square" />
        ))}
      </div>
    )
  }

  if (!items.length) {
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
    <div className="grid gap-3" style={grid}>
      {items.map((item, index) => (
        <div key={item.id} className="group relative">
          <button type="button" onClick={() => onOpen(item.id)} className="block w-full text-left">
            <div className="relative aspect-square overflow-hidden bg-studio-panel">
              {item.coverUrl ? (
                <img src={item.coverUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center border border-dashed border-studio-border text-studio-muted">
                  <StudioIcon icon={Plus} />
                </div>
              )}
            </div>
            <p className="mt-1.5 truncate text-sm">{item.title}</p>
            {item.hint ? <p className="truncate text-xs text-studio-muted">{item.hint}</p> : null}
          </button>
          {onMove ? (
            <div className="pointer-events-none absolute inset-x-0 top-0 aspect-square overflow-hidden">
              <div className="pointer-events-auto absolute right-[3%] top-[3%] flex h-[32%] w-[16%] max-h-10 max-w-6 flex-col overflow-hidden rounded-sm bg-studio-bg/90 sm:hidden sm:h-16 sm:w-8 sm:max-h-none sm:max-w-none sm:group-hover:flex sm:group-focus-within:flex">
                <button
                  type="button"
                  aria-label="Move earlier"
                  disabled={index === 0}
                  onClick={() => onMove(item.id, -1)}
                  className="inline-flex h-1/2 w-full min-h-0 min-w-0 items-center justify-center text-studio-muted hover:text-studio-fg disabled:opacity-30"
                >
                  <StudioIcon icon={ChevronUp} className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Move later"
                  disabled={index === items.length - 1}
                  onClick={() => onMove(item.id, 1)}
                  className="inline-flex h-1/2 w-full min-h-0 min-w-0 items-center justify-center text-studio-muted hover:text-studio-fg disabled:opacity-30"
                >
                  <StudioIcon icon={ChevronDown} className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export function CollectionInnerBar({
  backLabel,
  onBack,
  name,
  onRename,
  trailing,
}: {
  backLabel: string
  onBack: () => void
  name: string
  onRename: (name: string) => void
  trailing?: ReactNode
}) {
  const fieldId = useId()
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex h-11 items-center gap-1.5 text-sm text-studio-muted hover:text-studio-fg"
      >
        <StudioIcon icon={ChevronLeft} />
        {backLabel}
      </button>
      <div className="min-w-[10rem] flex-1">
        <Label htmlFor={fieldId} className="sr-only">
          Name
        </Label>
        <Input
          id={fieldId}
          key={name}
          defaultValue={name}
          className="h-11 border-0 border-b border-studio-border/70 px-0 shadow-none focus-visible:border-studio-fg"
          onBlur={(event) => {
            const next = event.target.value.trim()
            if (next && next !== name) onRename(next)
          }}
        />
      </div>
      {trailing}
    </div>
  )
}

export function CollectionCreateStrip({
  open,
  label,
  placeholder,
  onCreate,
  onCancel,
}: {
  open: boolean
  label: string
  placeholder: string
  onCreate: (title: string) => void
  onCancel: () => void
}) {
  const fieldId = useId()
  const [title, setTitle] = useState('')

  useEffect(() => {
    if (open) setTitle('')
  }, [open])

  if (!open) return null

  return (
    <form
      className="mb-4 flex max-w-md flex-wrap items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        if (!title.trim()) return
        onCreate(title.trim())
      }}
    >
      <div className="min-w-[12rem] flex-1">
        <Label htmlFor={fieldId} className="text-xs text-studio-muted">
          {label}
        </Label>
        <Input
          id={fieldId}
          className="mt-1"
          value={title}
          autoFocus
          placeholder={placeholder}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>
      <button type="submit" className="h-11 text-sm text-studio-accent hover:opacity-80">
        Create
      </button>
      <button type="button" className="h-11 text-sm text-studio-muted hover:text-studio-fg" onClick={onCancel}>
        Cancel
      </button>
    </form>
  )
}

export function useCreateOffer(tick: number) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (tick) setOpen(true)
  }, [tick])
  return [open, setOpen] as const
}
