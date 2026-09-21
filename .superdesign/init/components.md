# Shared UI primitives

React + Vite + Tailwind v4 + Radix Slot/Label + CVA. Custom studio/public tokens — not shadcn defaults.

### src/components/ui/button.tsx

\	sx
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-studio-fg text-studio-bg hover:bg-studio-fg/90',
        secondary: 'bg-studio-border text-studio-fg hover:bg-studio-border/80',
        outline: 'border border-studio-border bg-studio-panel text-studio-fg hover:bg-studio-bg',
        ghost: 'hover:bg-studio-bg text-studio-fg',
        accent: 'bg-studio-accent text-studio-bg hover:bg-studio-accent/90',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-md px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

\\n
### src/components/ui/input.tsx

\	sx
import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Input({ className, type, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  // File inputs keep a light bordered control; text fields use underline.
  if (type === 'file') {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full cursor-pointer rounded border border-studio-border/60 bg-transparent px-2 text-xs text-studio-fg file:mr-2 file:border-0 file:bg-transparent file:text-xs file:text-studio-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-studio-fg disabled:opacity-50',
          className,
        )}
        {...props}
      />
    )
  }

  return (
    <input
      type={type}
      className={cn(
        // A 1px border tint is not a discernible focus indicator; keep a real outline.
        // 16px on touch stops iOS Safari from page-zooming on focus.
        'flex h-10 w-full border-0 border-b border-studio-border/70 bg-transparent px-0 py-1 font-sans text-base font-normal text-studio-fg placeholder:font-normal placeholder:text-studio-muted focus-visible:border-studio-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-studio-fg disabled:cursor-not-allowed disabled:opacity-50 md:h-8 md:text-sm',
        className,
      )}
      {...props}
    />
  )
}

\\n
### src/components/ui/label.tsx

\	sx
import * as LabelPrimitive from '@radix-ui/react-label'
import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'

export function Label({ className, ...props }: ComponentPropsWithoutRef<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        'text-xs font-medium leading-none text-studio-muted peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      {...props}
    />
  )
}

\\n
### src/components/ui/textarea.tsx

\	sx
import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/** Underline Studio textarea — same chrome and focus ring as `Input`. */
export const textareaClass =
  'min-h-16 w-full resize-y border-0 border-b border-studio-border/70 bg-transparent px-0 py-1.5 font-sans text-base font-normal leading-relaxed text-studio-fg placeholder:font-normal placeholder:text-studio-muted focus-visible:border-studio-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-studio-fg disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(textareaClass, className)} {...props} />
}

\\n
### src/components/ui/select.tsx

\	sx
import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const selectVariants = {
  form: 'h-11 w-full rounded-md border border-studio-border bg-studio-panel px-2 text-base text-studio-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-studio-fg disabled:cursor-not-allowed disabled:opacity-50 md:h-10 md:text-sm',
  toolbar:
    'h-11 min-h-11 rounded-md border border-studio-border bg-studio-panel px-2 text-sm text-studio-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-studio-fg disabled:opacity-50 md:h-8 md:min-h-8',
}

export function Select({
  className,
  variant = 'form',
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { variant?: keyof typeof selectVariants }) {
  return <select className={cn(selectVariants[variant], className)} {...props} />
}

\\n
### src/components/ui/alert.tsx

\	sx
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'error' | 'info' | 'success'
type Tone = 'public' | 'studio'

const styles: Record<Tone, Record<Variant, string>> = {
  public: {
    error: 'text-public-danger',
    info: 'text-public-muted',
    success: 'text-public-accent',
  },
  studio: {
    error: 'rounded-md border border-studio-danger/25 bg-studio-danger/5 px-3 py-2 text-studio-danger',
    info: 'rounded-md border border-studio-border bg-studio-panel px-3 py-2 text-studio-muted',
    success: 'rounded-md border border-studio-border bg-studio-panel px-3 py-2 text-studio-fg',
  },
}

/**
 * Outcome message. Errors announce assertively, everything else politely, so a
 * result is never visible-only.
 */
export function Alert({
  variant = 'error',
  tone = 'studio',
  children,
  onRetry,
  retryLabel = 'Try again',
  className,
}: {
  variant?: Variant
  tone?: Tone
  children: ReactNode
  onRetry?: () => void
  retryLabel?: string
  className?: string
}) {
  const isError = variant === 'error'

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 text-sm', styles[tone][variant], className)}
    >
      <span>{children}</span>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            'shrink-0 underline underline-offset-2',
            tone === 'public' ? 'text-public-fg hover:opacity-80' : 'text-studio-fg hover:opacity-80',
          )}
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  )
}

