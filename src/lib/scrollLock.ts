/**
 * Ref-counted body scroll lock, shared by every overlay in the app.
 *
 * Single owner by design: when public and Studio overlays each set
 * `document.body.style.overflow` themselves, one unmount clobbers the other's
 * state and the page is left either stuck or unexpectedly scrollable.
 */

let lockCount = 0
let previousOverflow = ''
let previousPaddingRight = ''

function scrollbarWidth() {
  if (typeof window === 'undefined') return 0
  return Math.max(0, window.innerWidth - document.documentElement.clientWidth)
}

export function acquireScrollLock() {
  if (typeof document === 'undefined') return () => undefined

  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow
    previousPaddingRight = document.body.style.paddingRight
    // Replacing the scrollbar's width keeps fixed and centred content from
    // jumping sideways when the overlay opens.
    const gap = scrollbarWidth()
    document.body.style.overflow = 'hidden'
    if (gap > 0) document.body.style.paddingRight = `${gap}px`
  }

  lockCount += 1
  let released = false

  return () => {
    if (released) return
    released = true
    lockCount = Math.max(0, lockCount - 1)
    if (lockCount === 0) {
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPaddingRight
    }
  }
}

/** Safety valve: clear a lock left behind with no overlays tracking it. */
export function ensureScrollUnlocked() {
  if (typeof document === 'undefined') return
  if (lockCount === 0 && document.body.style.overflow === 'hidden') {
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
  }
}
