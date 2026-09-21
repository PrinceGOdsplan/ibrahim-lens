import type { RecordModel } from 'pocketbase'
import { pb } from '@/lib/pocketbase'
import { isGuestHiddenCreate, pbErrorMessage } from '@/lib/pb-error'
import { deliveriesForBooking } from '@/lib/clients'
import { formatNgn, normalizeNgPhone, type NgPhone } from '@/lib/phone'

export type BookingStatus =
  | 'needs_contact'
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'declined'
  | 'cancelled'

export const BOOKING_STATUSES: BookingStatus[] = [
  'needs_contact',
  'pending',
  'confirmed',
  'completed',
  'declined',
  'cancelled',
]

/** Statuses a hub booking can be set to. Unaccepted website mail is Inbox-only. */
export const HUB_BOOKING_STATUSES: BookingStatus[] = [
  'pending',
  'confirmed',
  'completed',
  'declined',
  'cancelled',
]

export function isUnacceptedBooking(b: Pick<BookingRecord, 'status'>) {
  return b.status === 'needs_contact'
}

export function hubBookings(bookings: BookingRecord[]) {
  return bookings.filter((b) => !isUnacceptedBooking(b))
}

export function unacceptedBookings(bookings: BookingRecord[]) {
  return bookings.filter(isUnacceptedBooking)
}

/** Fee not set yet — quiet hub alert, not a Collect queue. */
export function detailsIncomplete(b: Pick<BookingRecord, 'fee_ngn'>) {
  return !(Number(b.fee_ngn) > 0)
}

export type PaymentState = 'unpaid' | 'partial' | 'paid' | 'empty'

export type PersonRecord = RecordModel & {
  name: string
  phone_e164: string
  phone_digits: string
  email?: string
  notes?: string
}

export type BookingRecord = RecordModel & {
  person: string
  status: BookingStatus
  preferred_at?: string
  answers?: Record<string, unknown>
  studio_notes?: string
  fee_ngn?: number
  amount_paid_ngn?: number
  source?: string
  expand?: { person?: PersonRecord }
}

export type BookingEvent = RecordModel & {
  booking: string
  type: string
  actor?: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
}

export function statusLabel(status: BookingStatus): string {
  switch (status) {
    case 'needs_contact':
      return 'Unaccepted'
    case 'pending':
      return 'Pending'
    case 'confirmed':
      return 'Confirmed'
    case 'completed':
      return 'Completed'
    case 'declined':
      return 'Declined'
    case 'cancelled':
      return 'Cancelled'
    default:
      return status
  }
}

/** Soft money line: Paid ₦X of ₦Y */
export function paymentLine(b: Pick<BookingRecord, 'fee_ngn' | 'amount_paid_ngn'>): string {
  const fee = Number(b.fee_ngn) || 0
  const paid = Number(b.amount_paid_ngn) || 0
  if (fee <= 0 && paid <= 0) return 'No fee set yet'
  return `Paid ${formatNgn(paid)} of ${formatNgn(fee)}`
}

export function paymentState(b: Pick<BookingRecord, 'fee_ngn' | 'amount_paid_ngn'>): PaymentState {
  const fee = Number(b.fee_ngn) || 0
  const paid = Number(b.amount_paid_ngn) || 0
  if (fee <= 0 && paid <= 0) return 'empty'
  if (paid <= 0) return 'unpaid'
  if (fee > 0 && paid >= fee) return 'paid'
  if (fee <= 0 && paid > 0) return 'paid'
  return 'partial'
}

export function outstandingNgn(b: Pick<BookingRecord, 'fee_ngn' | 'amount_paid_ngn'>) {
  const fee = Number(b.fee_ngn) || 0
  const paid = Number(b.amount_paid_ngn) || 0
  return Math.max(0, fee - paid)
}

export type HubView = 'upcoming' | 'incomplete' | 'unpaid' | 'all'

