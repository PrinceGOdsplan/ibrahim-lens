import { useEffect } from 'react'

/**
 * Asks the browser to confirm before discarding unsaved Studio edits.
 *
 * Counted rather than a boolean flag: several editors can be open and dirty at
 * once, and the last one to clean up must not cancel the guard the others still
 * need. The browser shows its own wording — the string is only there because
 * older engines require a non-empty `returnValue`.
 */
let dirtyCount = 0
let listening = false

function onBeforeUnload(event: BeforeUnloadEvent) {
  event.preventDefault()
  event.returnValue = ''
}

export function useUnsavedGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return

    dirtyCount += 1
    if (!listening) {
      window.addEventListener('beforeunload', onBeforeUnload)
      listening = true
    }

    return () => {
      dirtyCount = Math.max(0, dirtyCount - 1)
      if (dirtyCount === 0 && listening) {
        window.removeEventListener('beforeunload', onBeforeUnload)
        listening = false
      }
    }
  }, [dirty])
}
