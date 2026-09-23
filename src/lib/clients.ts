import type { RecordModel } from 'pocketbase'
import { pb } from '@/lib/pocketbase'
import { pbErrorMessage } from '@/lib/pb-error'
import { listMediaByIds, type AlbumRecord, type MediaRecord, type WorkRecord } from '@/lib/library'
import type { PersonRecord } from '@/lib/bookings'
import { createTestimonial } from '@/lib/website'
import { listCollected, listPage } from '@/lib/list-pages'

export const DELIVERY_TTL_MS = 7 * 24 * 60 * 60 * 1000

export type DeliverySource = 'images' | 'albums' | 'work'

export type DeliveryRecord = RecordModel & {
  token: string
  /** Public share path segment; prefer over token in `/g/:code` links. */
  short_code?: string
  client_name: string
  client_email?: string
  source_type: DeliverySource
  images: string[]
  albums: string[]
  work: string
  person?: string
  booking?: string
  studio_notes?: string
  expires_at: string
  revoked: boolean
  expand?: {
    images?: MediaRecord[]
    albums?: AlbumRecord[]
    work?: WorkRecord
    person?: PersonRecord
  }
}

export type DeliveryFeedback = RecordModel & {
  delivery: string
  message: string
  selected_images: string[]
  client_name?: string
  reviewed: boolean
  promoted: boolean
  expand?: {
    delivery?: DeliveryRecord
    selected_images?: MediaRecord[]
  }
}

export type InquiryKind = 'contact' | 'booking' | 'feedback' | 'delivery_event'
export type BookingStatus = 'pending' | 'confirmed' | 'needs_contact'

export type FormInquiry = RecordModel & {
  kind: string
  payload: Record<string, unknown>
}

export function inquiryBookingStatus(item: FormInquiry): BookingStatus {
  const raw = item.payload?.booking_status
  if (raw === 'confirmed' || raw === 'needs_contact' || raw === 'pending') return raw
  return 'pending'
}

export function deliveryExpiresAt(from = new Date()) {
  return new Date(from.getTime() + DELIVERY_TTL_MS).toISOString()
}

export function isDeliveryActive(d: Pick<DeliveryRecord, 'expires_at' | 'revoked'>) {
  if (d.revoked) return false
  return new Date(d.expires_at).getTime() > Date.now()
}

/** Prefer short share code when present; string arg kept for older call sites. */
export function deliveryPublicUrl(delivery: Pick<DeliveryRecord, 'token' | 'short_code'> | string) {
  const code =
    typeof delivery === 'string' ? delivery : delivery.short_code?.trim() || delivery.token
  return `${window.location.origin}/g/${code}`
}

export function formatTimeRemaining(expiresAt: string) {
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return 'Expired'
  const days = Math.floor(ms / (24 * 60 * 60 * 1000))
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const mins = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))
  if (days > 0) return `${days}d ${hours}h remaining`
  if (hours > 0) return `${hours}h ${mins}m remaining`
  return `${mins}m remaining`
}

