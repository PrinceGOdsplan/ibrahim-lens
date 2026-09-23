import {
  type DeliveryRecord,
  type FormInquiry,
  isDeliveryActive,
  listFeedback,
} from '@/lib/clients'
import {
  type BookingEvent,
  type BookingRecord,
  type DeskFinance,
  type DeskPeriod,
  DESK_PERIODS,
  deskFinance,
  hasUnpaidBalance,
  hubBookings,
  inPeriod,
  listMoneyChangedEvents,
  outstandingNgn,
  parseDeskPeriod,
  periodWindowStart,
  statusLabel,
} from '@/lib/bookings'
import { formatDateTime } from '@/lib/format'
import { listMediaPage } from '@/lib/library'
import { listCollected, STUDIO_DASHBOARD_CAP } from '@/lib/list-pages'
import { pb } from '@/lib/pocketbase'
import { settleAll } from '@/lib/useAsyncData'

export { DESK_PERIODS, parseDeskPeriod, type DeskPeriod }

const PERIOD_KEY = 'studio-desk-period'
const EXPIRING_SOON_MS = 24 * 60 * 60 * 1000
const TODAY_HORIZON_MS = 7 * 24 * 60 * 60 * 1000
const FRAMES_PER_PAGE = 12
const NEEDS_YOU_CAP = 6

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

export type DeskMoneyPoint = {
  label: string
  value: number
  iso?: string
}

export type DeskMicro = {
  collectionPct: number | null
  booked: number
  outstanding: number
  avgFee: number | null
}

export type DeskMix = {
  pending: number
  confirmed: number
  unpaid: number
}

export type DeskFunnel = {
  requests: number
  accepted: number
  paid: number
  delivered: number
  feedback: number
}

export type DeskNeedsYou = {
  id: string
  name: string
  when: string
  reason: string
  href: string
  /** Outstanding ₦ when the row is a payment due item. */
  amountNgn?: number
}

export type DeskToday = {
  name: string
  when: string
  status: string
  href: string
} | null

export type DeskCollectedDelta = {
  priorCollected: number
  pct: number | null
} | null

export type DashboardPulse = {
  finance: DeskFinance
  moneySeries: DeskMoneyPoint[]
  volumeSeries: DeskMoneyPoint[]
  collectedDelta: DeskCollectedDelta
  micro: DeskMicro
  pipelineMix: DeskMix
  funnel: DeskFunnel
  attention: DeskAttention
  today: DeskToday
  needsYou: DeskNeedsYou[]
  week: DeskShootDay[]
  frames: { id: string; thumb: string; href: string }[]
  period: DeskPeriod
  periodLabel: string
  failed: string[]
}

export type DeskShootDay = {
  weekday: string
  day: string
  today: boolean
  shoots: DeskShoot[]
}

function startOfLocalDay(now = Date.now()) {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

function formatMoneyPointLabel(period: DeskPeriod, date: Date) {
  if (period === 'all') {
    return date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
  }
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })
}

function emptyBuckets(period: DeskPeriod, now = Date.now()) {
  const buckets = new Map<string, { date: Date; value: number }>()
  if (period === 'all') {
    const end = new Date(now)
    for (let i = 11; i >= 0; i--) {
      const d = new Date(end.getFullYear(), end.getMonth() - i, 1)
      buckets.set(isoDate(d).slice(0, 7), { date: d, value: 0 })
    }
    return buckets
  }
  const days = period === '7d' ? 7 : 30
  const dayStart = startOfLocalDay(now)
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(dayStart - i * 24 * 60 * 60 * 1000)
    buckets.set(isoDate(d), { date: d, value: 0 })
  }
  return buckets
}

function bucketKey(period: DeskPeriod, iso: string) {
  return period === 'all' ? iso.slice(0, 7) : iso.slice(0, 10)
}

