import type { ClientResponseError } from 'pocketbase'

/** Prefer PocketBase field validation messages over generic "Failed to create record." */
export function pbErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  const err = error as Partial<ClientResponseError> & {
    response?: { message?: string; data?: Record<string, { message?: string }> }
    message?: string
  }
  const data = err.response?.data ?? (err as { data?: Record<string, { message?: string }> }).data
  if (data && typeof data === 'object') {
    const parts = Object.entries(data)
      .map(([field, info]) => {
        const msg = info?.message
        return msg ? `${field}: ${msg}` : null
      })
      .filter(Boolean)
    if (parts.length) return parts.join(' · ')
  }
  return err.response?.message || err.message || fallback
}

/**
 * Visitor-facing copy. Public pages must not relay backend field errors or
 * PocketBase phrasing, so this maps to a plain sentence and keeps the detail
 * in the console for us.
 */
/** Guest create succeeded but viewRule hides the row, so PocketBase returns 400. */
export function isGuestHiddenCreate(error: unknown): boolean {
  const err = error as {
    status?: number
    data?: Record<string, unknown>
    response?: { data?: Record<string, unknown>; message?: string }
    message?: string
  }
  if (err.status !== 400) return false
  const data = err.response?.data ?? err.data
  if (data && typeof data === 'object' && Object.keys(data).length > 0) return false
  const message = err.response?.message || err.message || ''
  return /failed to create record/i.test(message)
}

export function publicErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (import.meta.env.DEV) console.error(error)

  const status = (error as { status?: number } | null)?.status
  if (status === 404) return 'That content is not available.'
  if (status === 403) return 'That content is not available.'
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return 'You appear to be offline. Check your connection and try again.'
  }
  return fallback
}
