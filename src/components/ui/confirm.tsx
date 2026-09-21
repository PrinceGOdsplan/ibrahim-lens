import { useCallback, useId, useRef, useState, type ReactNode } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export type ConfirmOptions = {
  title: string
  /** State the consequence, not just the question. */
  body?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

type Pending = { options: ConfirmOptions; resolve: (ok: boolean) => void }

/**
 * Promise-returning confirmation, so a destructive call site reads as a guard:
 *
 *   if (!(await confirm({ title: 'Delete album?', destructive: true }))) return
 *
 * Render the returned `dialog` node once inside the component.
 */
export function useConfirm(tone: 'public' | 'studio' = 'studio') {
  const [pending, setPending] = useState<Pending | null>(null)
  const titleId = useId()
  const cancelRef = useRef<HTMLButtonElement>(null)

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setPending({ options, resolve })
      }),
    [],
  )

  const settle = useCallback(
    (ok: boolean) => {
      setPending((current) => {
        current?.resolve(ok)
        return null
      })
    },
    [],
  )

  const options = pending?.options
  const destructive = options?.destructive ?? false

  const dialog = (
    <Dialog
      open={Boolean(pending)}
      onClose={() => settle(false)}
      labelledBy={titleId}
      // Focus rests on Cancel so Enter cannot complete a destructive action.
      initialFocusRef={cancelRef}
      className="flex items-center justify-center p-5"
    >
      <div aria-hidden className="absolute inset-0 bg-studio-scrim" onClick={() => settle(false)} />
      <div
        className={cn(
          'relative w-full max-w-sm rounded-lg p-5 shadow-xl',
          tone === 'studio'
            ? 'border border-studio-border bg-studio-panel text-studio-fg'
            : 'border border-white/10 bg-public-raised text-public-fg',
        )}
      >
        <h2 id={titleId} className="text-sm font-medium">
          {options?.title}
        </h2>
        {options?.body ? (
          <div className={cn('mt-2 text-sm', tone === 'studio' ? 'text-studio-muted' : 'text-public-body')}>
            {options.body}
          </div>
        ) : null}
        <div className="mt-5 flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={() => settle(false)}
            className={cn(
              'rounded px-3 py-1.5 text-xs font-medium',
              tone === 'studio'
                ? 'border border-studio-border text-studio-fg hover:bg-studio-bg'
                : 'border border-white/20 text-public-fg hover:bg-white/5',
            )}
          >
            {options?.cancelLabel ?? 'Cancel'}
          </button>
          <button
            type="button"
            onClick={() => settle(true)}
            className={cn(
              'rounded px-3 py-1.5 text-xs font-medium text-white',
              destructive
                ? 'bg-studio-danger hover:opacity-90'
                : tone === 'studio'
                  ? 'bg-studio-fg text-studio-bg hover:opacity-90'
                  : 'bg-public-accent text-public-bg hover:opacity-90',
            )}
          >
            {options?.confirmLabel ?? 'Confirm'}
          </button>
        </div>
      </div>
    </Dialog>
  )

  return { confirm, dialog }
}