export const HUB_VIEWS: { id: HubView; label: string }[] = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'incomplete', label: 'Incomplete' },
  { id: 'unpaid', label: 'Unpaid' },
  { id: 'all', label: 'All' },
]

export function parseHubView(raw: string | null): HubView {
  if (raw === 'incomplete' || raw === 'unpaid' || raw === 'all' || raw === 'upcoming') return raw
  return 'upcoming'
}

export function hasUnpaidBalance(b: Pick<BookingRecord, 'fee_ngn' | 'amount_paid_ngn'>) {
  return (Number(b.fee_ngn) || 0) > 0 && outstandingNgn(b) > 0
}

export function matchesHubView(b: BookingRecord, view: HubView) {
  if (view === 'upcoming') return b.status === 'pending' || b.status === 'confirmed'
  if (view === 'incomplete') return detailsIncomplete(b)
  if (view === 'unpaid') return hasUnpaidBalance(b)
  return true
}

export function compareBySchedule(a: BookingRecord, b: BookingRecord) {
  const parse = (iso?: string) => {
    if (!iso) return Number.POSITIVE_INFINITY
    const t = Date.parse(iso)
    return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t
  }
  const diff = parse(a.preferred_at) - parse(b.preferred_at)
  if (diff !== 0) return diff
  return a.created < b.created ? 1 : -1
}

export function filterHubView(bookings: BookingRecord[], view: HubView) {
  return bookings.filter((row) => matchesHubView(row, view)).sort(compareBySchedule)
}

/** Add a received amount to amount paid, never above the fee. */
export function applyReceivedPayment(b: Pick<BookingRecord, 'fee_ngn' | 'amount_paid_ngn'>, received: number) {
  const fee = Number(b.fee_ngn) || 0
  const paid = Number(b.amount_paid_ngn) || 0
  const add = Math.max(0, Number(received) || 0)
  if (fee <= 0) return paid
  return Math.min(fee, paid + add)
}

export { formatNgn }

export async function listPeople() {
  return pb.collection('people').getFullList<PersonRecord>({ sort: 'name' })
}

export async function findPersonByPhoneDigits(digits: string) {
  const list = await pb.collection('people').getList<PersonRecord>(1, 1, {
    filter: `phone_digits="${digits.replaceAll('"', '')}"`,
    query: { phone_digits: digits },
  })
  return list.items[0] ?? null
}

export async function upsertPerson(input: {
  name: string
  phone: string
  email?: string
  notes?: string
  trap?: string
}): Promise<PersonRecord> {
  const name = input.name.trim()
  if (!name) throw new Error('Name is required.')
  const phone = normalizeNgPhone(input.phone)
  if (!phone) throw new Error('Enter a valid Nigerian phone number.')

  const query = input.trap ? { hp: input.trap } : undefined
  const existing = await findPersonByPhoneDigits(phone.digits)
  try {
    if (existing) {
      // Public intake cannot update people (auth-only); reuse match as-is.
      if (!pb.authStore.isValid) return existing
      return await pb.collection('people').update<PersonRecord>(existing.id, {
        name,
        phone_e164: phone.e164,
        phone_digits: phone.digits,
        email: input.email?.trim() || existing.email || '',
        notes: input.notes !== undefined ? input.notes : existing.notes,
      })
    }
    return await pb.collection('people').create<PersonRecord>(
      {
        name,
        phone_e164: phone.e164,
        phone_digits: phone.digits,
        email: input.email?.trim() || '',
        notes: input.notes?.trim() || '',
      },
      query ? { query } : undefined,
    )
  } catch (error) {
    throw new Error(pbErrorMessage(error, 'Could not save person.'))
  }
}

