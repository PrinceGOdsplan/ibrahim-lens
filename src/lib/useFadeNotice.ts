import { useEffect, useState } from 'react'

/** In-place success copy that fades. Errors stay until the next write. */
export function useFadeNotice(ms = 4000) {
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!message) return
    const id = window.setTimeout(() => setMessage(null), ms)
    return () => window.clearTimeout(id)
  }, [message, ms])

  return { message, setMessage, error, setError }
}
