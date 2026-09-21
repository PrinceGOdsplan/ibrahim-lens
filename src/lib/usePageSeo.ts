import { useEffect } from 'react'
import { getSeo } from '@/lib/website'

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

/**
 * Applies CMS-managed page metadata after load.
 *
 * This serves the browser and script-capable crawlers only — messaging apps do
 * not run JavaScript, so the baseline share tags in `index.html` are what they
 * read. Precedence: a caller-supplied title, then saved CMS title, then the
 * route fallback.
 */
export function usePageSeo(pageKey: string, fallbackTitle: string, overrideTitle?: string, overrideDescription?: string) {
  useEffect(() => {
    let cancelled = false

    const apply = (title: string, description?: string) => {
      if (cancelled) return
      document.title = title
      setMeta('meta[property="og:title"]', 'property', 'og:title', title)
      if (description) {
        setMeta('meta[name="description"]', 'name', 'description', description)
        setMeta('meta[property="og:description"]', 'property', 'og:description', description)
      }
      if (typeof window !== 'undefined') {
        const url = `${window.location.origin}${window.location.pathname}`
        setMeta('meta[property="og:url"]', 'property', 'og:url', url)
        setCanonical(url)
      }
    }

    apply(overrideTitle?.trim() || fallbackTitle, overrideDescription)

    getSeo(pageKey)
      .then((seo) => {
        apply(
          overrideTitle?.trim() || seo?.title?.trim() || fallbackTitle,
          overrideDescription?.trim() || seo?.description?.trim(),
        )
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [pageKey, fallbackTitle, overrideTitle, overrideDescription])
}