export async function updatePerson(
  id: string,
  data: Partial<{ name: string; phone: string; email: string; notes: string }>,
) {
  const patch: Record<string, unknown> = {}
  if (data.name !== undefined) patch.name = data.name.trim()
  if (data.email !== undefined) patch.email = data.email.trim()
  if (data.notes !== undefined) patch.notes = data.notes
  if (data.phone !== undefined) {
    const phone = normalizeNgPhone(data.phone)
    if (!phone) throw new Error('Enter a valid Nigerian phone number.')
    patch.phone_e164 = phone.e164
    patch.phone_digits = phone.digits
  }
  try {
    return await pb.collection('people').update<PersonRecord>(id, patch)
  } catch (error) {
    throw new Error(pbErrorMessage(error, 'Could not update person.'))
  }
}

async function appendEvent(
  bookingId: string,
  type: string,
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
) {
  const actor = pb.authStore.record?.email || pb.authStore.record?.id || 'public'
  try {
    await pb.collection('booking_events').create({
      booking: bookingId,
      type,
      actor: String(actor),
      before: before ?? {},
      after: after ?? {},
    })
  } catch {
    // audit best-effort on public path
  }
}

function snapshot(b: BookingRecord): Record<string, unknown> {
  return {
    status: b.status,
    preferred_at: b.preferred_at ?? '',
    studio_notes: b.studio_notes ?? '',
    fee_ngn: b.fee_ngn ?? 0,
    amount_paid_ngn: b.amount_paid_ngn ?? 0,
    person: b.person,
  }
}

export async function listBookings() {
  return pb.collection('bookings').getFullList<BookingRecord>({
    sort: '-created',
    expand: 'person',
  })
}

export async function listBookingsForPerson(personId: string) {
  return pb.collection('bookings').getFullList<BookingRecord>({
    filter: `person="${personId}"`,
    sort: '-created',
    expand: 'person',
  })
}

export async function listBookingEvents(bookingId: string) {
  return pb.collection('booking_events').getFullList<BookingEvent>({
    filter: `booking="${bookingId}"`,
    sort: '-created',
  })
}

type CreateBookingInput = {
  personId?: string
  name?: string
  phone?: string
  email?: string
  status?: BookingStatus
  preferredAt?: string
  answers?: Record<string, unknown>
  studioNotes?: string
  feeNgn?: number
  amountPaidNgn?: number
  source?: string
  trap?: string
}

/**
 * Writes the person + booking rows and returns the created record as the server
 * echoed it back. Callers that need `expand.person` re-read it themselves, because
 * `bookings.viewRule` requires auth and visitors cannot read their own booking.
 */
async function createBookingRecord(input: CreateBookingInput, auditIsBestEffort = false) {
  let personId = input.personId
  if (!personId) {
    if (!input.name || !input.phone) throw new Error('Person or name + phone is required.')
    const person = await upsertPerson({
      name: input.name,
      phone: input.phone,
      email: input.email,
      trap: input.trap,
    })
    personId = person.id
  }

  const status = input.status ?? 'needs_contact'
  let record: BookingRecord
  try {
    record = await pb.collection('bookings').create<BookingRecord>(
      {
        person: personId,
        status,
        preferred_at: input.preferredAt ?? '',
        answers: input.answers ?? {},
        studio_notes: input.studioNotes ?? '',
        fee_ngn: input.feeNgn ?? 0,
        amount_paid_ngn: input.amountPaidNgn ?? 0,
        source: input.source ?? 'manual',
      },
      input.trap ? { query: { hp: input.trap } } : undefined,
    )
  } catch (error) {
    throw new Error(pbErrorMessage(error, 'Could not create booking.'))
  }

  // The booking now exists. An audit-trail failure must not be reported to a
  // visitor as a failed request, or they will submit again and duplicate it.
  try {
    await appendEvent(record.id, 'created', null, snapshot(record))
  } catch (error) {
    if (!auditIsBestEffort) throw new Error(pbErrorMessage(error, 'Could not create booking.'))
  }

  return record
}

export async function createBooking(input: CreateBookingInput) {
  const record = await createBookingRecord(input)
  return pb.collection('bookings').getOne<BookingRecord>(record.id, { expand: 'person' })
}

