import { isStudioStandalone } from '@/lib/notice-channels'

/**
 * iOS home-screen Studio drifts after the keyboard: the shell stays shifted until
 * force-quit. Pin the shell to visualViewport (size + offset) in standalone only.
 */
export function attachStudioStandaloneViewportGuard() {
  if (typeof window === 'undefined' || !isStudioStandalone()) return () => {}

  const root = document.documentElement
  root.classList.add('studio-standalone')

  let focusOutTimer: ReturnType<typeof setTimeout> | undefined

  function syncViewport() {
    const vv = window.visualViewport
    const offsetTop = vv?.offsetTop ?? 0
    const height = vv?.height ?? window.innerHeight

    root.style.setProperty('--studio-vv-offset-top', `${offsetTop}px`)
    root.style.setProperty('--studio-vv-height', `${height}px`)

    if (window.scrollX !== 0 || window.scrollY !== 0) {
      window.scrollTo(0, 0)
    }
    if (root.scrollTop) root.scrollTop = 0
    if (document.body.scrollTop) document.body.scrollTop = 0
  }

  function onFocusOut(event: FocusEvent) {
    const next = event.relatedTarget
    if (next instanceof HTMLElement && next.matches('input, textarea, select, [contenteditable="true"]')) {
      return
    }
    window.clearTimeout(focusOutTimer)
    focusOutTimer = window.setTimeout(syncViewport, 120)
    window.setTimeout(syncViewport, 400)
  }

  const vv = window.visualViewport
  vv?.addEventListener('scroll', syncViewport)
  vv?.addEventListener('resize', syncViewport)
  window.addEventListener('orientationchange', syncViewport)
  document.addEventListener('focusin', syncViewport)
  document.addEventListener('focusout', onFocusOut)
  syncViewport()

  return () => {
    vv?.removeEventListener('scroll', syncViewport)
    vv?.removeEventListener('resize', syncViewport)
    window.removeEventListener('orientationchange', syncViewport)
    document.removeEventListener('focusin', syncViewport)
    document.removeEventListener('focusout', onFocusOut)
    window.clearTimeout(focusOutTimer)
    root.classList.remove('studio-standalone')
    root.style.removeProperty('--studio-vv-offset-top')
    root.style.removeProperty('--studio-vv-height')
  }
}