function bucketMoneySeries(
  events: BookingEvent[],
  period: DeskPeriod,
  now = Date.now(),
): DeskMoneyPoint[] {
  const buckets = emptyBuckets(period, now)
  for (const ev of events) {
    if (ev.type !== 'money_changed') continue
    const created = ev.created as string | undefined
    if (!created) continue
    const key = bucketKey(period, created)
    const bucket = buckets.get(key)
    if (!bucket) continue
    const before = (ev.before ?? {}) as { amount_paid_ngn?: number }
    const after = (ev.after ?? {}) as { amount_paid_ngn?: number }
    bucket.value += Math.max(0, Number(after.amount_paid_ngn) - Number(before.amount_paid_ngn))
  }
  return Array.from(buckets.entries()).map(([key, { date, value }]) => ({
    label: formatMoneyPointLabel(period, date),
    value,
    iso: key,
  }))
}

function bucketVolumeSeries(bookings: BookingRecord[], period: DeskPeriod, now = Date.now()): DeskMoneyPoint[] {
  const buckets = emptyBuckets(period, now)
  for (const b of bookings) {
    const created = b.created as string | undefined
    if (!created) continue
    const key = bucketKey(period, created)
    const bucket = buckets.get(key)
    if (!bucket) continue
    bucket.value += 1
  }
  return Array.from(buckets.entries()).map(([key, { date, value }]) => ({
    label: formatMoneyPointLabel(period, date),
    value,
    iso: key,
  }))
}

function collectedInWindow(events: BookingEvent[], from: number, to: number) {
  let sum = 0
  for (const ev of events) {
    if (ev.type !== 'money_changed') continue
    const created = ev.created as string | undefined
    if (!created) continue
    const t = new Date(created).getTime()
    if (Number.isNaN(t) || t < from || t > to) continue
    const before = (ev.before ?? {}) as { amount_paid_ngn?: number }
    const after = (ev.after ?? {}) as { amount_paid_ngn?: number }
    sum += Math.max(0, Number(after.amount_paid_ngn) - Number(before.amount_paid_ngn))
  }
  return sum
}

function collectedDelta(
  events: BookingEvent[],
  period: DeskPeriod,
  collectedPeriod: number,
  now = Date.now(),
): DeskCollectedDelta {
  if (period === 'all') return null
  const start = periodWindowStart(period, now)
  if (!start) return null
  const windowMs = now - start.getTime()
  const priorTo = start.getTime()
  const priorFrom = priorTo - windowMs
  const priorCollected = collectedInWindow(events, priorFrom, priorTo)
  const pct =
    priorCollected > 0
      ? Math.round(((collectedPeriod - priorCollected) / priorCollected) * 100)
      : collectedPeriod > 0
        ? null
        : 0
  return { priorCollected, pct }
}

function firstName(full?: string) {
  if (!full) return 'Client'
  return full.trim().split(/\s+/)[0] || 'Client'
}

function upcomingShootDays(accepted: BookingRecord[], now = Date.now()): DeskShootDay[] {
  const dayStart = startOfLocalDay(now)
  const horizon = now + TODAY_HORIZON_MS
  const shootDayStart = dayStart + 24 * 60 * 60 * 1000

  const days: DeskShootDay[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(dayStart + i * 24 * 60 * 60 * 1000)
    days.push({
      weekday: d.toLocaleDateString('en-GB', { weekday: 'short' }),
      day: d.toLocaleDateString('en-GB', { day: 'numeric' }),
      today: i === 0,
      shoots: [],
    })
  }

  const shoots = accepted
    .filter((b) => {
      if (b.status !== 'pending' && b.status !== 'confirmed') return false
      if (!b.preferred_at) return false
      const t = new Date(b.preferred_at).getTime()
      return !Number.isNaN(t) && t >= dayStart && t <= horizon
    })
    .sort((a, b) => new Date(a.preferred_at!).getTime() - new Date(b.preferred_at!).getTime())

  for (const b of shoots) {
    const t = new Date(b.preferred_at!).getTime()
    const dayIndex = Math.floor((t - dayStart) / (24 * 60 * 60 * 1000))
    if (dayIndex < 0 || dayIndex >= 7) continue
    const whenTime = new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
    days[dayIndex].shoots.push({
      id: b.id,
      name: firstName(b.expand?.person?.name),
      when: whenTime,
      status: statusLabel(b.status),
      href: `/studio/bookings?booking=${encodeURIComponent(b.id)}`,
      isToday: t >= dayStart && t < shootDayStart,
    })
  }

  return days
}