export async function updateBooking(
  id: string,
  patch: Partial<{
    status: BookingStatus
    preferred_at: string
    studio_notes: string
    fee_ngn: number
    amount_paid_ngn: number
    person: string
    answers: Record<string, unknown>
  }>,
) {
  const before = await pb.collection('bookings').getOne<BookingRecord>(id)
  try {
    const after = await pb.collection('bookings').update<BookingRecord>(id, patch)
    const b = snapshot(before)
    const a = snapshot(after)
    const changed = Object.keys(a).some((k) => JSON.stringify(b[k]) !== JSON.stringify(a[k]))
    if (changed) {
      let type = 'updated'
      if (b.status !== a.status) type = 'status_changed'
      else if (b.fee_ngn !== a.fee_ngn || b.amount_paid_ngn !== a.amount_paid_ngn) type = 'money_changed'
      else if (b.person !== a.person) type = 'person_changed'
      else if (b.studio_notes !== a.studio_notes) type = 'note_changed'
      await appendEvent(id, type, b, a)
    }
    return pb.collection('bookings').getOne<BookingRecord>(id, { expand: 'person' })
  } catch (error) {
    throw new Error(pbErrorMessage(error, 'Could not update booking.'))
  }
}

export async function removeBooking(bookingId: string) {
  let blockers
  try {
    blockers = await deliveriesForBooking(bookingId)
  } catch (error) {
    throw new Error(pbErrorMessage(error, 'Could not check whether a delivery still references this booking.'))
  }
  const blocker = blockers[0]
  if (blocker) {
    const who = blocker.client_name?.trim() || 'a client'
    throw new Error(`Cannot remove this booking while a delivery for ${who} still references it.`)
  }
  try {
    await pb.collection('bookings').delete(bookingId)
  } catch (error) {
    throw new Error(pbErrorMessage(error, 'Could not remove this booking.'))
  }
}

/** Public booking form → server upserts Person and creates needs_contact Booking */
export async function submitPublicBooking(input: {
  name: string
  phone: string
  email?: string
  preferredAt: string
  answers: Record<string, unknown>
  trap?: string
}) {
  const phone = normalizeNgPhone(input.phone)
  if (!phone) throw new Error('Enter a valid Nigerian phone number.')
  const name = input.name.trim()
  if (!name) throw new Error('Name is required.')

  const query: Record<string, string> = {
    guest_name: name,
    guest_phone: phone.e164,
    guest_email: input.email?.trim() || '',
  }
  if (input.trap) query.hp = input.trap

  try {
    return await pb.collection('bookings').create<BookingRecord>(
      {
        status: 'needs_contact',
        preferred_at: input.preferredAt,
        answers: {
          ...(input.answers ?? {}),
          _guest_name: name,
          _guest_phone: phone.e164,
          _guest_email: input.email?.trim() || '',
        },
        studio_notes: '',
        fee_ngn: 0,
        amount_paid_ngn: 0,
        source: 'website',
      },
      { query },
    )
  } catch (error) {
    if (isGuestHiddenCreate(error)) {
      return {
        id: '',
        status: 'needs_contact',
        source: 'website',
        preferred_at: input.preferredAt,
        answers: input.answers ?? {},
      } as BookingRecord
    }
    throw new Error(pbErrorMessage(error, 'Could not create booking.'))
  }
}

export function financeSummary(bookings: BookingRecord[]) {
  const open = bookings.filter((b) => b.status === 'confirmed' || b.status === 'completed')
  let paidPeriod = 0
  let outstanding = 0
  for (const b of bookings) {
    paidPeriod += Number(b.amount_paid_ngn) || 0
  }
  for (const b of open) {
    outstanding += outstandingNgn(b)
  }
  return { paidPeriod, outstanding, formatNgn }
}

export type DeskPeriod = '24h' | '7d' | '30d' | 'all'

