import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Keeps a hub's active tab in the address bar.
 *
 * Studio work is interrupted constantly — a reload, a shared link, or the back
 * button should land on the same tab rather than resetting to the first one.
 * Unknown values fall back to the default so a hand-edited URL cannot render
 * an empty hub.
 *
 * The write is a `replace`, so switching tabs does not fill the history stack
 * and Back still leaves the hub.
 */
export function useUrlTab<T extends string>(key: string, valid: readonly T[], fallback: T) {
  const [params, setParams] = useSearchParams()
  const raw = params.get(key)
  const tab = (raw && (valid as readonly string[]).includes(raw) ? raw : fallback) as T

  const setTab = useCallback(
    (next: T) => {
      setParams(
        (prev) => {
          const updated = new URLSearchParams(prev)
          if (next === fallback) updated.delete(key)
          else updated.set(key, next)
          return updated
        },
        { replace: true },
      )
    },
    [setParams, key, fallback],
  )

  return [tab, setTab] as const
}

/** Optional record id in the address bar (album / Work). Missing or empty means the collection wall. */
export function useUrlOptionalId(key: string) {
  const [params, setParams] = useSearchParams()
  const id = params.get(key)

  const setId = useCallback(
    (next: string | null) => {
      setParams(
        (prev) => {
          const updated = new URLSearchParams(prev)
          if (next) updated.set(key, next)
          else updated.delete(key)
          return updated
        },
        { replace: true },
      )
    },
    [setParams, key],
  )

  return [id, setId] as const
}

/**
 * One address-bar write. React Router does not compose several `setSearchParams`
 * in the same click, so room + album + Work must change together or the tab appears dead.
 */
export function usePatchSearchParams() {
  const [, setParams] = useSearchParams()

  return useCallback(
    (updates: Record<string, string | null>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [key, value] of Object.entries(updates)) {
            if (value) next.set(key, value)
            else next.delete(key)
          }
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )
}
