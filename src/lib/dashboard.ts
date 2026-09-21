import {
  type DeliveryFeedback,
  type DeliveryRecord,
  type FormInquiry,
  isDeliveryActive,
  listDeliveries,
  listFeedback,
  listInquiries,
} from '@/lib/clients'
import {
  type BookingRecord,
  type DeskFinance,
  type DeskPeriod,
  DESK_PERIODS,
  deskFinance,
  hasUnpaidBalance,
  hubBookings,
  inPeriod,
  listBookings,
  listMoneyChangedEvents,
  parseDeskPeriod,
  periodWindowStart,
  statusLabel,
} from '@/lib/bookings'
import { countMedia, countMediaCreatedSince } from '@/lib/library'
import { settleAll } from '@/lib/useAsyncData'

export { DESK_PERIODS, parseDeskPeriod, type DeskPeriod }

const PERIOD_KEY = 'studio-desk-period'
const EXPIRING_SOON_MS = 24 * 60 * 60 * 1000
const TODAY_HORIZON_MS = 7 * 24 * 60 * 60 * 1000

export function readDeskPeriod(): DeskPeriod {
  try {
    return parseDeskPeriod(localStorage.getItem(PERIOD_KEY))
  } catch {
    return '7d'
  }
}

export function writeDeskPeriod(period: DeskPeriod) {
  try {
    localStorage.setItem(PERIOD_KEY, period)
  } catch {
    /* ignore */
  }
}

export type DeskCount = {
  id: string
  label: string
  lifetime: number
  period: number
  href: string
}

export type DeskAttention = {
  unpaid: number
  requests: number
  unreadMessages: number
  unreadFeedback: number
  expiring: number
}

export type DeskShoot = {
  id: string
  name: string
  when: string
  status: string
  href: string
  isToday: boolean
}

export type DashboardPulse = {
  finance: DeskFinance
  counts: DeskCount[]
  attention: DeskAttention
  today: DeskShoot[]
  period: DeskPeriod
  periodLabel: string
  failed: string[]
}

function countCreated(rows: ReadonlyArray<{ created?: string }>, period: DeskPeriod) {
  let lifetime = rows.length
  let inWin = 0
  for (const r of rows) {
    if (inPeriod(r.created, period)) inWin += 1
  }
  return { lifetime, period: inWin }
}

function isExpiringSoon(d: DeliveryRecord) {
  if (!isDeliveryActive(d)) return false
  const ms = new Date(d.expires_at).getTime() - Date.now()
  return ms > 0 && ms <= EXPIRING_SOON_MS
}

function startOfLocalDay(now = Date.now()) {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function upcomingShoots(accepted: BookingRecord[], now = Date.now()): DeskShoot[] {
  const dayStart = startOfLocalDay(now)
  const horizon = now + TODAY_HORIZON_MS
  return accepted
    .filter((b) => {
      if (b.status !== 'pending' && b.status !== 'confirmed') return false
      if (!b.preferred_at) return false
      const t = new Date(b.preferred_at).getTime()
      return !Number.isNaN(t) && t >= dayStart && t <= horizon
    })
    .sort((a, b) => new Date(a.preferred_at!).getTime() - new Date(b.preferred_at!).getTime())
    .slice(0, 6)
    .map((b) => {
      const t = new Date(b.preferred_at!).getTime()
      return {
        id: b.id,
        name: b.expand?.person?.name?.trim() || 'Client',
        when: b.preferred_at!,
        status: statusLabel(b.status),
        href: `/studio/bookings?booking=${encodeURIComponent(b.id)}`,
        isToday: t >= dayStart && t < dayStart + 24 * 60 * 60 * 1000,
      }
    })
}

export async function loadDashboardPulse(period: DeskPeriod): Promise<DashboardPulse> {
  const windowStart = periodWindowStart(period)
  const { values, failed } = await settleAll({
    Bookings: listBookings,
    Deliveries: listDeliveries,
    Feedback: listFeedback,
    Inbox: listInquiries,
    MediaLifetime: countMedia,
    MediaPeriod: () => countMediaCreatedSince(windowStart ? windowStart.toISOString() : null),
    MoneyEvents: listMoneyChangedEvents,
  })

  if (failed.length >= 5) throw new Error('Could not reach Studio.')

  const bookings = values.Bookings ?? ([] as BookingRecord[])
  const deliveries = values.Deliveries ?? ([] as DeliveryRecord[])
  const feedback = values.Feedback ?? ([] as DeliveryFeedback[])
  const inquiries = values.Inbox ?? ([] as FormInquiry[])
  const moneyEvents = values.MoneyEvents ?? []
  const accepted = hubBookings(bookings)

  const finance = deskFinance(accepted, moneyEvents, period)

  const requests = bookings.filter((b) => b.status === 'needs_contact')
  const messages = inquiries.filter((i) => i.kind === 'contact')
  const unreadMessages = messages.filter((i) => i.payload?.inbox_read !== true)
  const feedbackInbox = inquiries.filter((i) => i.kind === 'feedback')
  const unreadFeedback = feedbackInbox.filter((i) => i.payload?.inbox_read !== true)
  const liveDeliveries = deliveries.filter(isDeliveryActive)

  const asDated = <T,>(rows: T[]) => rows as unknown as ReadonlyArray<{ created?: string }>
  const photosLifetime = values.MediaLifetime ?? 0
  const photosPeriod = period === 'all' ? photosLifetime : (values.MediaPeriod ?? 0)
  const del = countCreated(asDated(deliveries), period)
  const books = countCreated(asDated(accepted), period)
  const req = countCreated(asDated(requests), period)
  const msg = countCreated(asDated(messages), period)
  const fbLife = feedback.length
  const fbPeriod = asDated(feedback).filter((f) => inPeriod(f.created, period)).length
  const fbInboxPeriod = asDated(feedbackInbox).filter((f) => inPeriod(f.created, period)).length

  const periodMeta = DESK_PERIODS.find((p) => p.id === period)

  const attention: DeskAttention = {
    unpaid: accepted.filter(hasUnpaidBalance).length,
    requests: requests.length,
    unreadMessages: unreadMessages.length,
    unreadFeedback: unreadFeedback.length,
    expiring: deliveries.filter(isExpiringSoon).length,
  }

  const counts: DeskCount[] = [
    {
      id: 'photos',
      label: 'Photos',
      lifetime: photosLifetime,
      period: photosPeriod,
      href: '/studio/gallery',
    },
    {
      id: 'deliveries',
      label: 'Deliveries',
      lifetime: liveDeliveries.length,
      period: del.period,
      href: '/studio/clients?tab=deliveries',
    },
    {
      id: 'bookings',
      label: 'Bookings',
      lifetime: books.lifetime,
      period: books.period,
      href: '/studio/bookings',
    },
    {
      id: 'requests',
      label: 'Requests',
      lifetime: req.lifetime,
      period: req.period,
      href: '/studio/clients?tab=inbox',
    },
    {
      id: 'messages',
      label: 'Messages',
      lifetime: msg.lifetime,
      period: msg.period,
      href: '/studio/clients?tab=inbox&folder=messages',
    },
    {
      id: 'feedback',
      label: 'Feedback',
      lifetime: fbLife || feedbackInbox.length,
      period: fbPeriod || fbInboxPeriod,
      href: '/studio/clients?tab=feedback',
    },
  ]

  return {
    finance,
    counts,
    attention,
    today: upcomingShoots(accepted),
    period,
    periodLabel: periodMeta?.label ?? 'Last 7 days',
    failed,
  }
}
