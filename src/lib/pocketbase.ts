import PocketBase from 'pocketbase'

const url = import.meta.env.VITE_POCKETBASE_URL ?? 'http://127.0.0.1:8090'

export const pb = new PocketBase(url)
// Studio hubs fire several lists at once (often the same collection).
pb.autoCancellation(false)

// After a large local library, PocketBase COUNT for totalItems 400s every getList.
// Default to skipTotal; callers that need a count pass skipTotal: false.
const collection = pb.collection.bind(pb)
pb.collection = ((id: string) => {
  const col = collection(id)
  const getList = col.getList.bind(col)
  col.getList = ((page: number, perPage = 30, options?: Record<string, unknown>) => {
    const skipTotal = options?.skipTotal !== false
    return getList(page, perPage, { ...options, skipTotal })
  }) as typeof col.getList
  return col
}) as typeof pb.collection

export function getPocketBaseUrl() {
  return url
}
