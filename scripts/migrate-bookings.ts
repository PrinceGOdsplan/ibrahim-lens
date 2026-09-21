/**
 * Best-effort migrate form_inquiries kind=booking → people + bookings.
 */
import type PocketBase from 'pocketbase'

function digitsOnly(input: string) {
  return input.replace(/\D/g, '')
}

function normalizePhone(raw: string): { e164: string; digits: string } | null {
  let d = digitsOnly(raw)
  if (!d) return null
  if (d.startsWith('234')) d = d.slice(3)
  if (d.startsWith('0')) d = d.replace(/^0+/, '')
  if (d.length < 7) return null
  const digits = `234${d}`
  return { e164: `+${digits}`, digits }
}

function payloadString(payload: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const v = payload[key]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return ''
}

export async function migrateBookingInquiries(pb: PocketBase) {
  let inquiries: Array<{ id: string; kind: string; payload: Record<string, unknown>; created: string }>
  try {
    inquiries = await pb.collection('form_inquiries').getFullList({
      filter: 'kind="booking"',
      sort: 'created',
    })
  } catch {
    console.log('No form_inquiries to migrate.')
    return
  }

  let created = 0
  for (const item of inquiries) {
    const payload = item.payload ?? {}
    if (payload.migrated_booking_id) continue

    const name = payloadString(payload, ['name', 'Name', 'client_name']) || 'Unknown client'
    const phoneRaw = payloadString(payload, ['phone', 'Phone', 'tel'])
    const email = payloadString(payload, ['email', 'Email'])
    const phone = normalizePhone(phoneRaw || `0800000${item.id.slice(0, 4)}`)
    if (!phone) continue

    let personId = ''
    try {
      const existing = await pb.collection('people').getList(1, 1, {
        filter: `phone_digits="${phone.digits}"`,
      })
      if (existing.items[0]) {
        personId = existing.items[0].id
      } else {
        const person = await pb.collection('people').create({
          name,
          phone_e164: phone.e164,
          phone_digits: phone.digits,
          email,
          notes: '',
        })
        personId = person.id
      }
    } catch (e) {
      console.warn('Skip inquiry person', item.id, e)
      continue
    }

    const statusRaw = payload.booking_status
    const status =
      statusRaw === 'confirmed' ||
      statusRaw === 'needs_contact' ||
      statusRaw === 'pending' ||
      statusRaw === 'completed' ||
      statusRaw === 'declined' ||
      statusRaw === 'cancelled'
        ? statusRaw
        : 'needs_contact'

    try {
      const booking = await pb.collection('bookings').create({
        person: personId,
        status,
        preferred_at: payloadString(payload, ['preferred_at']) || '',
        answers: payload,
        studio_notes: '',
        fee_ngn: 0,
        amount_paid_ngn: 0,
        source: 'migrated_inquiry',
      })
      await pb.collection('booking_events').create({
        booking: booking.id,
        type: 'migrated_from_inquiry',
        actor: 'seed',
        before: {},
        after: { inquiry_id: item.id },
      })
      await pb.collection('form_inquiries').update(item.id, {
        payload: { ...payload, migrated_booking_id: booking.id },
      })
      created += 1
    } catch (e) {
      console.warn('Skip inquiry booking', item.id, e)
    }
  }

  console.log(`Migrated ${created} booking inquiries → bookings.`)
}
