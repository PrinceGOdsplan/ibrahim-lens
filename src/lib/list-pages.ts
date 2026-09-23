import { pb } from '@/lib/pocketbase'

export const STUDIO_LIST_PAGE = 100
/** Dashboard pulse and similar aggregate views stay bounded. */
export const STUDIO_DASHBOARD_CAP = 400

type ListOptions = Record<string, unknown>

/**
 * Collect records via getList pages (skipTotal) instead of getFullList.
 * Stops when a short page arrives or `maxItems` is reached.
 */
export async function listCollected<T>(
  collection: string,
  options: ListOptions = {},
  opts?: { pageSize?: number; maxItems?: number },
): Promise<T[]> {
  const pageSize = opts?.pageSize ?? STUDIO_LIST_PAGE
  const maxItems = opts?.maxItems ?? pageSize * 50
  const out: T[] = []
  for (let page = 1; out.length < maxItems; page++) {
    const take = Math.min(pageSize, maxItems - out.length)
    const result = await pb.collection(collection).getList<T>(page, take, options)
    out.push(...result.items)
    if (result.items.length < take) break
  }
  return out
}

export async function listPage<T>(
  collection: string,
  page: number,
  pageSize: number,
  options: ListOptions = {},
) {
  const result = await pb.collection(collection).getList<T>(page, pageSize, options)
  return {
    items: result.items,
    page: result.page,
    perPage: result.perPage,
    hasMore: result.items.length >= pageSize,
  }
}
