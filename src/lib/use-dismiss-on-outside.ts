import { useEffect } from 'react'

/**
 * Close a popover when the user taps outside or presses Escape.
 * Ignores the opening gesture — on iOS the same tap that opens a menu can
 * synthesize a delayed pointer/mouse event that would otherwise close it
 * immediately (open/close flicker).
 */
export function useDismissOnOutside(
  open: boolean,
  contains: (node: Node) => boolean,
  onDismiss: () => void,
) {
  useEffect(() => {
    if (!open) return
    const openedAt = Date.now()

    const onPointer = (e: PointerEvent) => {
      if (Date.now() - openedAt < 400) return
      if (!(e.target instanceof Node) || !contains(e.target)) onDismiss()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }

    document.addEventListener('pointerdown', onPointer, true)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer, true)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, contains, onDismiss])
}