function randomToken() {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

/** Unambiguous alphabet (no 0/O/1/l/I) for short share codes. */
const SHORT_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

export function randomShortCode(length = 8) {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  let out = ''
  for (let i = 0; i < length; i++) out += SHORT_ALPHABET[bytes[i]! % SHORT_ALPHABET.length]
  return out
}

async function resolveImageIds(input: {
  sourceType: DeliverySource
  imageIds?: string[]
  albumIds?: string[]
  workId?: string
}) {
  if (input.sourceType === 'images') {
    const ids = Array.from(new Set(input.imageIds ?? []))
    if (!ids.length) throw new Error('Select at least one image.')
    return ids
  }
  if (input.sourceType === 'albums') {
    const albumIds = Array.from(new Set(input.albumIds ?? []))
    if (!albumIds.length) throw new Error('Select at least one album.')
    const albums = await Promise.all(
      albumIds.map((id) => pb.collection('albums').getOne<AlbumRecord>(id)),
    )
    const ids = Array.from(new Set(albums.flatMap((a) => a.images ?? [])))
    if (!ids.length) throw new Error('Selected albums have no images.')
    return ids
  }
  if (!input.workId) throw new Error('Select a Work project.')
  const work = await pb.collection('work_projects').getOne<WorkRecord>(input.workId)
  const ids = Array.from(new Set(work.images ?? []))
  if (!ids.length) throw new Error('That Work project has no images.')
  return ids
}

export async function listDeliveries() {
  let rows: DeliveryRecord[]
  try {
    rows = await listCollected<DeliveryRecord>('deliveries', {
      sort: '-created',
      expand: 'albums,work,person',
    })
  } catch {
    rows = await listCollected<DeliveryRecord>('deliveries', {
      sort: '-created',
    })
  }
  const previewIds = rows.flatMap((row) => (Array.isArray(row.images) ? row.images.slice(0, 4) : []))
  if (!previewIds.length) return rows
  try {
    const media = await listMediaByIds(previewIds)
    const byId = new Map(media.map((item) => [item.id, item]))
    return rows.map((row) => ({
      ...row,
      expand: {
        ...row.expand,
        images: (Array.isArray(row.images) ? row.images.slice(0, 4) : [])
          .map((id) => byId.get(id))
          .filter((item): item is MediaRecord => Boolean(item)),
      },
    }))
  } catch {
    return rows
  }
}

export async function listDeliveriesPage(page: number, pageSize = 100) {
  try {
    return await listPage<DeliveryRecord>('deliveries', page, pageSize, {
      sort: '-created',
      expand: 'albums,work,person',
    })
  } catch {
    return listPage<DeliveryRecord>('deliveries', page, pageSize, { sort: '-created' })
  }
}

export async function updateDelivery(
  id: string,
  data: Partial<{
    client_name: string
    client_email: string
    studio_notes: string
    person: string
  }>,
) {
  return pb.collection('deliveries').update<DeliveryRecord>(id, data)
}

export async function createDelivery(input: {
  clientName: string
  clientEmail?: string
  personId?: string
  bookingId?: string
  studioNotes?: string
  sourceType: DeliverySource
  imageIds?: string[]
  albumIds?: string[]
  workId?: string
}) {
  const clientName = input.clientName.trim()
  if (!clientName && !input.personId) throw new Error('Client name or Person is required.')

  const images = await resolveImageIds(input)
  const token = randomToken()
  const short_code = randomShortCode()
  const expires_at = deliveryExpiresAt()

  try {
    const data: Record<string, unknown> = {
      token,
      short_code,
      client_name: clientName || 'Client',
      client_email: input.clientEmail?.trim() || '',
      source_type: input.sourceType,
      images,
      albums: input.sourceType === 'albums' ? input.albumIds ?? [] : [],
      expires_at,
      revoked: false,
      studio_notes: input.studioNotes ?? '',
    }
    if (input.sourceType === 'work' && input.workId) data.work = input.workId
    if (input.personId) data.person = input.personId
    if (input.bookingId) data.booking = input.bookingId

    let record: DeliveryRecord
    try {
      record = await pb.collection('deliveries').create<DeliveryRecord>(data)
    } catch (error) {
      // Nested file copy in the deliveries hook can persist the gallery and still
      // fail the HTTP create. Recover by the token we just generated.
      try {
        record = await pb.collection('deliveries').getFirstListItem<DeliveryRecord>(
          `token="${token.replaceAll('"', '')}"`,
        )
      } catch {
        throw error
      }
    }
    const copied = await listDeliveryFilesFor(record.id)
    if (!copied.length) {
      try {
        await copyDeliveryFiles(record.id, images)
      } catch (error) {
        await pb.collection('deliveries').delete(record.id).catch(() => undefined)
        throw error
      }
    }

    return record
  } catch (error) {
    throw new Error(pbErrorMessage(error, 'Failed to create delivery.'))
  }
}

export type DeliveryFileRecord = RecordModel & {
  delivery: string
  media?: string
  file: string
  caption?: string
  sort?: number
}

async function copyDeliveryFiles(deliveryId: string, imageIds: string[]) {
  let copied = 0
  for (let i = 0; i < imageIds.length; i++) {
    const media = await pb.collection('media').getOne<MediaRecord>(imageIds[i])
    if (!media.file) continue
    const url = pb.files.getURL(media, media.file)
    const res = await fetch(url, { credentials: 'include' })
    if (!res.ok) throw new Error('Could not copy a photograph into the delivery.')
    const blob = await res.blob()
    const filename = media.file.includes('/') ? media.file.split('/').pop()! : media.file
    const file = new File([blob], filename || 'photo.jpg', { type: blob.type || 'image/jpeg' })
    const form = new FormData()
    form.append('delivery', deliveryId)
    form.append('media', media.id)
    form.append('file', file)
    form.append('caption', media.caption ?? '')
    form.append('sort', String(i))
    await pb.collection('delivery_files').create(form)
    copied++
  }
  if (!copied) throw new Error('Delivery has no files to copy.')
}

export async function deleteDeliveryFiles(deliveryId: string) {
  const rows = await listCollected<DeliveryFileRecord>('delivery_files', {
    filter: `delivery="${deliveryId.replaceAll('"', '')}"`,
  })
  await Promise.all(rows.map((row) => pb.collection('delivery_files').delete(row.id)))
}

export async function listDeliveryFiles(token: string) {
  const safe = token.replaceAll('"', '')
  const list = await pb.collection('deliveries').getList<DeliveryRecord>(1, 1, {
    filter: `token="${safe}"`,
    query: { token: safe },
  })
  const delivery = list.items[0]
  if (!delivery) return []
  return listCollected<DeliveryFileRecord>('delivery_files', {
    sort: 'sort,created',
    filter: `delivery="${delivery.id}"`,
    query: { token: safe },
  })
}

export async function listDeliveryFilesFor(deliveryId: string) {
  const id = deliveryId.replaceAll('"', '')
  return listCollected<DeliveryFileRecord>('delivery_files', {
    filter: `delivery="${id}"`,
  })
}

export async function revokeDelivery(id: string) {
  await deleteDeliveryFiles(id)
  return pb.collection('deliveries').update<DeliveryRecord>(id, { revoked: true })
}

/** Bring an expired or revoked link back for another 7 days. Same token. */
export async function restoreDelivery(id: string) {
  const delivery = await pb.collection('deliveries').getOne<DeliveryRecord>(id)
  if (isDeliveryActive(delivery)) throw new Error('This delivery link is still active.')
  const files = await listDeliveryFilesFor(id)
  if (!files.length) {
    const imageIds = delivery.images ?? []
    if (!imageIds.length) throw new Error('This delivery has no photographs to restore.')
    try {
      await copyDeliveryFiles(id, imageIds)
    } catch (error) {
      throw new Error(pbErrorMessage(error, 'Could not restore the photographs for this link.'))
    }
  }
  return pb.collection('deliveries').update<DeliveryRecord>(id, {
    revoked: false,
    expires_at: deliveryExpiresAt(),
    expiry_mail_sent_at: null,
  })
}

export async function deleteDelivery(id: string) {
  const safe = id.replaceAll('"', '')
  await deleteDeliveryFiles(safe)
  const feedback = await listCollected<DeliveryFeedback>('delivery_feedback', {
    filter: `delivery="${safe}"`,
  })
  await Promise.all(feedback.map((row) => pb.collection('delivery_feedback').delete(row.id)))
  try {
    await pb.collection('deliveries').delete(safe)
  } catch (error) {
    throw new Error(pbErrorMessage(error, 'Could not delete this delivery.'))
  }
}

/** Resend the gallery-ready email. Server requires active link + client email + client_gallery on. */
export async function resendGalleryEmail(deliveryId: string) {
  try {
    const res = await pb.send('/api/ibrahim/resend-gallery', {
      method: 'POST',
      body: { deliveryId },
    })
    if ((res as { ok?: boolean } | null)?.ok === false) {
      throw new Error('Could not send the gallery email.')
    }
  } catch (error) {
    throw new Error(pbErrorMessage(error, 'Could not send the gallery email.'))
  }
}

export function canResendGalleryEmail(d: Pick<DeliveryRecord, 'client_email' | 'expires_at' | 'revoked'>) {
  return isDeliveryActive(d) && Boolean(d.client_email?.trim())
}

/** Public: fetch delivery by long token or short share code (query.token required by API rules). */
export async function getDeliveryByToken(token: string) {
  try {
    const safe = token.replaceAll('"', '\\"')
    const list = await pb.collection('deliveries').getList<DeliveryRecord>(1, 1, {
      filter: `token="${safe}" || short_code="${safe}"`,
      expand: 'images',
      query: { token },
    })
    const delivery = list.items[0]
    if (!delivery) throw new Error('Delivery not found.')
    if (!isDeliveryActive(delivery)) throw new Error('This delivery link has expired or been revoked.')
    return delivery
  } catch (error) {
    throw new Error(pbErrorMessage(error, 'This delivery link is unavailable.'))
  }
}

export async function listDeliveryImages(token: string, imageIds: string[]) {
  if (!imageIds.length) return [] as MediaRecord[]
  const results: MediaRecord[] = []
  for (const id of imageIds) {
    try {
      const item = await pb.collection('media').getOne<MediaRecord>(id, {
        query: { token },
      })
      results.push(item)
    } catch {
      // skip inaccessible
    }
  }
  return results
}

export async function submitDeliveryFeedback(input: {
  delivery: DeliveryRecord
  message: string
  selectedImageIds?: string[]
  clientName?: string
}) {
  const message = input.message.trim()
  if (!message) throw new Error('Feedback message is required.')

  let feedback: DeliveryFeedback
  try {
    feedback = await pb.collection('delivery_feedback').create<DeliveryFeedback>(
      {
        delivery: input.delivery.id,
        message,
        selected_images: input.selectedImageIds ?? [],
        client_name: input.clientName?.trim() || input.delivery.client_name,
        reviewed: false,
        promoted: false,
      },
      { query: { token: input.delivery.token } },
    )
  } catch (error) {
    throw new Error(pbErrorMessage(error, 'Failed to submit feedback.'))
  }

  return feedback
}

export async function listFeedback() {
  try {
    return await listCollected<DeliveryFeedback>('delivery_feedback', {
      sort: '-created',
      expand: 'delivery',
    })
  } catch {
    return listCollected<DeliveryFeedback>('delivery_feedback', {
      sort: '-created',
    })
  }
}

export async function listFeedbackPage(page: number, pageSize = 100) {
  try {
    return await listPage<DeliveryFeedback>('delivery_feedback', page, pageSize, {
      sort: '-created',
      expand: 'delivery',
    })
  } catch {
    return listPage<DeliveryFeedback>('delivery_feedback', page, pageSize, { sort: '-created' })
  }
}

export async function updateFeedback(
  id: string,
  data: Partial<{ message: string; reviewed: boolean; promoted: boolean; client_name: string }>,
) {
  return pb.collection('delivery_feedback').update<DeliveryFeedback>(id, data)
}

export async function promoteFeedbackToTestimonial(feedback: DeliveryFeedback, quote: string, authorName: string) {
  await createTestimonial({
    quote: quote.trim(),
    author_name: authorName.trim(),
    published: true,
  })
  return updateFeedback(feedback.id, { promoted: true, reviewed: true, message: quote.trim() })
}

export async function listInquiries() {
  return listCollected<FormInquiry>('form_inquiries', { sort: '-created' })
}

export async function listInquiriesPage(page: number, pageSize = 100) {
  return listPage<FormInquiry>('form_inquiries', page, pageSize, { sort: '-created' })
}

export async function updateInquiryStatus(id: string, status: BookingStatus) {
  const item = await pb.collection('form_inquiries').getOne<FormInquiry>(id)
  return pb.collection('form_inquiries').update<FormInquiry>(id, {
    payload: { ...item.payload, booking_status: status },
  })
}

export async function markInquiryRead(id: string, read = true) {
  const item = await pb.collection('form_inquiries').getOne<FormInquiry>(id)
  if (!!item.payload?.inbox_read === read) return item
  return pb.collection('form_inquiries').update<FormInquiry>(id, {
    payload: {
      ...item.payload,
      inbox_read: read,
      inbox_read_at: read ? new Date().toISOString() : null,
    },
  })
}

export async function createInboxEvent(kind: InquiryKind, payload: Record<string, unknown>) {
  try {
    return await pb.collection('form_inquiries').create<FormInquiry>({
      kind,
      payload: {
        ...(kind === 'booking' ? { ...payload, booking_status: 'pending' } : payload),
        inbox_read: false,
      },
    })
  } catch {
    return null
  }
}

const HIDDEN_PAYLOAD_KEYS = new Set([
  'booking_status',
  'inbox_read',
  'inbox_read_at',
  'source',
  'feedback_id',
  'delivery_id',
  'media_id',
  'token',
  'event',
])

function payloadString(payload: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = payload[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

export type InboxFolder = 'requests' | 'messages'

export type InboxPresentation = {
  id: string
  kind: string
  from: string
  subject: string
  preview: string
  isActivity: boolean
  isRead: boolean
  receivedAt: string
  fields: { label: string; value: string }[]
  body: string
}

/** Shape an inquiry like a mail message (not a notification toast). */
export function presentInboxItem(item: FormInquiry): InboxPresentation {
  const payload = item.payload ?? {}
  const isActivity = item.kind === 'delivery_event'
  const isRead = payload.inbox_read === true

  const from =
    payloadString(payload, ['name', 'client_name', 'author_name', 'from', 'email']) ||
    (item.kind === 'contact' ? 'Website visitor' : item.kind === 'booking' ? 'Booking request' : 'Client')

  let subject = 'Message'
  let body = ''
  let preview = ''

  if (item.kind === 'contact') {
    subject = 'Contact inquiry'
    body = payloadString(payload, ['message', 'Message', 'note', 'details'])
    preview = body || 'New contact message'
  } else if (item.kind === 'booking') {
    const preferred = payloadString(payload, ['preferred_at'])
    subject = preferred ? `Booking request · ${preferred}` : 'Booking request'
    body = payloadString(payload, ['message', 'notes', 'details'])
    preview = preferred ? `Prefers ${preferred}` : 'New booking request'
  } else if (item.kind === 'feedback') {
    subject = 'Delivery feedback'
    body = payloadString(payload, ['message'])
    preview = body || 'Client left feedback'
  } else if (item.kind === 'delivery_event') {
    const event = payloadString(payload, ['event']) || 'update'
    subject = event === 'download' ? 'Gallery download' : event === 'created' ? 'Delivery created' : `Delivery ${event}`
    body = ''
    preview =
      event === 'download'
        ? `${from} downloaded an image`
        : event === 'created'
          ? `Delivery link created for ${from}`
          : subject
  } else {
    subject = item.kind
    preview = 'Inbox item'
  }

  const fields: { label: string; value: string }[] = []
  for (const [key, value] of Object.entries(payload)) {
    if (HIDDEN_PAYLOAD_KEYS.has(key)) continue
    if (key === 'message' || key === 'Message') continue
    if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') continue
    const text = String(value).trim()
    if (!text) continue
    fields.push({
      label: key.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value: text,
    })
  }

  if (!preview) preview = fields.map((f) => f.value).find(Boolean) || subject

  return {
    id: item.id,
    kind: item.kind,
    from,
    subject,
    preview: preview.slice(0, 140),
    isActivity,
    isRead,
    receivedAt: item.created,
    fields,
    body,
  }
}

export function filterInboxItems(items: FormInquiry[], folder: InboxFolder) {
  if (folder === 'messages') return items.filter((item) => item.kind === 'contact')
  return []
}

function recordId(id: string) {
  return id.replaceAll('"', '')
}

export async function deliveriesForBooking(bookingId: string) {
  const id = recordId(bookingId)
  return listCollected<DeliveryRecord>('deliveries', {
    filter: `booking="${id}"`,
  })
}

export async function personReferences(personId: string) {
  const id = recordId(personId)
  try {
    const [bookings, deliveries] = await Promise.all([
      pb.collection('bookings').getList(1, 1, { filter: `person="${id}"`, skipTotal: false }),
      pb.collection('deliveries').getList(1, 1, { filter: `person="${id}"`, skipTotal: false }),
    ])
    return {
      bookings: bookings.totalItems >= 0 ? bookings.totalItems : 0,
      deliveries: deliveries.totalItems >= 0 ? deliveries.totalItems : 0,
    }
  } catch {
    return { bookings: 0, deliveries: 0 }
  }
}

export async function removePerson(personId: string) {
  const refs = await personReferences(personId)
  if (refs.bookings > 0) {
    throw new Error(
      refs.bookings === 1
        ? 'This person still has a booking. Remove that first.'
        : `This person still has ${refs.bookings} bookings. Remove those first.`,
    )
  }
  if (refs.deliveries > 0) {
    throw new Error(
      refs.deliveries === 1
        ? 'This person still has a delivery. Delete or reassign it first.'
        : `This person still has ${refs.deliveries} deliveries. Delete or reassign those first.`,
    )
  }
  try {
    await pb.collection('people').delete(personId)
  } catch (error) {
    throw new Error(pbErrorMessage(error, 'Could not remove this person.'))
  }
}
