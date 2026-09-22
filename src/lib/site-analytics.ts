import type { DeskPeriod } from '@/lib/bookings'
import { pb } from '@/lib/pocketbase'

export type SiteAnalyticsPath = {
  path: string
  views: number
}

export type SiteAnalytics = {
  available: boolean
  visits: number
  pageViews?: number
  topPaths: SiteAnalyticsPath[]
  period: DeskPeriod
}

export async function loadSiteAnalytics(period: DeskPeriod): Promise<SiteAnalytics> {
  try {
    const res = await pb.send<SiteAnalytics>('/api/ibrahim/site-analytics', {
      method: 'GET',
      query: { period },
    })
    return {
      available: !!res?.available,
      visits: Number(res?.visits) || 0,
      pageViews: Number(res?.pageViews) || 0,
      topPaths: Array.isArray(res?.topPaths) ? res.topPaths : [],
      period: res?.period || period,
    }
  } catch {
    return { available: false, visits: 0, pageViews: 0, topPaths: [], period }
  }
}