function isExpiringSoon(d: DeliveryRecord) {
  if (!isDeliveryActive(d)) return false
  const ms = new Date(d.expires_at).getTime() - Date.now()
  return ms > 0 && ms <= EXPIRING_SOON_MS
}

function buildNeedsYou(
  accepted: BookingRecord[],
  requests: BookingRecord[],
  deliveries: DeliveryRecord[],
  unreadMessages: FormInquiry[],
  unreadFeedback: FormInquiry[],
): DeskNeedsYou[] {
  const rows: DeskNeedsYou[] = []

  for (const b of accepted.filter(hasUnpaidBalance)) {
    rows.push({
      id: `unpaid-${b.id}`,
      name: firstName(b.expand?.person?.name),
      when: b.preferred_at ? formatDateTime(b.preferred_at) : formatDateTime(b.created),
      reason: 'Payment due',
      href: `/studio/bookings?booking=${encodeURIComponent(b.id)}`,
      amountNgn: outstandingNgn(b),
    })
  }
  for (const b of requests) {
    rows.push({
      id: `request-${b.id}`,
      name: firstName(b.expand?.person?.name),
      when: formatDateTime(b.created),
      reason: 'New request',
      href: `/studio/clients?tab=inbox&booking=${encodeURIComponent(b.id)}`,
    })
  }
  for (const d of deliveries.filter(isExpiringSoon)) {
    rows.push({
      id: `expiring-${d.id}`,
      name: firstName(d.expand?.person?.name || d.client_name),
      when: formatDateTime(d.expires_at),
      reason: 'Delivery expiring',
      href: `/studio/clients?tab=deliveries&delivery=${encodeURIComponent(d.id)}`,
    })
  }
  for (const m of unreadMessages) {
    const name =
      typeof m.payload?.name === 'string'
        ? firstName(m.payload.name)
        : firstName(undefined)
    rows.push({
      id: `msg-${m.id}`,
      name,
      when: formatDateTime(m.created),
      reason: 'Unread message',
      href: `/studio/clients?tab=inbox&folder=messages`,
    })
  }
  for (const f of unreadFeedback) {
    rows.push({
      id: `fb-${f.id}`,
      name: firstName(typeof f.payload?.name === 'string' ? f.payload.name : undefined),
      when: formatDateTime(f.created),
      reason: 'New feedback',
      href: `/studio/clients?tab=feedback&feedback=${encodeURIComponent(f.id)}`,
    })
  }

  return rows.slice(0, NEEDS_YOU_CAP)
}

