import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useRevealInView } from '@/lib/reveal-in-view'
import { cn } from '@/lib/utils'
import { pbErrorMessage } from '@/lib/pb-error'
import { useUnsavedGuard } from '@/lib/useUnsavedGuard'

export type SectionSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useSectionSave() {
  const [status, setStatus] = useState<SectionSaveStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const savedTimer = useRef<number | undefined>(undefined)

  // A "Saved" that never clears becomes indistinguishable from the result of
  // whatever the photographer does next.
  useEffect(() => {
    if (status !== 'saved') return
    savedTimer.current = window.setTimeout(() => setStatus('idle'), 2500)
    return () => window.clearTimeout(savedTimer.current)
  }, [status])

  const runSave = useCallback(async (action: () => Promise<void>) => {
    setStatus('saving')
    setError(null)
    try {
      await action()
      setStatus('saved')
      return true
    } catch (e) {
      setStatus('error')
      setError(pbErrorMessage(e, 'Could not save.'))
      return false
    }
  }, [])

  const reset = useCallback(() => {
    window.clearTimeout(savedTimer.current)
    setStatus('idle')
    setError(null)
  }, [])

  return { status, error, runSave, reset, setStatus }
}

/** Visible Save — only when dirty (or error/saving). Put in modal footer. */
export function SectionSaveBar({
  status,
  error,
  onSave,
  dirty = true,
  disabled,
}: {
  status: SectionSaveStatus
  error?: string | null
  onSave: () => void
  dirty?: boolean
  disabled?: boolean
}) {
  useUnsavedGuard(dirty && status !== 'saving')

  // 'saved' keeps the bar up briefly so the save is acknowledged rather than
  // the whole control silently disappearing.
  if (!dirty && status !== 'saving' && status !== 'error' && status !== 'saved') return null

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={disabled || status === 'saving' || !dirty}
        onClick={onSave}
        className="rounded bg-studio-fg px-3.5 py-2 text-xs font-medium text-studio-bg disabled:opacity-40"
      >
        {status === 'saving' ? 'Saving…' : 'Save'}
      </button>
      {status === 'saved' ? (
        <span role="status" aria-live="polite" className="text-xs text-studio-accent">
          Saved
        </span>
      ) : null}
      {status === 'error' ? (
        <span role="alert" className="text-xs text-studio-danger">
          {error || 'Could not save'}
        </span>
      ) : null}
    </div>
  )
}

/** Compact ⋯ menu for Pick / Upload / Remove style actions. */
export function StudioActionMenu({
  items,
  label = 'More',
}: {
  items: { label: string; onClick: () => void; danger?: boolean }[]
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div className="relative" ref={root}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        // A thumb needs a real target even though the glyph is tiny.
        className="inline-flex h-11 w-11 items-center justify-center text-sm leading-none text-studio-muted hover:text-studio-fg"
        onClick={() => setOpen((v) => !v)}
      >
        ⋯
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-1 min-w-[7.5rem] border border-studio-border/80 bg-studio-bg py-1 shadow-md">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              className={cn(
                'flex min-h-11 w-full items-center px-3 text-left text-xs hover:bg-studio-panel',
                item.danger ? 'text-studio-danger' : 'text-studio-fg',
              )}
              onClick={() => {
                setOpen(false)
                item.onClick()
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

/** Quiet accordion section — one open via parent `openId`. */
export function StudioSection({
  id,
  title,
  hint,
  open,
  onToggle,
  children,
  className,
}: {
  id: string
  title: string
  hint?: string
  open: boolean
  onToggle: (id: string) => void
  children: ReactNode
  className?: string
}) {
  const revealRef = useRevealInView<HTMLDivElement>(open, [id])
  return (
    <div
      ref={revealRef}
      className={cn(
        'border-b border-studio-border/60 transition-colors',
        open && 'border-l-2 border-l-studio-fg pl-3',
        className,
      )}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 py-2.5 text-left"
        aria-expanded={open}
        onClick={() => onToggle(id)}
      >
        <span className={cn('text-sm', open ? 'font-medium text-studio-fg' : 'text-studio-muted')}>{title}</span>
        <span className={cn('shrink-0 text-xs', open ? 'text-studio-fg' : 'text-studio-muted')}>
          {open ? 'Hide' : hint || 'Edit'}
        </span>
      </button>
      {open ? <div className="pb-3">{children}</div> : null}
    </div>
  )
}

/** Shared active-row cue for thumb+title pickers (Services, Works, SEO pages). */
export function studioRowActive(active: boolean) {
  return cn(
    'flex w-full items-center gap-3 border-l-2 py-2 pl-2.5 text-left transition-colors',
    active
      ? 'border-l-studio-fg bg-studio-panel font-medium text-studio-fg'
      : 'border-l-transparent text-studio-fg hover:bg-studio-panel/40',
  )
}

export function studioRowBadge(active: boolean, openLabel = 'Hide', closedLabel = 'Edit') {
  return (
    <span className={cn('shrink-0 text-xs', active ? 'text-studio-fg' : 'text-studio-muted')}>
      {active ? openLabel : closedLabel}
    </span>
  )
}

export function useAccordion(initial: string | null = null) {
  const [openId, setOpenId] = useState<string | null>(initial)

  function toggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id))
  }

  return { openId, setOpenId, toggle }
}

export { textareaClass as quietTextareaClass } from '@/components/ui/textarea'

export function useDraftResetKey(rev: string | number | undefined) {
  const [key, setKey] = useState(0)
  useEffect(() => {
    setKey((k) => k + 1)
  }, [rev])
  return key
}
