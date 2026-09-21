import { useCallback, useEffect, useState } from 'react'
import { pb } from '@/lib/pocketbase'
import { getNotificationSettings } from '@/lib/notifications'
import { mergeNoticeChannels, type PhotographerNoticeEvent } from '@/lib/notice-channels'
import { markInquiryRead, presentInboxItem, type FormInquiry } from '@/lib/clients'
import { type BookingRecord } from '@/lib/bookings'
import { formatRelativeTime } from '@/lib/format'

export type StudioNotice = {
  id: string
  title: string
  href: string
  when?: string
  kind: PhotographerNoticeEvent | 'booking-row'
  inquiryId?: string
}

function hrefFor(event: PhotographerNoticeEvent, opts?: { inquiryId?: string; bookingId?: string }) {
  if (event === 'message') {
    const id = opts?.inquiryId ? `&inquiry=${encodeURIComponent(opts.inquiryId)}` : ''
    return `/studio/clients?tab=inbox&folder=messages${id}`
  }
  if (event === 'feedback') {
    const id = opts?.inquiryId ? `&inquiry=${encodeURIComponent(opts.inquiryId)}` : ''
    return `/studio/clients?tab=feedback${id}`
  }
  if (opts?.bookingId) return `/studio/clients?tab=inbox&booking=${encodeURIComponent(opts.bookingId)}`
  return '/studio/clients?tab=inbox'
}

export function useStudioNotices() {
  const [items, setItems] = useState<StudioNotice[]>([])

  const pushNotice = useCallback((notice: StudioNotice) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === notice.id)) return prev
      return [notice, ...prev].slice(0, 12)
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    const unsubs: Array<() => void> = []

    async function start() {
      // Let the hub paint first. Notices are optional chrome, not the page.
      await new Promise((resolve) => setTimeout(resolve, 1200))
      if (cancelled) return
      const settings = await getNotificationSettings().catch(() => null)
      if (cancelled || !settings) return
      const channels = mergeNoticeChannels(settings.channels, settings.photographer_away !== false)

      try {
        const [inquiryPage, bookingPage] = await Promise.all([
          pb.collection('form_inquiries').getList<FormInquiry>(1, 24, { sort: '-created' }),
          pb.collection('bookings').getList<BookingRecord>(1, 8, {
            filter: 'status="needs_contact"',
            expand: 'person',
            sort: '-created',
          }),
        ])
        if (cancelled) return
        const inquiries = inquiryPage.items
        const bookings = bookingPage.items
        const seeded: StudioNotice[] = []

        if (channels.booking.inApp) {
          for (const b of bookings) {
            const person = b.expand?.person
            seeded.push({
              id: `booking-${b.id}`,
              title: person?.name ? `Booking · ${person.name}` : 'New booking request',
              href: hrefFor('booking', { bookingId: b.id }),
              when: formatRelativeTime(b.created),
              kind: 'booking-row',
            })
          }
        }

        for (const item of inquiries) {
          if (item.payload?.inbox_read === true) continue
          if (item.kind === 'contact' && channels.message.inApp) {
            const p = presentInboxItem(item)
            seeded.push({
              id: `inq-${item.id}`,
              title: p.from ? `Message · ${p.from}` : 'New message',
              href: hrefFor('message', { inquiryId: item.id }),
              when: formatRelativeTime(item.created),
              kind: 'message',
              inquiryId: item.id,
            })
          }
          if (item.kind === 'feedback' && channels.feedback.inApp) {
            const p = presentInboxItem(item)
            seeded.push({
              id: `inq-${item.id}`,
              title: p.from ? `Feedback · ${p.from}` : 'New delivery feedback',
              href: hrefFor('feedback', { inquiryId: item.id }),
              when: formatRelativeTime(item.created),
              kind: 'feedback',
              inquiryId: item.id,
            })
          }
        }

        seeded.sort((a, b) => (a.when === 'Just now' ? -1 : b.when === 'Just now' ? 1 : 0))
        setItems(seeded.slice(0, 12))
      } catch {
        // seed optional
      }

      try {
        const u1 = await pb.collection('bookings').subscribe('*', (e) => {
          if (e.action !== 'create') return
          const rec = e.record as { id: string; source?: string; created?: string }
          if (rec.source !== 'website') return
          if (!channels.booking.inApp) return
          pushNotice({
            id: `booking-${rec.id}`,
            title: 'New booking request',
            href: hrefFor('booking', { bookingId: rec.id }),
            when: formatRelativeTime(rec.created),
            kind: 'booking',
          })
        })
        if (cancelled) {
          u1()
          return
        }
        unsubs.push(u1)
      } catch {
        /* optional */
      }

      try {
        const u2 = await pb.collection('form_inquiries').subscribe('*', (e) => {
          if (e.action !== 'create') return
          const rec = e.record as { id: string; kind?: string; created?: string; payload?: { name?: string } }
          if (rec.kind === 'contact' && channels.message.inApp) {
            const from = typeof rec.payload?.name === 'string' ? rec.payload.name : ''
            pushNotice({
              id: `inq-${rec.id}`,
              title: from ? `Message · ${from}` : 'New message',
              href: hrefFor('message', { inquiryId: rec.id }),
              when: formatRelativeTime(rec.created),
              kind: 'message',
              inquiryId: rec.id,
            })
          }
          if (rec.kind === 'feedback' && channels.feedback.inApp) {
            pushNotice({
              id: `inq-${rec.id}`,
              title: 'New delivery feedback',
              href: hrefFor('feedback', { inquiryId: rec.id }),
              when: formatRelativeTime(rec.created),
              kind: 'feedback',
              inquiryId: rec.id,
            })
          }
        })
        if (cancelled) {
          u2()
          return
        }
        unsubs.push(u2)
      } catch {
        /* optional */
      }
    }

    void start()
    return () => {
      cancelled = true
      for (const u of unsubs) {
        try {
          u()
        } catch {
          /* ignore */
        }
      }
    }
  }, [pushNotice])

  function dismiss(id: string) {
    setItems((prev) => {
      const row = prev.find((n) => n.id === id)
      if (row?.inquiryId) {
        void markInquiryRead(row.inquiryId, true).catch(() => {})
      }
      return prev.filter((n) => n.id !== id)
    })
  }

  function dismissAll() {
    setItems((prev) => {
      for (const row of prev) {
        if (row.inquiryId) void markInquiryRead(row.inquiryId, true).catch(() => {})
      }
      return []
    })
  }

  return { items, dismiss, dismissAll }
}
