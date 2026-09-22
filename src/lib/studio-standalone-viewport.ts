import { isStudioStandalone } from '@/lib/notice-channels'

const FOCUSABLE = 'input, textarea, select, [contenteditable="true"]'

function isTypingTarget(el: EventTarget | null) {
  return el instanceof HTMLElement && el.matches(FOCUSABLE)
}

/**
 * iOS home-screen Studio drifts after the keyboard: the shell stays shifted until
 * force-quit. Pin the layout frame to visualViewport (size + offset) in standalone only.
 * While a field is focused, only update CSS vars — do not fight iOS with scrollTo.
 */
export function attachStudioStandaloneViewportGuard() {
  if (typeof window === 'undefined' || !isStudioStandalone()) return () => {}

  const root = document.documentElement
  root.classList.add('studio-standalone')

  let focusOutTimer: ReturnType<typeof setTimeout> | undefined
  let raf = 0

  function applyVars() {
    const vv = window.visualViewport
    const offsetTop = vv?.offsetTop ?? 0
    const height = vv?.height ?? window.innerHeight
    root.style.setProperty('--studio-vv-offset-top', `${offsetTop}px`)
    root.style.setProperty('--studio-vv-height', `${height}px`)
  }

  function resetDocumentScroll() {
    if (window.scrollX !== 0 || window.scrollY !== 0) window.scrollTo(0, 0)
    if (root.scrollTop) root.scrollTop = 0
    if (document.body.scrollTop) document.body.scrollTop = 0
  }

  function syncViewport(opts?: { forceScrollReset?: boolean }) {
    applyVars()
    const typing = isTypingTarget(document.activeElement)
    if (!typing || opts?.forceScrollReset) resetDocumentScroll()
  }

  function scheduleSync() {
    if (raf) return
    raf = window.requestAnimationFrame(() => {
      raf = 0
      syncViewport()
    })
  }

  function onFocusOut(event: FocusEvent) {
    if (isTypingTarget(event.relatedTarget)) return
    window.clearTimeout(focusOutTimer)
    // Keyboard close animates; re-pin after it settles.
    focusOutTimer = window.setTimeout(() => syncViewport({ forceScrollReset: true }), 120)
    window.setTimeout(() => syncViewport({ forceScrollReset: true }), 400)
  }

  const vv = window.visualViewport
  vv?.addEventListener('scroll', scheduleSync)
  vv?.addEventListener('resize', scheduleSync)
  window.addEventListener('orientationchange', scheduleSync)
  document.addEventListener('focusout', onFocusOut)
  syncViewport({ forceScrollReset: true })

  return () => {
    if (raf) window.cancelAnimationFrame(raf)
    vv?.removeEventListener('scroll', scheduleSync)
    vv?.removeEventListener('resize', scheduleSync)
    window.removeEventListener('orientationchange', scheduleSync)
    document.removeEventListener('focusout', onFocusOut)
    window.clearTimeout(focusOutTimer)
    root.classList.remove('studio-standalone')
    root.style.removeProperty('--studio-vv-offset-top')
    root.style.removeProperty('--studio-vv-height')
  }
}
