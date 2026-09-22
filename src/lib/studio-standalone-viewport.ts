import { isStudioStandalone } from '@/lib/notice-channels'

/**
 * iOS home-screen Studio sometimes drifts the visual/layout viewport after
 * scrolls or taps: the shell looks pushed up until the app is force-quit.
 * Only attach in standalone — mobile Safari must keep the shared 100dvh shell.
 */
export function attachStudioStandaloneViewportGuard() {
  if (typeof window === 'undefined' || !isStudioStandalone()) return () => {}

  const root = document.documentElement
  root.classList.add('studio-standalone')

  function resetDrift() {
    if (window.scrollX !== 0 || window.scrollY !== 0) {
      window.scrollTo(0, 0)
    }
    if (root.scrollTop) root.scrollTop = 0
    if (document.body.scrollTop) document.body.scrollTop = 0

    const offsetTop = window.visualViewport?.offsetTop ?? 0
    // Counter the stuck visualViewport offset without changing shared layout height.
    root.style.setProperty('--studio-vv-top', offsetTop ? `${-offsetTop}px` : '0px')
  }

  const vv = window.visualViewport
  vv?.addEventListener('scroll', resetDrift)
  vv?.addEventListener('resize', resetDrift)
  window.addEventListener('scroll', resetDrift, true)
  window.addEventListener('orientationchange', resetDrift)
  window.addEventListener('touchend', resetDrift, { passive: true })
  window.addEventListener('focus', resetDrift)
  resetDrift()

  return () => {
    vv?.removeEventListener('scroll', resetDrift)
    vv?.removeEventListener('resize', resetDrift)
    window.removeEventListener('scroll', resetDrift, true)
    window.removeEventListener('orientationchange', resetDrift)
    window.removeEventListener('touchend', resetDrift)
    window.removeEventListener('focus', resetDrift)
    root.classList.remove('studio-standalone')
    root.style.removeProperty('--studio-vv-top')
  }
}
