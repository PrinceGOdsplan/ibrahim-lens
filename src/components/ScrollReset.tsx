import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/**
 * Places the visitor at the start of a new page.
 *
 * React Router's own `ScrollRestoration` needs a data router (`createBrowserRouter`),
 * which this app does not use, so the behaviour is implemented here:
 * - PUSH/REPLACE without a hash: top of the page
 * - any hash: scroll that element into view
 * - POP: left alone, so the browser restores the previous position
 */
export function ScrollReset() {
  const { pathname, hash } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (navigationType === 'POP') return

    if (hash) {
      // The target may mount a frame after the route does.
      const id = window.requestAnimationFrame(() => {
        document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' })
      })
      return () => window.cancelAnimationFrame(id)
    }

    if (document.documentElement.classList.contains('studio-lock-scroll')) return

    window.scrollTo(0, 0)
  }, [pathname, hash, navigationType])

  return null
}
