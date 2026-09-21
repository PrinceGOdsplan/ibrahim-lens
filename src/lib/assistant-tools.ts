import { loadDashboardPulse, type DeskPeriod } from '@/lib/dashboard'
import {
  hubBookings,
  isoInWindow,
  listBookings,
  listMoneyChangedEvents,
  listPeople,
  moneyInWindow,
  resolveMoneyWindow,
  statusLabel,
} from '@/lib/bookings'
import {
  getBrandSettings,
  listAlbums,
  listMediaByIds,
  listMediaPage,
  listTags,
  listWork,
  mediaLabel,
  mediaThumbUrl,
  mediaVault,
  fileStem,
  type MediaRecord,
} from '@/lib/library'
import {
  isDeliveryActive,
  listDeliveries,
  listFeedback,
  listInquiries,
  presentInboxItem,
} from '@/lib/clients'
import { listFaq, listSeo, listTestimonials, getWebsiteGlobals, parseLanes } from '@/lib/website'
import { getNotificationSettings } from '@/lib/notifications'
import { loadAssistantThread } from '@/lib/assistant'
import { pb } from '@/lib/pocketbase'
import { formatDateTime } from '@/lib/format'

function last4(e164?: string) {
  const digits = String(e164 || '').replace(/\D/g, '')
  return digits.length >= 4 ? digits.slice(-4) : ''
}

function lagosDayBounds(day: string) {
  const start = new Date(`${day}T00:00:00+01:00`)
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
  return { from: start.toISOString(), to: end.toISOString() }
}

function periodArg(args: Record<string, unknown>, fallback = '') {
  const raw = args.period ?? args.when ?? args.day ?? args.range
  return raw != null && String(raw).trim() !== '' ? String(raw).trim() : fallback
}

