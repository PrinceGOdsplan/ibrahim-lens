import { useCallback, useEffect, useId, useRef, type ReactNode } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { useConfirm } from '@/components/ui/confirm'
import { attachFocusReveal } from '@/lib/reveal-in-view'
import { cn } from '@/lib/utils'

/**
 * Studio edit panel — dimmed backdrop + sheet.
 * Phone: near-full height sheet. Desktop: right panel so Studio chrome stays visible.
 */
export function StudioFullscreenModal({
  open,
  title,
  onClose,
  dirty = false,
  discardTitle = 'Discard your changes?',
  discardBody = 'You have edits here that have not been saved.',
  children,
  footer,
  className,
}: {
  open: boolean
  title: string
  onClose: () => void
  /** When set, a stray Escape or backdrop click asks before throwing edits away. */
  dirty?: boolean
  discardTitle?: string
  discardBody?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}) {
  const titleId = useId()
  const bodyRef = useRef<HTMLDivElement>(null)
  const { confirm, dialog: confirmDialog } = useConfirm()

  useEffect(() => {
    if (!open) return
    const body = bodyRef.current
    body?.scrollTo({ top: 0 })
    return attachFocusReveal(body)
  }, [open])

  const requestClose = useCallback(async () => {
    if (!dirty) {
      onClose()
      return
    }
    const discard = await confirm({
      title: discardTitle,
      body: discardBody,
      confirmLabel: 'Discard',
      cancelLabel: 'Keep editing',
      destructive: true,
    })
    if (discard) onClose()
  }, [dirty, onClose, confirm, discardTitle, discardBody])

  return (
    <Dialog open={open} onClose={requestClose} labelledBy={titleId} className="z-[60] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-studio-scrim"
        aria-label="Dismiss"
        onClick={requestClose}
      />
      <div className="relative flex h-full w-full max-w-lg flex-col border-l border-studio-border bg-studio-bg text-studio-fg shadow-xl sm:max-w-md md:max-w-lg">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-studio-border px-4 py-2.5 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <h2 id={titleId} className="text-sm font-medium tracking-tight text-studio-fg">
            {title}
          </h2>
          <button
            type="button"
            className="-mr-2 inline-flex h-11 items-center px-2 text-xs text-studio-muted hover:text-studio-fg"
            onClick={requestClose}
          >
            Close
          </button>
        </header>
        <div ref={bodyRef} className={cn('min-h-0 flex-1 overflow-y-auto px-4 py-3', className)}>
          {children}
        </div>
        {footer ? (
          <footer className="shrink-0 border-t border-studio-border px-4 py-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            {footer}
          </footer>
        ) : null}
      </div>
      {confirmDialog}
    </Dialog>
  )
}