export async function loadDashboardPulse(period: DeskPeriod): Promise<DashboardPulse> {
  const { values, failed } = await settleAll({
    Bookings: () =>
      listCollected<BookingRecord>(
        'bookings',
        { sort: '-created', expand: 'person' },
        { maxItems: STUDIO_DASHBOARD_CAP },
      ),
    Deliveries: () =>
      listCollected<DeliveryRecord>('deliveries', { sort: '-created' }, { maxItems: STUDIO_DASHBOARD_CAP }),
    Feedback: listFeedback,
    Inbox: () =>
      listCollected<FormInquiry>('form_inquiries', { sort: '-created' }, { maxItems: STUDIO_DASHBOARD_CAP }),
    Frames: () =>
      listMediaPage({ page: 1, vault: 'gallery', sort: 'date', perPage: FRAMES_PER_PAGE }),
    MoneyEvents: listMoneyChangedEvents,
  })

  if (failed.length >= 5) throw new Error('Could not reach Studio.')

  const bookings = values.Bookings ?? ([] as BookingRecord[])
  const deliveries = values.Deliveries ?? ([] as DeliveryRecord[])
  const inquiries = values.Inbox ?? ([] as FormInquiry[])
  const moneyEvents = values.MoneyEvents ?? []
  const frames = values.Frames ?? { items: [] }
  const accepted = hubBookings(bookings)

  const finance = deskFinance(accepted, moneyEvents, period)
  const moneySeries = bucketMoneySeries(moneyEvents, period)
  const volumeSeries = bucketVolumeSeries(accepted, period)
  const delta = collectedDelta(moneyEvents, period, finance.collectedPeriod)

  const requests = bookings.filter((b) => b.status === 'needs_contact')
  const messages = inquiries.filter((i) => i.kind === 'contact')
  const unreadMessages = messages.filter((i) => i.payload?.inbox_read !== true)
  const feedbackInbox = inquiries.filter((i) => i.kind === 'feedback')
  const unreadFeedback = feedbackInbox.filter((i) => i.payload?.inbox_read !== true)

  const attention: DeskAttention = {
    unpaid: accepted.filter(hasUnpaidBalance).length,
    requests: requests.length,
    unreadMessages: unreadMessages.length,
    unreadFeedback: unreadFeedback.length,
    expiring: deliveries.filter(isExpiringSoon).length,
  }

  const fees = accepted.map((b) => Number(b.fee_ngn) || 0).filter((n) => n > 0)
  const avgFee = fees.length ? Math.round(fees.reduce((a, b) => a + b, 0) / fees.length) : null
  const collectionPct =
    finance.bookedPeriod > 0
      ? Math.min(100, Math.round((finance.collectedPeriod / finance.bookedPeriod) * 100))
      : finance.collectedPeriod > 0
        ? 100
        : null

  const micro: DeskMicro = {
    collectionPct,
    booked: finance.bookedPeriod,
    outstanding: finance.outstanding,
    avgFee,
  }

  const pipelineMix: DeskMix = {
    pending: accepted.filter((b) => b.status === 'pending').length,
    confirmed: accepted.filter((b) => b.status === 'confirmed').length,
    unpaid: attention.unpaid,
  }

  const funnel: DeskFunnel = {
    requests: requests.filter((b) => inPeriod(b.created as string | undefined, period)).length,
    accepted: accepted.filter((b) => inPeriod(b.created as string | undefined, period)).length,
    paid: accepted.filter(
      (b) => (Number(b.amount_paid_ngn) || 0) > 0 && inPeriod(b.created as string | undefined, period),
    ).length,
    delivered: deliveries.filter((d) => inPeriod(d.created as string | undefined, period)).length,
    feedback: feedbackInbox.filter((f) => inPeriod(f.created as string | undefined, period)).length,
  }

  const periodMeta = DESK_PERIODS.find((p) => p.id === period)
  const week = upcomingShootDays(accepted)
  const todayShoot = week.find((d) => d.today)?.shoots[0] ?? null
  const today: DeskToday = todayShoot
    ? {
        name: todayShoot.name,
        when: todayShoot.when,
        status: todayShoot.status,
        href: todayShoot.href,
      }
    : null

  return {
    finance,
    moneySeries,
    volumeSeries,
    collectedDelta: delta,
    micro,
    pipelineMix,
    funnel,
    attention,
    today,
    needsYou: buildNeedsYou(accepted, requests, deliveries, unreadMessages, unreadFeedback),
    week,
    frames: frames.items.map((m) => ({
      id: m.id,
      thumb: m.file ? `${pb.baseUrl}/api/files/${m.collectionId}/${m.id}/${m.file}?thumb=200x200` : '',
      href: '/studio/gallery',
    })),
    period,
    periodLabel: periodMeta?.label ?? 'Last 7 days',
    failed,
  }
}
