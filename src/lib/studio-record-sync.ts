import { useEffect } from 'react'

export type StudioRecordChange = { collection: string; id: string }

const handlers = new Set<(change: StudioRecordChange) => void>()

export function onStudioRecordChanged(handler: (change: StudioRecordChange) => void) {
  handlers.add(handler)
  return () => {
    handlers.delete(handler)
  }
}

export function emitStudioRecordChanged(change: StudioRecordChange) {
  handlers.forEach((handler) => handler(change))
}

/** Re-fetch a hub when Assistant writes a collection this screen shows. */
export function useStudioRecordRefresh(
  collections: readonly string[],
  onChange: (change: StudioRecordChange) => void,
) {
  const key = collections.join(',')
  useEffect(() => {
    const allowed = new Set(key.split(',').filter(Boolean))
    return onStudioRecordChanged((change) => {
      if (allowed.has(change.collection)) onChange(change)
    })
  }, [key, onChange])
}