export const DESK_PERIODS: { id: DeskPeriod; label: string; short: string }[] = [
  { id: '24h', label: 'Last 24 hours', short: '24h' },
  { id: '7d', label: 'Last 7 days', short: '7d' },
  { id: '30d', label: 'Last 30 days', short: '30d' },
  { id: 'all', label: 'All time', short: 'All' },
]

export function parseDeskPeriod(raw: string | null | undefined): DeskPeriod {
  if (raw === '24h' || raw === '7d' || raw === '30d' || raw === 'all') return raw
  return '7d'
}

export function periodWindowStart(period: DeskPeriod, now = Date.now()): Date | null {
  if (period === 'all') return null
  const ms =
    period === '24h' ? 24 * 3600 * 1000 : period === '7d' ? 7 * 24 * 3600 * 1000 : 30 * 24 * 3600 * 1000
  return new Date(now - ms)
}

export function inPeriod(iso: string | undefined | null, period: DeskPeriod, now = Date.now()) {
  if (!iso) return false
  if (period === 'all') return true
  const start = periodWindowStart(period, now)
  if (!start) return true
  const t = new Date(iso).getTime()
  return !Number.isNaN(t) && t >= start.getTime() && t <= now
}

export type DeskFinance = {
  totalEarned: number
  collectedPeriod: number
  bookedPeriod: number
  outstanding: number
}

/** Lifetime collected + period collected (payment deltas) + booked fees + outstanding now. */
export function deskFinance(
  hubBookingsList: BookingRecord[],
  moneyEvents: BookingEvent[],
  period: DeskPeriod,
  now = Date.now(),
): DeskFinance {
  let totalEarned = 0
  for (const b of hubBookingsList) {
    totalEarned += Number(b.amount_paid_ngn) || 0
  }
  const { outstanding } = financeSummary(hubBookingsList)

  let collectedPeriod = 0
  const bookedIds = new Set<string>()
  let bookedPeriod = 0

  for (const ev of moneyEvents) {
    if (ev.type !== 'money_changed') continue
    if (!inPeriod(ev.created as string | undefined, period, now)) continue
    const before = (ev.before ?? {}) as { amount_paid_ngn?: number; fee_ngn?: number }
    const after = (ev.after ?? {}) as { amount_paid_ngn?: number; fee_ngn?: number }
    const paidBefore = Number(before.amount_paid_ngn) || 0
    const paidAfter = Number(after.amount_paid_ngn) || 0
    collectedPeriod += Math.max(0, paidAfter - paidBefore)

    const feeBefore = Number(before.fee_ngn) || 0
    const feeAfter = Number(after.fee_ngn) || 0
    if (feeBefore <= 0 && feeAfter > 0 && !bookedIds.has(ev.booking)) {
      bookedIds.add(ev.booking)
      bookedPeriod += feeAfter
    }
  }

  // Hub bookings created in window that already had a fee (e.g. manual create) and no money_changed yet
  for (const b of hubBookingsList) {
    if (!inPeriod(b.created as string | undefined, period, now)) continue
    const fee = Number(b.fee_ngn) || 0
    if (fee <= 0 || bookedIds.has(b.id)) continue
    bookedIds.add(b.id)
    bookedPeriod += fee
  }

  if (period === 'all') {
    collectedPeriod = totalEarned
    bookedPeriod = hubBookingsList.reduce((sum, b) => sum + (Number(b.fee_ngn) || 0), 0)
  }

  return { totalEarned, collectedPeriod, bookedPeriod, outstanding }
}

export async function listMoneyChangedEvents() {
  try {
    return await pb.collection('booking_events').getFullList<BookingEvent>({
      filter: 'type="money_changed"',
      sort: '-created',
    })
  } catch {
    return [] as BookingEvent[]
  }
}

export function parsePhoneForForm(person?: PersonRecord | null): NgPhone | null {
  if (!person?.phone_e164) return null
  return normalizeNgPhone(person.phone_e164)
}
