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