const STUDIO_LOAD_LABELS: Record<string, string> = {
  Albums: 'Albums',
  Bookings: 'Bookings',
  Deliveries: 'Deliveries',
  FAQ: 'FAQ',
  Feedback: 'Feedback',
  Inbox: 'Inbox',
  MediaLifetime: 'Photos',
  MediaPeriod: 'Photos this period',
  MoneyEvents: 'Earnings',
  People: 'People',
  Portfolio: 'Portfolio',
  SEO: 'Search listings',
  Settings: 'Website settings',
  Tags: 'Tags',
  Testimonials: 'Testimonials',
  Work: 'Work',
}

/**
 * Aggregate surface loaded with gaps. Names what is missing rather than letting
 * absent data read as zero.
 */
export function PartialDataNotice({
  missing,
  onRetry,
  tone = 'studio',
}: {
  missing: string[]
  onRetry?: () => void
  tone?: Tone
}) {
  if (!missing.length) return null

  const labels = missing.map((key) => STUDIO_LOAD_LABELS[key] ?? key).join(', ')

  return (
    <Alert variant="info" tone={tone} onRetry={onRetry} retryLabel="Reload">
      Some of this page could not load ({labels}). What you see may be incomplete.
    </Alert>
  )
}

\\n
### src/components/ui/skeleton.tsx

\	sx
import { cn } from '@/lib/utils'

type Tone = 'public' | 'studio'

const toneClass: Record<Tone, string> = {
  public: 'bg-public-fg/[0.07]',
  studio: 'bg-studio-border/60',
}

/** Placeholder block. Reserves the space the loaded content will occupy. */
export function Skeleton({
  className,
  tone = 'studio',
}: {
  className?: string
  tone?: Tone
}) {
  return <div aria-hidden className={cn('animate-pulse rounded', toneClass[tone], className)} />
}

/** Stack of text-height bars; last one short so it reads as a paragraph. */
export function SkeletonText({
  lines = 3,
  className,
  tone = 'studio',
}: {
  lines?: number
  className?: string
  tone?: Tone
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} tone={tone} className={cn('h-3', i === lines - 1 ? 'w-2/5' : 'w-full')} />
      ))}
    </div>
  )
}

/**
 * Grid of image placeholders for galleries and pickers. `aspect` should match
 * the loaded grid so nothing shifts when the photographs arrive.
 */
export function SkeletonGrid({
  count = 6,
  className,
  itemClassName = 'aspect-[4/5]',
  tone = 'studio',
}: {
  count?: number
  className?: string
  itemClassName?: string
  tone?: Tone
}) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} tone={tone} className={itemClassName} />
      ))}
    </div>
  )
}

/** Announces that a surface is busy, for assistive tech, without visible text. */
export function LoadingAnnouncement({ label = 'Loading' }: { label?: string }) {
  return (
    <span role="status" aria-live="polite" className="sr-only">
      {label}
    </span>
  )
}

\\n
### src/components/ui/surface.tsx

\	sx
import { createContext, useContext, type ReactNode } from 'react'

export type Surface = 'public' | 'studio'

/**
 * Which design surface a subtree belongs to.
 *
 * Tokens and fonts are scoped to a shell class on a layout element, but dialogs
 * portal to `body` and land outside it — so a public overlay silently inherits
 * the Studio faces, and vice versa. Carrying the surface in context lets a
 * portal stamp the correct shell class on its own root without needing to know
 * where in the tree it was rendered from.
 */
const SurfaceContext = createContext<Surface | null>(null)

const shellClass: Record<Surface, string> = {
  public: 'public-shell',
  studio: 'studio-shell',
}

export function SurfaceProvider({ surface, children }: { surface: Surface; children: ReactNode }) {
  return <SurfaceContext.Provider value={surface}>{children}</SurfaceContext.Provider>
}

let warned = false

/** The shell class a portal root should carry to inherit the right tokens. */
export function useSurfaceShellClass() {
  const surface = useContext(SurfaceContext)
  if (surface) return shellClass[surface]

  // Falling back silently is how the original bug looked: a font that is nearly
  // right. Say so once, rather than per render.
  if (import.meta.env.DEV && !warned) {
    warned = true
    console.warn(
      '[ibrahim-lens] A dialog rendered outside a SurfaceProvider and is falling back to the ' +
        'public shell. Wrap the route in <SurfaceProvider surface="…"> so its tokens are explicit.',
    )
  }
  return shellClass.public
}

\\n
### src/components/ui/dialog.tsx

\	sx
import { useCallback, useEffect, useRef, type KeyboardEvent, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { useSurfaceShellClass } from '@/components/ui/surface'
import { acquireScrollLock } from '@/lib/scrollLock'
import { cn } from '@/lib/utils'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function focusableWithin(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null || el.getAttribute('aria-hidden') !== 'true',
  )
}