export async function runAssistantReadTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  if (name === 'get_desk_pulse') {
    const window = resolveMoneyWindow(periodArg(args, '7d'))
    const deskPeriod = (window.period ?? '30d') as DeskPeriod
    const pulse = await loadDashboardPulse(window.period ? deskPeriod : '30d')
    const rows = hubBookings(await listBookings())
    const events = await listMoneyChangedEvents()
    const money = moneyInWindow(rows, events, window)
    return {
      attention: pulse.attention,
      week: pulse.week,
      needsYou: pulse.needsYou,
      micro: pulse.micro,
      funnel: pulse.funnel,
      pipelineMix: pulse.pipelineMix,
      period: window.label,
      money: {
        earnedInPeriodNgn: money.earnedInPeriodNgn,
        bookedFeesInPeriodNgn: money.bookedFeesInPeriodNgn,
        lifetimeEarnedNgn: money.lifetimeEarnedNgn,
        uncollectedNgn: money.uncollectedNgn,
        meaning:
          'earnedInPeriodNgn = money paid to you in this period. uncollectedNgn = unpaid fees still owed now (debts). lifetimeEarnedNgn = all-time amount paid.',
      },
    }
  }

  if (name === 'list_money') {
    const kind = String(args.kind || 'both')
      .trim()
      .toLowerCase()
    const moneyWindow = resolveMoneyWindow(periodArg(args, 'all'))
    const allRows = await listBookings()
    const rows = hubBookings(allRows)
    const events = await listMoneyChangedEvents()
    const money = moneyInWindow(rows, events, moneyWindow)

    const active = allRows.filter((b) => b.status !== 'declined' && b.status !== 'cancelled')
    const debts: {
      name: string
      fee_ngn: number
      amount_paid_ngn: number
      uncollected_ngn: number
      status: string
    }[] = []
    for (const b of active) {
      const fee = Number(b.fee_ngn || 0)
      const paid = Number(b.amount_paid_ngn || 0)
      const uncollected = b.status !== 'needs_contact' && fee > paid ? fee - paid : 0
      if (uncollected > 0) {
        debts.push({
          name: b.expand?.person?.name || 'Client',
          fee_ngn: fee,
          amount_paid_ngn: paid,
          uncollected_ngn: uncollected,
          status: b.status,
        })
      }
    }

    const earnedRows: { name: string; amount_ngn: number }[] = []
    if (kind === 'earned' || kind === 'both') {
      const byBooking = new Map<string, number>()
      for (const ev of events) {
        if (ev.type !== 'money_changed') continue
        if (!isoInWindow(ev.created as string | undefined, moneyWindow)) continue
        const before = (ev.before ?? {}) as { amount_paid_ngn?: number }
        const after = (ev.after ?? {}) as { amount_paid_ngn?: number }
        const delta = Math.max(0, (Number(after.amount_paid_ngn) || 0) - (Number(before.amount_paid_ngn) || 0))
        if (delta <= 0) continue
        byBooking.set(ev.booking, (byBooking.get(ev.booking) || 0) + delta)
      }
      for (const [bookingId, amount] of byBooking) {
        const b = allRows.find((r) => r.id === bookingId)
        earnedRows.push({
          name: b?.expand?.person?.name || 'Client',
          amount_ngn: amount,
        })
      }
      earnedRows.sort((a, b) => b.amount_ngn - a.amount_ngn)
    }

    return {
      kind,
      period: moneyWindow.label,
      earnedInPeriodNgn: money.earnedInPeriodNgn,
      bookedFeesInPeriodNgn: money.bookedFeesInPeriodNgn,
      lifetimeEarnedNgn: money.lifetimeEarnedNgn,
      uncollectedNgn: money.uncollectedNgn,
      meaning:
        'Say “earned” for money paid to the photographer. Say “uncollected” or “still owed” for unpaid fees — not “collected”. For “how much did I make”, use earnedInPeriodNgn.',
      earnedFrom: kind === 'owed' ? [] : earnedRows.slice(0, 20),
      uncollectedDebts: kind === 'earned' ? [] : debts.slice(0, 20),
      debtCount: debts.length,
    }
  }

  if (name === 'search_people') {
    const q = String(args.q || '')
      .trim()
      .toLowerCase()
    const people = await listPeople()
    return people
      .filter((p) => {
        if (!q) return true
        const email = String(p.email || '').toLowerCase()
        return p.name.toLowerCase().includes(q) || last4(p.phone_e164).includes(q) || email.includes(q)
      })
      .slice(0, 12)
      .map((p) => ({
        id: p.id,
        name: p.name,
        last4: last4(p.phone_e164),
        email: p.email || '',
      }))
  }

  if (name === 'list_bookings') {
    const q = String(args.q || '')
      .trim()
      .toLowerCase()
    const status = String(args.status || '')
      .trim()
      .toLowerCase()
    const whenRaw = periodArg(args)
    const when = whenRaw ? resolveMoneyWindow(whenRaw) : null
    const wantUnpaid =
      status === 'unpaid' ||
      status === 'uncollected' ||
      q === 'unpaid' ||
      q.includes('unpaid') ||
      q.includes('uncollected')
    const wantOpen =
      status === 'open' || q === 'open' || q === 'open bookings' || q.includes('open booking')
    const openStatuses = new Set(['pending', 'confirmed', 'needs_contact'])
    const rows = await listBookings()
    const filtered = rows.filter((b) => {
      const fee = Number(b.fee_ngn || 0)
      const paid = Number(b.amount_paid_ngn || 0)
      const owing = b.status !== 'needs_contact' && fee > 0 && paid < fee
      if (wantUnpaid) return owing
      if (wantOpen) return openStatuses.has(b.status)
      if (status && status !== 'unpaid' && status !== 'uncollected' && b.status !== status) return false
      if (when && !isoInWindow(b.preferred_at || b.created, when)) return false
      const name = b.expand?.person?.name?.toLowerCase() || ''
      return !q || name.includes(q) || b.id.toLowerCase().includes(q)
    })
    const nameQ = !wantUnpaid && !wantOpen && q && !q.includes('unpaid') && !q.includes('uncollected')
    return {
      period: when?.label || 'Any time',
      count: filtered.length,
      bookings: filtered.slice(0, 24).map((b) => ({
        id: b.id,
        status: b.status,
        statusLabel: statusLabel(b.status),
        name: b.expand?.person?.name || '',
        last4: last4(b.expand?.person?.phone_e164),
        fee_ngn: b.fee_ngn || 0,
        amount_paid_ngn: b.amount_paid_ngn || 0,
        uncollected_ngn:
          b.status !== 'needs_contact' && Number(b.fee_ngn || 0) > Number(b.amount_paid_ngn || 0)
            ? Number(b.fee_ngn || 0) - Number(b.amount_paid_ngn || 0)
            : 0,
        preferred_at: b.preferred_at || '',
        preferredLabel: b.preferred_at ? formatDateTime(b.preferred_at) : '',
        href:
          b.status === 'needs_contact'
            ? `/studio/clients?tab=inbox&booking=${b.id}`
            : `/studio/bookings?booking=${b.id}`,
        ambiguous: Boolean(nameQ && filtered.length > 1),
      })),
    }
  }

  if (name === 'search_media') {
    const q = String(args.q || '').trim()
    const vault = (args.vault as 'gallery' | 'portfolio' | 'pick') || 'gallery'
    const page = Math.max(1, Math.floor(Number(args.page) || 1))
    const newest = Math.min(60, Math.max(0, Number(args.newest) || 0))
    const limit = newest || Math.min(48, Math.max(1, Number(args.limit) || 24))
    const sort = String(args.sort || '').toLowerCase() === 'name' ? 'name' : 'date'
    const day = String(args.day || '').trim()
    const whenRaw = periodArg(args)
    let items: MediaRecord[] = []
    let hasMore = false
    if (day && /^\d{4}-\d{2}-\d{2}$/.test(day)) {
      const { from, to } = lagosDayBounds(day)
      const extra = await pb.collection('media').getList<MediaRecord>(page, limit, {
        filter: `created >= "${from}" && created < "${to}"`,
        sort: sort === 'name' ? 'caption,file' : '-created',
      })
      items = extra.items
      hasMore = extra.items.length >= limit
    } else if (whenRaw) {
      const window = resolveMoneyWindow(whenRaw)
      const fromIso = window.from?.toISOString()
      const toIso = window.to?.toISOString()
      let filter = ''
      if (fromIso && toIso) filter = `created >= "${fromIso}" && created < "${toIso}"`
      else if (fromIso) filter = `created >= "${fromIso}"`
      const extra = await pb.collection('media').getList<MediaRecord>(page, limit, {
        filter: filter || undefined,
        sort: sort === 'name' ? 'caption,file' : '-created',
      })
      items = extra.items
      hasMore = extra.items.length >= limit
    } else {
      const pageResult = await listMediaPage({
        page,
        vault,
        q: q || undefined,
        perPage: limit,
        sort,
      })
      items = pageResult.items
      hasMore = pageResult.hasMore
    }
    const tags = await listTags()
    const tagName = (id: string) => tags.find((t) => t.id === id)?.name || id
    const qLower = q.toLowerCase()
    if (qLower) {
      items = items.filter((m) => {
        const label = mediaLabel(m).toLowerCase()
        const caption = String(m.caption || '').toLowerCase()
        const file = String(m.file || '').toLowerCase()
        const tagHit = (m.tags || []).some((id) => tagName(id).toLowerCase().includes(qLower))
        return label.includes(qLower) || caption.includes(qLower) || file.includes(qLower) || tagHit
      })
    }
    const wantEmpty =
      args.emptyCaption === true ||
      String(args.emptyCaption || '').toLowerCase() === 'true' ||
      /no (caption|description|name)|without (caption|description|name)|missing (caption|description)/i.test(
        String(args.q || args.filter || ''),
      )
    if (wantEmpty || String(args.filter || '').toLowerCase() === 'empty_caption') {
      items = items.filter((m) => !String(m.caption || '').trim())
    }
    const mapped = items.slice(0, limit).map((m) => ({
      id: m.id,
      label: mediaLabel(m),
      caption: String(m.caption || '').trim(),
      file: fileStem(m.file || ''),
      emptyCaption: !String(m.caption || '').trim(),
      vault: mediaVault(m),
      created: m.created,
      tags: (m.tags || []).map(tagName),
      thumb: mediaThumbUrl(m, '400x400'),
      href: `/studio/gallery?room=${mediaVault(m) === 'portfolio' ? 'portfolio' : 'gallery'}&media=${encodeURIComponent(m.id)}`,
    }))
    return {
      count: mapped.length,
      page,
      hasMore,
      meaning:
        'label is the display name (caption if set, otherwise filename). emptyCaption=true means no caption. For rename use library_write bulk_media_captions. For catchy names invent phrases and pass vault+captions[] or items.',
      items: mapped,
    }
  }

  if (name === 'list_albums') {
    const q = String(args.q || '')
      .trim()
      .toLowerCase()
    const id = String(args.id || '').trim()
    const detail =
      args.detail === true ||
      String(args.detail || '').toLowerCase() === 'true' ||
      args.withPhotos === true
    let albums = await listAlbums()
    if (id) albums = albums.filter((a) => a.id === id)
    if (q) albums = albums.filter((a) => a.title.toLowerCase().includes(q))
    const out = []
    for (const a of albums.slice(0, 30)) {
      const row: {
        id: string
        title: string
        count: number
        photos?: { id: string; label: string }[]
      } = {
        id: a.id,
        title: a.title,
        count: (a.images || []).length,
      }
      if (detail && (a.images || []).length) {
        const media = await listMediaByIds((a.images || []).slice(0, 48))
        row.photos = media.map((m) => ({ id: m.id, label: mediaLabel(m) }))
      }
      out.push(row)
    }
    return { count: out.length, albums: out }
  }

  if (name === 'list_work') {
    const q = String(args.q || '')
      .trim()
      .toLowerCase()
    const id = String(args.id || '').trim()
    const detail =
      args.detail === true ||
      String(args.detail || '').toLowerCase() === 'true' ||
      args.withPhotos === true
    let work = await listWork()
    if (id) work = work.filter((w) => w.id === id)
    if (q) work = work.filter((w) => w.title.toLowerCase().includes(q))
    const out = []
    for (const w of work.slice(0, 30)) {
      const row: {
        id: string
        title: string
        show_on_website: boolean
        count: number
        photos?: { id: string; label: string }[]
      } = {
        id: w.id,
        title: w.title,
        show_on_website: w.show_on_website,
        count: (w.images || []).length,
      }
      if (detail && (w.images || []).length) {
        const media = await listMediaByIds((w.images || []).slice(0, 48))
        row.photos = media.map((m) => ({ id: m.id, label: mediaLabel(m) }))
      }
      out.push(row)
    }
    return { count: out.length, work: out }
  }

  if (name === 'list_inbox') {
    const kind = String(args.kind || '')
      .trim()
      .toLowerCase()
    const unreadOnly = args.unread === true || String(args.unread || '').toLowerCase() === 'true'
    const whenRaw = periodArg(args)
    const when = whenRaw ? resolveMoneyWindow(whenRaw) : null

    // Unaccepted website requests live on bookings (needs_contact)
    const wantRequests =
      !kind || kind === 'request' || kind === 'requests' || kind === 'booking' || kind === 'unaccepted'
    const wantMessages = !kind || kind === 'message' || kind === 'messages' || kind === 'contact' || kind === 'write'
    const wantFeedback = !kind || kind === 'feedback'
    const wantDownloads =
      !kind ||
      kind === 'download' ||
      kind === 'downloads' ||
      kind === 'delivery_event' ||
      kind === 'notice' ||
      kind === 'notices' ||
      kind === 'notification' ||
      kind === 'notifications'

    const out: {
      id: string
      kind: string
      from: string
      subject: string
      preview: string
      isRead: boolean
      href: string
    }[] = []

    if (wantRequests) {
      const bookings = await listBookings()
      for (const b of bookings) {
        if (b.status !== 'needs_contact') continue
        if (when && !isoInWindow(b.created, when)) continue
        out.push({
          id: b.id,
          kind: 'request',
          from: b.expand?.person?.name || 'Client',
          subject: 'Unaccepted booking request',
          preview: b.preferred_at ? formatDateTime(b.preferred_at) : '',
          isRead: false,
          href: `/studio/clients?tab=inbox&booking=${b.id}`,
        })
      }
    }

    if (wantMessages || wantFeedback || wantDownloads) {
      const items = await listInquiries()
      for (const item of items) {
        const p = presentInboxItem(item)
        if (p.kind === 'feedback' && !wantFeedback) continue
        if (p.kind === 'contact' && !wantMessages) continue
        if (p.kind === 'booking' && !wantRequests) continue
        if (p.kind === 'delivery_event' && !wantDownloads) continue
        if (p.kind !== 'feedback' && p.kind !== 'contact' && p.kind !== 'booking' && p.kind !== 'delivery_event') {
          continue
        }
        if (unreadOnly && p.isRead) continue
        if (when && !isoInWindow(item.created, when)) continue
        out.push({
          id: p.id,
          kind: p.kind === 'delivery_event' ? 'download' : p.kind,
          from: p.from,
          subject: p.subject,
          preview: p.preview,
          isRead: p.isRead,
          href: `/studio/clients?tab=inbox`,
        })
      }
    }

    return { count: out.length, items: out.slice(0, 30) }
  }

  if (name === 'list_deliveries') {
    const filter = String(args.filter || args.kind || '')
      .trim()
      .toLowerCase()
    const q = String(args.q || '')
      .trim()
      .toLowerCase()
    const rows = await listDeliveries()
    const now = Date.now()
    const soon = now + 24 * 60 * 60 * 1000
    const mapped = rows
      .map((d) => {
        const exp = d.expires_at ? new Date(d.expires_at).getTime() : 0
        const active = isDeliveryActive(d)
        const expiringSoon = active && exp > now && exp <= soon
        const expired = !d.revoked && exp > 0 && exp <= now
        return {
          id: d.id,
          client_name: d.client_name || 'Client',
          client_email: d.client_email || '',
          expires_at: d.expires_at || '',
          revoked: Boolean(d.revoked),
          active,
          expiringSoon,
          expired,
          href: `/studio/clients?tab=deliveries&delivery=${d.id}`,
        }
      })
      .filter((d) => {
        if (q && !d.client_name.toLowerCase().includes(q) && !d.client_email.toLowerCase().includes(q)) {
          return false
        }
        if (filter === 'active') return d.active
        if (filter === 'expiring' || filter === 'expiring_soon') return d.expiringSoon
        if (filter === 'expired') return d.expired
        if (filter === 'revoked') return d.revoked
        return true
      })
    return { count: mapped.length, deliveries: mapped.slice(0, 30) }
  }

  if (name === 'list_faq') {
    const faq = await listFaq()
    return faq.slice(0, 20).map((f) => ({ id: f.id, question: f.question, answer: f.answer }))
  }

  if (name === 'list_testimonials') {
    const rows = await listTestimonials()
    return rows.slice(0, 20).map((t) => ({
      id: t.id,
      quote: t.quote,
      author: t.author_name,
      role: t.author_role || '',
      published: t.published,
    }))
  }

  if (name === 'list_seo') {
    const rows = await listSeo()
    return rows.map((s) => ({
      id: s.id,
      page_key: s.page_key,
      title: s.title || '',
      description: s.description || '',
    }))
  }

  if (name === 'list_feedback') {
    const rows = await listFeedback()
    return rows.slice(0, 20).map((f) => ({
      id: f.id,
      message: String(f.message || '').slice(0, 200),
      promoted: Boolean(f.promoted),
      reviewed: Boolean(f.reviewed),
      delivery: f.delivery || '',
    }))
  }

  if (name === 'get_website_globals') {
    const g = await getWebsiteGlobals()
    const lanes = parseLanes(g.home_lanes)
    return {
      id: g.id,
      featured: (g.home_featured || []).length,
      tagline: g.home_tagline || '',
      home_lanes_headline: g.home_lanes_headline || '',
      lanes: lanes.map((l, i) => ({
        index: i,
        title: l.title,
        body: (l.body || '').slice(0, 200),
        image_id: l.image_id || '',
      })),
      about_subtitle: g.about_subtitle || '',
      about_body: (g.about_body || '').slice(0, 240),
      contact_h1: g.contact_h1 || '',
      contact_intro: (g.contact_intro || '').slice(0, 160),
      write_blurb: g.write_blurb || '',
      booking_help_text: g.booking_help_text || '',
      booking_questions: (g.booking_questions || []).map((f) => ({
        id: f.id,
        label: f.label,
        type: f.type,
      })),
      contact_email: g.contact_email || '',
      contact_phone: g.contact_phone || '',
      contact_location: g.contact_location || '',
      social_instagram: g.social_instagram || '',
      site_display_name: g.site_display_name || '',
      footer_blurb: (g.footer_blurb || '').slice(0, 120),
    }
  }

  if (name === 'get_settings_digest') {
    const [tags, brand, notices, thread, auth] = await Promise.all([
      listTags(),
      getBrandSettings(),
      getNotificationSettings(),
      loadAssistantThread(),
      Promise.resolve(pb.authStore.record),
    ])
    return {
      profile: {
        name: typeof auth?.name === 'string' ? auth.name : '',
        email: typeof auth?.email === 'string' ? auth.email : '',
        hasAvatar: Boolean(auth && typeof auth.avatar === 'string' && auth.avatar),
      },
      tags: tags.map((t) => ({ id: t.id, name: t.name })),
      brand: { hasLogo: Boolean(brand?.logo) },
      notices: {
        notify_email: notices.notify_email || '',
        client_gallery: notices.client_gallery !== false,
        client_expiring: notices.client_expiring !== false,
        channels: notices.channels || {},
      },
      assistant: {
        name: String((thread as { assistant_name?: string } | null)?.assistant_name || '').trim() || 'Assistant',
        hasAvatar: Boolean((thread as { assistant_avatar?: string } | null)?.assistant_avatar),
      },
    }
  }

  return { error: `Unknown read ${name}` }
}