/**
 * Everything the dialog needs to sit on top of.
 *
 * Targeting `#root` alone is not enough: dialogs portal to `body`, so a
 * confirmation opened from inside a modal would leave that modal reachable by
 * Tab. Taking all of `body`'s children except this dialog's own subtree makes
 * stacking work without the layers needing to know about each other.
 */
function siblingsToInert(container: HTMLElement | null) {
  if (typeof document === 'undefined') return []
  return Array.from(document.body.children).filter(
    (el): el is HTMLElement => el instanceof HTMLElement && !(container && el.contains(container)),
  )
}

const LAYER_ATTR = 'data-dialog-layer'

/**
 * Portals mount in the order they open, so the last matching node in the
 * document is the layer the user is actually looking at.
 */
function isTopLayer(container: HTMLElement | null) {
  if (!container) return false
  const layers = document.querySelectorAll<HTMLElement>(`[${LAYER_ATTR}]`)
  return layers[layers.length - 1] === container
}

type ChromeOptions = {
  open: boolean
  onClose: () => void
  initialFocusRef?: RefObject<HTMLElement | null>
  closeOnEscape?: boolean
}

/**
 * Modal behaviour, without any opinion on layout: focus in, Tab contained,
 * Escape to close, background inert to pointer and assistive tech, body scroll
 * locked, and focus returned to whatever opened it.
 */
export function useDialogChrome({ open, onClose, initialFocusRef, closeOnEscape = true }: ChromeOptions) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const opener = document.activeElement as HTMLElement | null
    const release = acquireScrollLock()

    // `inert` also blocks pointer events; aria-hidden covers browsers without it.
    // Only elements this dialog itself made inert are restored on close, so a
    // nested dialog closing does not reactivate the modal underneath it.
    const inerted = siblingsToInert(containerRef.current).filter((el) => !el.hasAttribute('inert'))
    for (const el of inerted) {
      el.setAttribute('inert', '')
      el.setAttribute('aria-hidden', 'true')
    }

    const target = initialFocusRef?.current ?? focusableWithin(containerRef.current!)[0] ?? containerRef.current
    target?.focus()

    return () => {
      release()
      for (const el of inerted) {
        el.removeAttribute('inert')
        el.removeAttribute('aria-hidden')
      }
      // Restoring focus is what lets a keyboard user carry on where they were.
      if (opener?.isConnected) opener.focus()
    }
  }, [open, initialFocusRef])

  useEffect(() => {
    if (!open || !closeOnEscape) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return
      // Only the topmost layer reacts, or a confirmation opened from inside a
      // modal would dismiss both at once.
      if (!isTopLayer(containerRef.current)) return
      onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, closeOnEscape, onClose])

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab') return
    const root = containerRef.current
    if (!root) return

    const items = focusableWithin(root)
    if (!items.length) {
      e.preventDefault()
      return
    }

    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement

    if (e.shiftKey && (active === first || active === root)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
  }, [])

  return { containerRef, onKeyDown }
}

type DialogProps = ChromeOptions & {
  /** id of the element that names this dialog; prefer over `label`. */
  labelledBy?: string
  label?: string
  className?: string
  children: ReactNode
}

/** Portals to `body` so the app root can be made inert without disabling this. */
export function Dialog({
  open,
  onClose,
  initialFocusRef,
  closeOnEscape,
  labelledBy,
  label,
  className,
  children,
}: DialogProps) {
  const { containerRef, onKeyDown } = useDialogChrome({ open, onClose, initialFocusRef, closeOnEscape })
  // Portalling to `body` puts this outside the shell element that scopes the
  // surface's fonts and color-scheme, so it has to carry them itself.
  const shellClass = useSurfaceShellClass()

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      ref={containerRef}
      {...{ [LAYER_ATTR]: '' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
      onKeyDown={onKeyDown}
      className={cn('fixed inset-0 z-[60]', shellClass, className)}
    >
      {children}
    </div>,
    document.body,
  )
}

\\n
### src/components/ui/confirm.tsx

\	sx
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

\\n
### src/components/ui/naira-field.tsx

\	sx
import type { InputHTMLAttributes } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/** Underline amount field with a persistent ₦ prefix. */
export function NairaField({
  className,
  id,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'inputMode'>) {
  return (
    <div className={cn('flex items-end gap-2', className)}>
      <span className="pb-1 text-sm text-studio-muted" aria-hidden>
        ₦
      </span>
      <Input id={id} type="text" inputMode="decimal" autoComplete="off" className="min-w-0 flex-1" {...props} />
    </div>
  )
}

\\n