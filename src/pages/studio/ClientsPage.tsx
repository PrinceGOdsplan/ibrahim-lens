import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { PhoneNgInput } from '@/components/PhoneNgInput'
import { BookingAnswers } from '@/components/studio/BookingAnswers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NairaField } from '@/components/ui/naira-field'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  type BookingRecord,
  type PersonRecord,
  createBooking,
  hubBookings,
  listBookings,
  listBookingsForPerson,
  listPeople,
  paymentLine,
  removeBooking,
  statusLabel,
  unacceptedBookings,
  updateBooking,
  updatePerson,
  upsertPerson,
} from '@/lib/bookings'
import {
  type DeliveryFeedback,
  type DeliveryRecord,
  type DeliverySource,
  type FormInquiry,
  type InboxFolder,
  createDelivery,
  deleteDelivery,
  deliveryPublicUrl,
  filterInboxItems,
  formatTimeRemaining,
  isDeliveryActive,
  listDeliveries,
  listFeedback,
  listInquiries,
  markInquiryRead,
  personReferences,
  presentInboxItem,
  promoteFeedbackToTestimonial,
  removePerson,
  resendGalleryEmail,
  restoreDelivery,
  revokeDelivery,
  updateDelivery,
  updateFeedback,
} from '@/lib/clients'
import { listAlbumsWithCovers, listWork, mediaThumbUrl, type AlbumRecord, type MediaRecord, type WorkRecord } from '@/lib/library'
import { nationalFromE164 } from '@/lib/phone'
import { BookOpen, FolderOpen, Images, Inbox, Link2, MessageCircle, Plus, Truck, Users } from 'lucide-react'
import { StudioFullscreenModal } from '@/components/studio/StudioFullscreenModal'
import { StudioImageGallery } from '@/components/studio/StudioImageGallery'
import { StudioIcon, StudioTextIconButton } from '@/components/studio/StudioIconButton'
import { StudioTabs } from '@/components/studio/StudioTabs'
import { RevealOnOpen } from '@/components/studio/RevealOnOpen'
import { StudioHubHeader } from '@/components/studio/StudioHubHeader'
import { StudioHubShell, StudioScrollPane } from '@/components/studio/StudioHubShell'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Alert, PartialDataNotice } from '@/components/ui/alert'
import { useConfirm } from '@/components/ui/confirm'
import { Skeleton, SkeletonText } from '@/components/ui/skeleton'
import { pbErrorMessage } from '@/lib/pb-error'
import { settleAll } from '@/lib/useAsyncData'

type Tab = 'deliveries' | 'feedback' | 'people' | 'inbox'

const TABS: { id: Tab; label: string; icon: typeof Truck }[] = [
  { id: 'deliveries', label: 'Deliveries', icon: Truck },
  { id: 'feedback', label: 'Feedback', icon: MessageCircle },
  { id: 'people', label: 'People', icon: Users },
  { id: 'inbox', label: 'Inbox', icon: Inbox },
]

const VALID_TABS = new Set<string>(TABS.map((t) => t.id))

/** Used by actions that are not tied to one record, such as creating. */
const GLOBAL_SCOPE = '*'

const INBOX_FOLDERS: { id: InboxFolder; label: string }[] = [
  { id: 'requests', label: 'Requests' },
  { id: 'messages', label: 'Messages' },
]

const DELIVERY_SOURCES: { id: DeliverySource; label: string; icon: typeof Images }[] = [
  { id: 'images', label: 'Photos', icon: Images },
  { id: 'albums', label: 'Albums', icon: FolderOpen },
  { id: 'work', label: 'Work', icon: BookOpen },
]

const SOURCE_LABEL: Record<DeliverySource, string> = {
  images: 'Photos',
  albums: 'Albums',
  work: 'Work',
}

function formatPreferredAt(iso?: string) {
  if (!iso) return 'No date set'
  return formatDateTime(iso) || iso
}

function albumCoverUrl(album: AlbumRecord) {
  const first = album.expand?.images?.[0]
  return first?.file ? mediaThumbUrl(first, '400x400') : undefined
}

function workCoverUrl(work: WorkRecord) {
  const expanded = work.expand as { cover?: MediaRecord; images?: MediaRecord[] } | undefined
  if (expanded?.cover?.file) return mediaThumbUrl(expanded.cover, '400x400')
  const first = expanded?.images?.[0]
  return first?.file ? mediaThumbUrl(first, '400x400') : undefined
}

function deliveryPhotos(delivery: DeliveryRecord) {
  return delivery.expand?.images ?? []
}

function copyLinkDisabledReason(d: DeliveryRecord) {
  if (isDeliveryActive(d)) return undefined
  if (d.revoked) return 'This delivery link was revoked. Restore it to copy a working link.'
  return 'This delivery link has expired. Restore it to copy a working link.'
}

function DeliveryDetail({
  delivery,
  busy,
  onUpdate,
  onResend,
  onRestore,
  onRevoke,
  onDelete,
  onClose,
}: {
  delivery: DeliveryRecord
  busy: boolean
  onUpdate: (
    id: string,
    data: Partial<{ client_name: string; client_email: string; studio_notes: string }>,
  ) => void
  onResend: (
    id: string,
    patch?: Partial<{ client_name: string; client_email: string; studio_notes: string }>,
  ) => void
  onRestore: (id: string) => void
  onRevoke: (id: string) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  const [name, setName] = useState(delivery.client_name)
  const [email, setEmail] = useState(delivery.client_email ?? '')
  const [notes, setNotes] = useState(delivery.studio_notes ?? '')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setName(delivery.client_name)
    setEmail(delivery.client_email ?? '')
    setNotes(delivery.studio_notes ?? '')
    setCopied(false)
  }, [delivery.id, delivery.client_name, delivery.client_email, delivery.studio_notes])

  const thumbs = deliveryPhotos(delivery)
  const source = SOURCE_LABEL[delivery.source_type] ?? 'Photos'
  const person = delivery.expand?.person?.name
  const albumTitles = delivery.expand?.albums?.map((album) => album.title).filter(Boolean).join(', ')
  const workTitle = delivery.expand?.work?.title
  const active = isDeliveryActive(delivery)
  const draft = {
    client_name: name.trim(),
    client_email: email.trim(),
    studio_notes: notes,
  }
  const canEmail = active && Boolean(draft.client_email)
  const emailDisabledReason = !active
    ? delivery.revoked
      ? 'This delivery link was revoked. Restore it to email a working link.'
      : 'This delivery link has expired. Restore it to email a working link.'
    : !draft.client_email
      ? 'Add a client email to send the gallery link.'
      : undefined

  return (
    <div className="space-y-4 border-t border-studio-border px-4 py-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-studio-muted">
          {source}
          {albumTitles ? ` · ${albumTitles}` : ''}
          {workTitle ? ` · ${workTitle}` : ''}
          {person ? ` · ${person}` : ''}
        </p>
        <button type="button" className="text-xs text-studio-muted hover:text-studio-fg" onClick={onClose}>
          Close
        </button>
      </div>
      {thumbs.length ? (
        <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
          {thumbs.map((item) => (
            <li key={item.id}>
              <img src={mediaThumbUrl(item, '200x200')} alt="" className="aspect-square w-full object-cover" />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-studio-muted">No photographs on this delivery.</p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor={`delivery-name-${delivery.id}`}>Client name</Label>
          <Input
            id={`delivery-name-${delivery.id}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`delivery-email-${delivery.id}`}>Client email</Label>
          <Input
            id={`delivery-email-${delivery.id}`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor={`delivery-notes-${delivery.id}`}>Studio notes</Label>
        <Textarea
          id={`delivery-notes-${delivery.id}`}
          className="min-h-20"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={busy || !name.trim()}
          onClick={() => onUpdate(delivery.id, draft)}
        >
          Save
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy || !canEmail}
          title={emailDisabledReason}
          onClick={() => onResend(delivery.id, draft)}
        >
          Email client
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={!active}
          title={copyLinkDisabledReason(delivery)}
          onClick={async () => {
            await navigator.clipboard.writeText(deliveryPublicUrl(delivery.token))
            setCopied(true)
          }}
        >
          {copied ? 'Copied' : 'Copy link'}
        </Button>
        {active ? (
          <Button size="sm" variant="outline" disabled={busy} onClick={() => onRevoke(delivery.id)}>
            Revoke
          </Button>
        ) : (
          <Button size="sm" variant="outline" disabled={busy} onClick={() => onRestore(delivery.id)}>
            Restore
          </Button>
        )}
        <Button size="sm" variant="outline" disabled={busy} onClick={() => onDelete(delivery.id)}>
          Delete
        </Button>
      </div>
    </div>
  )
}

function CoverTile({
  selected,
  onClick,
  src,
  title,
}: {
  selected: boolean
  onClick: () => void
  src?: string
  title: string
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'overflow-hidden border text-left',
        selected ? 'border-studio-fg ring-1 ring-studio-fg' : 'border-studio-border hover:border-studio-fg/40',
      )}
    >
      {src ? (
        <img src={src} alt="" className="aspect-square w-full object-cover" />
      ) : (
        <span className="block aspect-square bg-studio-bg" aria-hidden />
      )}
      <span className="block truncate px-2 py-1.5 text-xs">{title}</span>
    </button>
  )
}

function ClientsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-5 w-32" />
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="rounded-lg border border-studio-border bg-studio-panel p-4">
            <Skeleton className="h-4 w-40" />
            <SkeletonText lines={2} className="mt-3" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function StudioClientsPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const rawTab = params.get('tab')
  const tab = (rawTab && VALID_TABS.has(rawTab) ? rawTab : 'inbox') as Tab
  const personParam = params.get('person')
  const bookingParam = params.get('booking')

  const [people, setPeople] = useState<PersonRecord[]>([])
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([])
  const [feedback, setFeedback] = useState<DeliveryFeedback[]>([])
  const [inquiries, setInquiries] = useState<FormInquiry[]>([])
  const [albums, setAlbums] = useState<AlbumRecord[]>([])
  const [work, setWork] = useState<WorkRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [busyScope, setBusyScope] = useState<string | null>(null)
  const [peopleFocusId, setPeopleFocusId] = useState<string | null>(() => params.get('person'))
  const [showCreate, setShowCreate] = useState(() => Boolean(params.get('booking')))
  const [showAddPerson, setShowAddPerson] = useState(false)
  const [showNewBooking, setShowNewBooking] = useState(false)
  const [bookingPersonId, setBookingPersonId] = useState<string | null>(null)
  const [peopleHistoryTick, setPeopleHistoryTick] = useState(0)
  /** Gates every empty state below: nothing is "clear" until the first load settles. */
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState<string[]>([])
  const { confirm, dialog: confirmDialog } = useConfirm()

  const refresh = useCallback(async () => {
    const { values, failed: missing } = await settleAll({
      People: listPeople,
      Bookings: listBookings,
      Deliveries: listDeliveries,
      Feedback: listFeedback,
      Inbox: listInquiries,
      Albums: listAlbumsWithCovers,
      Work: listWork,
    })

    if (missing.length === 7) throw new Error('Could not reach Studio.')

    // Only overwrite state for sources that answered, so a transient failure
    // does not blank a list the photographer was already looking at.
    if (values.People) setPeople(values.People)
    if (values.Bookings) setBookings(values.Bookings)
    if (values.Deliveries) setDeliveries(values.Deliveries)
    if (values.Feedback) setFeedback(values.Feedback)
    if (values.Inbox) setInquiries(values.Inbox.filter((x) => x.kind !== 'booking'))
    if (values.Albums) setAlbums(values.Albums)
    if (values.Work) setWork(values.Work)
    setFailed(missing)
  }, [])

  const load = useCallback(() => {
    let alive = true
    setError(null)
    refresh()
      .then(() => {
        if (alive) setError(null)
      })
      .catch((e) => {
        if (alive) setError(pbErrorMessage(e, 'Could not load your clients.'))
      })
      .finally(() => {
        if (alive) setLoaded(true)
      })
    return () => {
      alive = false
    }
  }, [refresh])

  useEffect(() => {
    return load()
  }, [load])

  useEffect(() => {
    if (tab !== 'feedback') return
    listFeedback()
      .then(setFeedback)
      .catch(() => undefined)
  }, [tab])

  useEffect(() => {
    if (tab === 'deliveries' && bookingParam) setShowCreate(true)
  }, [tab, bookingParam])

  useEffect(() => {
    setPeopleFocusId(personParam)
  }, [personParam])

  function setTab(next: Tab, extra?: Record<string, string>) {
    const nextParams: Record<string, string> = {}
    for (const key of ['person', 'booking', 'delivery', 'feedback', 'folder', 'inquiry'] as const) {
      const value = params.get(key)
      if (value) nextParams[key] = value
    }
    nextParams.tab = next
    if (next !== 'feedback') delete nextParams.feedback
    if (next !== 'deliveries') delete nextParams.delivery
    if (next !== 'inbox') {
      delete nextParams.folder
      delete nextParams.inquiry
    }
    if (extra) {
      for (const [k, v] of Object.entries(extra)) {
        if (v) nextParams[k] = v
        else delete nextParams[k]
      }
    }
    if (next !== 'deliveries') setShowCreate(false)
    if (next !== 'people') {
      setShowAddPerson(false)
      setShowNewBooking(false)
      setShowCreate(false)
    }
    setParams(nextParams)
  }

  /**
   * `scope` is the record the action touches. Everything used to share one
   * `busy` flag, so confirming one booking froze every other row on the page.
   */
  async function run(action: () => Promise<void>, ok = 'Saved.', scope = GLOBAL_SCOPE): Promise<boolean> {
    setBusyScope(scope)
    setError(null)
    setMessage(null)
    try {
      await action()
      await refresh()
      if (ok) setMessage(ok)
      return true
    } catch (e) {
      setError(pbErrorMessage(e))
      return false
    } finally {
      setBusyScope(null)
    }
  }

  // A success line that outlives the action it described reads as the result of
  // whatever the photographer did next.
  useEffect(() => {
    if (!message) return
    const id = window.setTimeout(() => setMessage(null), 4000)
    return () => window.clearTimeout(id)
  }, [message])

  if (rawTab === 'bookings') {
    const booking = params.get('booking')
    const q = booking ? `?booking=${encodeURIComponent(booking)}` : ''
    return <Navigate to={`/studio/bookings${q}`} replace />
  }
  if (rawTab === 'today') {
    const booking = params.get('booking')
    const section = params.get('section')
    if (section === 'collect' && booking) {
      return <Navigate to={`/studio/bookings?booking=${encodeURIComponent(booking)}`} replace />
    }
    return <Navigate to="/studio/clients?tab=inbox" replace />
  }

  return (
    <StudioHubShell>
      <StudioHubHeader
        title="Clients"
        actions={
          loaded && tab === 'deliveries' ? (
            <StudioTextIconButton
              label={showCreate ? 'Close' : 'Add'}
              icon={Plus}
              onClick={() => setShowCreate((open) => !open)}
            />
          ) : loaded && tab === 'people' ? (
            <StudioTextIconButton
              label={showAddPerson ? 'Close' : 'Add'}
              icon={Plus}
              onClick={() => setShowAddPerson((open) => !open)}
            />
          ) : undefined
        }
      >
        <div className="mt-3">
          <StudioTabs
            value={tab}
            onChange={(id) => setTab(id)}
            aria-label="Client sections"
            primary={TABS.filter((t) => t.id !== 'people' && t.id !== 'inbox').map((item) =>
              item.id === 'feedback' && loaded ? { ...item, count: feedback.length } : item,
            )}
            secondary={TABS.filter((t) => t.id === 'people' || t.id === 'inbox')}
          />
        </div>
      </StudioHubHeader>
      <StudioScrollPane innerClassName="flex min-h-0 flex-col space-y-6">
      {error && !(tab === 'deliveries' && showCreate) ? (
        <Alert variant="error" onRetry={load}>
          {error}
        </Alert>
      ) : null}
      <PartialDataNotice missing={failed} onRetry={load} />
      {message ? (
        <Alert variant="success" tone="studio">
          {message}
        </Alert>
      ) : null}

      {!loaded ? <ClientsSkeleton /> : null}

      {loaded && tab === 'deliveries' ? (
        <DeliveriesTab
          deliveries={deliveries}
          people={people}
          bookings={hubBookings(bookings)}
          albums={albums}
          work={work}
          busy={busyScope !== null}
          showCreate={showCreate}
          onCloseCreate={() => setShowCreate(false)}
          error={error}
          selectedId={params.get('delivery')}
          onSelect={(id) => {
            setShowCreate(false)
            setTab('deliveries', { delivery: id ?? '' })
          }}
          onCreate={async (input) => {
            let createdId = ''
            const ok = await run(async () => {
              const rec = await createDelivery(input)
              createdId = rec.id
            }, 'Delivery created.')
            if (ok && createdId) {
              setShowCreate(false)
              setTab('deliveries', { delivery: createdId })
            }
            return ok
          }}
          onUpdate={(id, data) => run(() => updateDelivery(id, data).then(() => undefined), 'Delivery saved.')}
          onResend={(id, patch) =>
            run(async () => {
              if (patch) await updateDelivery(id, patch)
              await resendGalleryEmail(id)
            }, 'Gallery email sent.')
          }
          onRestore={async (id) => {
            const delivery = deliveries.find((d) => d.id === id)
            const who = delivery?.expand?.person?.name || delivery?.client_name
            const ok = await confirm({
              title: 'Restore this delivery link?',
              body: `The same link works again for 7 days${who ? ` for ${who}` : ''}.`,
              confirmLabel: 'Restore link',
            })
            if (!ok) return
            await run(() => restoreDelivery(id).then(() => undefined), 'Delivery restored.')
          }}
          onRevoke={async (id) => {
            const delivery = deliveries.find((d) => d.id === id)
            const ok = await confirm({
              title: 'Revoke this delivery link?',
              body: `The link stops working immediately${
                delivery?.expand?.person?.name ? ` for ${delivery.expand.person.name}` : ''
              }. Anyone who saved it loses access. You can restore it later or delete it.`,
              confirmLabel: 'Revoke link',
              destructive: true,
            })
            if (!ok) return
            await run(() => revokeDelivery(id).then(() => undefined), 'Delivery revoked.')
          }}
          onDelete={async (id) => {
            const delivery = deliveries.find((d) => d.id === id)
            const who = delivery?.expand?.person?.name || delivery?.client_name
            const ok = await confirm({
              title: 'Delete this delivery link?',
              body: `This removes the gallery${who ? ` for ${who}` : ''} and any feedback on it. Anyone with the link loses access.`,
              confirmLabel: 'Delete link',
              destructive: true,
            })
            if (!ok) return
            const gone = await run(() => deleteDelivery(id), 'Delivery deleted.')
            if (gone && params.get('delivery') === id) setTab('deliveries', { delivery: '' })
          }}
        />
      ) : null}

      {loaded && tab === 'feedback' ? (
        <FeedbackTab
          feedback={feedback}
          busy={busyScope !== null}
          selectedId={params.get('feedback')}
          onSelect={(id) => setTab('feedback', { feedback: id ?? '' })}
          onSave={(id, data) => run(() => updateFeedback(id, data).then(() => undefined))}
          onPromote={(item, quote, author) =>
            run(() => promoteFeedbackToTestimonial(item, quote, author).then(() => undefined), 'Published as testimonial.')
          }
        />
      ) : null}

      {loaded && tab === 'people' ? (
        <>
        <PeopleTab
          people={people}
          busy={busyScope !== null}
          focusPersonId={peopleFocusId}
          historyTick={peopleHistoryTick}
          showAdd={showAddPerson}
          onShowAdd={setShowAddPerson}
          onSave={(data) =>
            run(async () => {
              await upsertPerson(data)
              setShowAddPerson(false)
            }, 'Person saved.')
          }
          onUpdate={(id, data) => run(() => updatePerson(id, data).then(() => undefined))}
          onNewBooking={(personId) => {
            setBookingPersonId(personId)
            setShowNewBooking(true)
          }}
          onSendPhotos={(personId) => {
            setShowCreate(true)
            const next = new URLSearchParams(params)
            next.set('tab', 'people')
            next.set('person', personId)
            setParams(next)
          }}
        />
        {showCreate ? (
          <DeliveriesTab
            createOnly
            deliveries={deliveries}
            people={people}
            bookings={hubBookings(bookings)}
            albums={albums}
            work={work}
            busy={busyScope !== null}
            showCreate={showCreate}
            onCloseCreate={() => setShowCreate(false)}
            error={error}
            selectedId={null}
            onSelect={() => undefined}
            onCreate={async (input) => {
              let createdId = ''
              const ok = await run(async () => {
                const rec = await createDelivery(input)
                createdId = rec.id
              }, 'Photos sent.')
              if (ok && createdId) setShowCreate(false)
              return ok
            }}
            onUpdate={() => undefined}
            onResend={() => undefined}
            onRestore={() => undefined}
            onRevoke={() => undefined}
            onDelete={() => undefined}
          />
        ) : null}
        {showNewBooking && bookingPersonId ? (
          <PersonBookingSheet
            person={people.find((p) => p.id === bookingPersonId) ?? null}
            busy={busyScope !== null}
            onClose={() => {
              setShowNewBooking(false)
              setBookingPersonId(null)
            }}
            onCreate={async (input) => {
              const ok = await run(
                () => createBooking({ ...input, personId: bookingPersonId, status: 'pending', source: 'manual' }).then(() => undefined),
                'Booking added.',
              )
              if (ok) {
                setShowNewBooking(false)
                setBookingPersonId(null)
                setPeopleFocusId(bookingPersonId)
                setPeopleHistoryTick((n) => n + 1)
              }
              return ok
            }}
          />
        ) : null}
        </>
      ) : null}

      {loaded && tab === 'inbox' ? (
        <InboxTab
          inquiries={inquiries}
          requests={unacceptedBookings(bookings)}
          busyScope={busyScope}
          onOpenTab={setTab}
          onAccept={async (booking) => {
            const ok = await run(
              () => updateBooking(booking.id, { status: 'pending' }).then(() => undefined),
              'Accepted into Bookings.',
              booking.id,
            )
            if (ok) navigate(`/studio/bookings?booking=${booking.id}`)
          }}
          onDelete={async (booking) => {
            const name = booking.expand?.person?.name?.trim() || 'this client'
            const ok = await confirm({
              title: `Delete ${name}'s request?`,
              body: 'This request will never become a booking. This cannot be recovered.',
              confirmLabel: 'Delete request',
              destructive: true,
            })
            if (!ok) return
            const personId = booking.person
            const removed = await run(() => removeBooking(booking.id), 'Request deleted.', booking.id)
            if (!removed) return
            const refs = await personReferences(personId)
            if (refs.bookings === 0 && refs.deliveries === 0) {
              const also = await confirm({
                title: `Remove ${name} from the directory?`,
                body: 'They have no other bookings or deliveries. Keep them if you still want the name or phone.',
                confirmLabel: 'Remove person',
                cancelLabel: 'Keep person',
                destructive: true,
              })
              if (also) {
                await run(() => removePerson(personId), `${name} removed from the directory.`)
              }
            }
          }}
          onMarkRead={async (id) => {
            try {
              const updated = await markInquiryRead(id)
              setInquiries((prev) => prev.map((item) => (item.id === id ? updated : item)))
            } catch (e) {
              // Silently failing here leaves the unread badge lying about state.
              setError(pbErrorMessage(e, 'Could not mark that message as read.'))
            }
          }}
        />
      ) : null}

      {confirmDialog}
      </StudioScrollPane>
    </StudioHubShell>
  )
}

function PersonEditor({
  person,
  history,
  national,
  onNational,
  onUpdate,
  onNewBooking,
  onSendPhotos,
  onClose,
}: {
  person: PersonRecord
  history: BookingRecord[]
  national: string
  onNational: (value: string) => void
  onUpdate: (id: string, data: Partial<{ name: string; phone: string; email: string; notes: string }>) => void
  onNewBooking: (personId: string) => void
  onSendPhotos: (personId: string) => void
  onClose: () => void
}) {
  return (
    <div className="space-y-3 border-t border-studio-border px-4 py-4">
      <div className="flex justify-end">
        <button type="button" className="text-xs text-studio-muted hover:text-studio-fg" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${person.id}-name`}>Name</Label>
        <Input
          id={`${person.id}-name`}
          defaultValue={person.name}
          key={`${person.id}-name`}
          onBlur={(e) => {
            if (e.target.value.trim() && e.target.value !== person.name) onUpdate(person.id, { name: e.target.value })
          }}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${person.id}-phone`}>Phone</Label>
        <PhoneNgInput
          id={`${person.id}-phone`}
          national={national}
          onChange={onNational}
          onBlur={() => {
            if (national && national !== nationalFromE164(person.phone_e164)) {
              onUpdate(person.id, { phone: `+234${national}` })
            }
          }}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${person.id}-email`}>Email</Label>
        <Input
          id={`${person.id}-email`}
          type="email"
          defaultValue={person.email ?? ''}
          key={`${person.id}-email`}
          placeholder="e.g. ada@email.com"
          onBlur={(e) => {
            if (e.target.value !== (person.email ?? '')) onUpdate(person.id, { email: e.target.value })
          }}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${person.id}-notes`}>Notes</Label>
        <Textarea
          id={`${person.id}-notes`}
          defaultValue={person.notes ?? ''}
          key={`${person.id}-notes`}
          placeholder="e.g. Prefers weekend shoots"
          onBlur={(e) => {
            if (e.target.value !== (person.notes ?? '')) onUpdate(person.id, { notes: e.target.value })
          }}
        />
      </div>
      <div>
        <p className="text-xs uppercase text-studio-muted">Bookings</p>
        {!history.length ? <p className="mt-1 text-sm text-studio-muted">None yet.</p> : null}
        <ul className="mt-2 space-y-1 text-sm">
          {history.map((b) => (
            <li key={b.id}>
              <Link
                to={`/studio/bookings?booking=${encodeURIComponent(b.id)}`}
                className="text-studio-fg underline-offset-2 hover:underline"
              >
                {statusLabel(b.status)} · {paymentLine(b)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        <Button size="sm" variant="outline" onClick={() => onNewBooking(person.id)}>
          New booking
        </Button>
        <Button size="sm" variant="outline" onClick={() => onSendPhotos(person.id)}>
          Send photos
        </Button>
      </div>
    </div>
  )
}

function PeopleTab({
  people,
  busy,
  focusPersonId,
  historyTick,
  showAdd,
  onShowAdd,
  onSave,
  onUpdate,
  onNewBooking,
  onSendPhotos,
}: {
  people: PersonRecord[]
  busy: boolean
  focusPersonId: string | null
  historyTick: number
  showAdd: boolean
  onShowAdd: (open: boolean) => void
  onSave: (data: { name: string; phone: string; email?: string; notes?: string }) => void
  onUpdate: (id: string, data: Partial<{ name: string; phone: string; email: string; notes: string }>) => void
  onNewBooking: (personId: string) => void
  onSendPhotos: (personId: string) => void
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [name, setName] = useState('')
  const [national, setNational] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [history, setHistory] = useState<BookingRecord[]>([])
  const [editNational, setEditNational] = useState('')

  useEffect(() => {
    if (focusPersonId && people.some((p) => p.id === focusPersonId)) {
      setActiveId(focusPersonId)
    }
  }, [focusPersonId, people])

  useEffect(() => {
    if (!activeId) {
      setHistory([])
      return
    }
    listBookingsForPerson(activeId)
      .then(setHistory)
      .catch(() => setHistory([]))
  }, [activeId, historyTick])

  const active = people.find((p) => p.id === activeId)

  useEffect(() => {
    setEditNational(nationalFromE164(active?.phone_e164 ?? ''))
  }, [active?.id, active?.phone_e164])

  useEffect(() => {
    if (showAdd) return
    setName('')
    setNational('')
    setEmail('')
    setNotes('')
  }, [showAdd])

  const addDirty = Boolean(name.trim() || national || email.trim() || notes.trim())

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return people
    return people.filter((p) => {
      const hay = [p.name, p.phone_e164, p.email ?? ''].join(' ').toLowerCase()
      return hay.includes(q)
    })
  }, [people, search])

  function openPerson(id: string) {
    const nextId = activeId === id ? null : id
    setActiveId(nextId)
    const next = new URLSearchParams(searchParams)
    next.set('tab', 'people')
    if (nextId) next.set('person', nextId)
    else next.delete('person')
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="space-y-3">
      <h2 className="font-medium">Directory ({people.length})</h2>
      {people.length ? (
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, phone, or email…"
          aria-label="Search people"
        />
      ) : null}
      {!people.length ? (
        <p className="text-sm text-studio-muted">No one in the list yet. Use Add to save a person.</p>
      ) : null}
      {people.length && !filtered.length ? (
        <p className="text-sm text-studio-muted">No matches for &ldquo;{search.trim()}&rdquo;.</p>
      ) : null}
      <div className="space-y-3">
        {filtered.map((p) => {
          const open = activeId === p.id
          return (
            <RevealOnOpen
              key={p.id}
              as="article"
              open={open}
              id={p.id}
              className="border border-studio-border bg-studio-panel text-sm"
            >
              <button type="button" className="w-full px-4 py-3 text-left" onClick={() => openPerson(p.id)}>
                <p className="font-medium">{p.name}</p>
                <p className="text-studio-muted">{p.phone_e164}</p>
              </button>
              {open && active ? (
                <PersonEditor
                  person={active}
                  history={history}
                  national={editNational}
                  onNational={setEditNational}
                  onUpdate={onUpdate}
                  onNewBooking={onNewBooking}
                  onSendPhotos={onSendPhotos}
                  onClose={() => openPerson(p.id)}
                />
              ) : null}
            </RevealOnOpen>
          )
        })}
      </div>

      <StudioFullscreenModal
        open={showAdd}
        title="Add person"
        dirty={addDirty}
        discardTitle="Discard this person?"
        discardBody="You have started a new person entry that has not been saved."
        onClose={() => onShowAdd(false)}
        footer={
          <Button
            className="w-full"
            disabled={busy || !name.trim() || !national}
            onClick={() => {
              onSave({ name, phone: `+234${national}`, email, notes })
              setName('')
              setNational('')
              setEmail('')
              setNotes('')
            }}
          >
            Save person
          </Button>
        }
      >
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="person-name">Name *</Label>
            <Input id="person-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ada Okonkwo" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="person-phone">Phone *</Label>
            <PhoneNgInput id="person-phone" national={national} onChange={setNational} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="person-email">Email</Label>
            <Input
              id="person-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. ada@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="person-notes">Notes</Label>
            <Textarea
              id="person-notes"
              className="min-h-20"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Prefers weekend shoots"
            />
          </div>
        </div>
      </StudioFullscreenModal>
    </div>
  )
}

function DeliveriesTab({
  deliveries,
  people,
  bookings,
  albums,
  work,
  busy,
  createOnly = false,
  showCreate,
  onCloseCreate,
  error,
  selectedId,
  onSelect,
  onCreate,
  onUpdate,
  onResend,
  onRestore,
  onRevoke,
  onDelete,
}: {
  deliveries: DeliveryRecord[]
  people: PersonRecord[]
  bookings: BookingRecord[]
  albums: AlbumRecord[]
  work: WorkRecord[]
  busy: boolean
  createOnly?: boolean
  showCreate: boolean
  onCloseCreate: () => void
  error: string | null
  selectedId: string | null
  onSelect: (id: string | null) => void
  onCreate: (input: {
    clientName: string
    clientEmail?: string
    personId?: string
    bookingId?: string
    sourceType: DeliverySource
    imageIds?: string[]
    albumIds?: string[]
    workId?: string
  }) => Promise<boolean>
  onUpdate: (
    id: string,
    data: Partial<{ client_name: string; client_email: string; studio_notes: string }>,
  ) => void
  onResend: (
    id: string,
    patch?: Partial<{ client_name: string; client_email: string; studio_notes: string }>,
  ) => void
  onRestore: (id: string) => void
  onRevoke: (id: string) => void
  onDelete: (id: string) => void
}) {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [personId, setPersonId] = useState('')
  const [bookingId, setBookingId] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [sourceType, setSourceType] = useState<DeliverySource>('images')
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [selectedAlbums, setSelectedAlbums] = useState<string[]>([])
  const [selectedWork, setSelectedWork] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)

  const personBookings = bookings.filter((b) => b.person === personId)
  const hasSource =
    sourceType === 'images'
      ? selectedImages.length > 0
      : sourceType === 'albums'
        ? selectedAlbums.length > 0
        : Boolean(selectedWork)
  const canCreate = Boolean(clientName.trim()) && hasSource

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return deliveries
    return deliveries.filter((d) => {
      const personName = d.expand?.person?.name ?? ''
      const hay = [d.client_name, d.client_email ?? '', personName].join(' ').toLowerCase()
      return hay.includes(q)
    })
  }, [deliveries, search])

  useEffect(() => {
    const p = searchParams.get('person')
    const b = searchParams.get('booking')
    if (p) setPersonId(p)
    if (b) setBookingId(b)
  }, [searchParams])

  useEffect(() => {
    if (showCreate) return
    setPersonId('')
    setBookingId('')
    setClientName('')
    setClientEmail('')
    setSourceType('images')
    setSelectedImages([])
    setSelectedAlbums([])
    setSelectedWork('')
    setPickerOpen(false)
  }, [showCreate])

  useEffect(() => {
    const p = people.find((x) => x.id === personId)
    if (p) {
      setClientName(p.name)
      if (p.email) setClientEmail(p.email)
    }
  }, [personId, people])

  return (
    <div className="space-y-8">
      <StudioFullscreenModal
        open={showCreate}
        title={createOnly ? 'Send photos' : 'New delivery'}
        dirty={Boolean(clientName.trim() || clientEmail.trim() || hasSource || personId)}
        discardTitle="Discard this delivery?"
        discardBody="You have started a new delivery that has not been created."
        onClose={onCloseCreate}
        footer={
          <Button
            className="w-full"
            disabled={busy || !canCreate}
            onClick={() =>
              void onCreate({
                clientName,
                clientEmail: clientEmail.trim() || people.find((p) => p.id === personId)?.email || undefined,
                personId: personId || undefined,
                bookingId: bookingId || undefined,
                sourceType,
                imageIds: selectedImages,
                albumIds: selectedAlbums,
                workId: selectedWork || undefined,
              })
            }
          >
            <StudioIcon icon={Link2} />
            {busy ? 'Sending…' : createOnly ? 'Send photos' : 'Create delivery'}
          </Button>
        }
      >
        <div className="space-y-4">
          {error ? <Alert variant="error">{error}</Alert> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="delivery-person">Person</Label>
              <Select
                id="delivery-person"
                value={personId}
                onChange={(e) => {
                  setPersonId(e.target.value)
                  setBookingId('')
                  setClientEmail('')
                }}
              >
                <option value="">Optional — or type name below</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>
            {personId ? (
              <div className="space-y-2">
                <Label htmlFor="delivery-booking">Booking (optional)</Label>
                <Select
                  id="delivery-booking"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                >
                  <option value="">None</option>
                  {personBookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {statusLabel(b.status)} · {formatPreferredAt(b.preferred_at)}
                    </option>
                  ))}
                </Select>
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="delivery-client-name">Client name *</Label>
              <Input
                id="delivery-client-name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Ada Okonkwo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery-email">Client email</Label>
              <Input
                id="delivery-email"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="e.g. ada@email.com"
              />
              <p className="text-xs text-studio-muted">
                {personId
                  ? 'Filled from this person if they have an email saved.'
                  : 'Needed if you want to email the client the gallery link.'}
              </p>
            </div>
          </div>

          <StudioTabs
            value={sourceType}
            onChange={setSourceType}
            aria-label="Delivery contents"
            primary={DELIVERY_SOURCES}
          />

          {sourceType === 'images' ? (
            <div className="space-y-3">
              {selectedImages.length ? (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-studio-muted">{selectedImages.length} selected</p>
                  <StudioTextIconButton label="Add more" icon={Images} onClick={() => setPickerOpen(true)} />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="flex h-40 w-full flex-col items-center justify-center gap-2 border border-dashed border-studio-border px-4 text-center text-sm text-studio-muted hover:border-studio-fg/40 hover:text-studio-fg"
                >
                  <StudioIcon icon={Images} />
                  Pick photos
                </button>
              )}
              <StudioImageGallery
                open={pickerOpen}
                title="Pick photos for this delivery"
                selected={selectedImages}
                onClose={() => setPickerOpen(false)}
                onDone={(ids) => {
                  setSelectedImages(ids)
                  setPickerOpen(false)
                }}
              />
            </div>
          ) : null}

          {sourceType === 'albums' ? (
            albums.length ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {albums.map((album) => (
                  <CoverTile
                    key={album.id}
                    title={album.title}
                    src={albumCoverUrl(album)}
                    selected={selectedAlbums.includes(album.id)}
                    onClick={() =>
                      setSelectedAlbums((prev) =>
                        prev.includes(album.id) ? prev.filter((id) => id !== album.id) : [...prev, album.id],
                      )
                    }
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-studio-muted">No albums yet. Make one in Gallery.</p>
            )
          ) : null}

          {sourceType === 'work' ? (
            work.length ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {work.map((item) => (
                  <CoverTile
                    key={item.id}
                    title={item.title}
                    src={workCoverUrl(item)}
                    selected={selectedWork === item.id}
                    onClick={() => setSelectedWork((prev) => (prev === item.id ? '' : item.id))}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-studio-muted">No Work yet. Make one in Gallery.</p>
            )
          ) : null}
        </div>
      </StudioFullscreenModal>

      {createOnly ? null : (
      <section className="space-y-3">
        <h2 className="sr-only">Deliveries</h2>
        {deliveries.length ? (
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client name, email, or person…"
            aria-label="Search deliveries"
          />
        ) : null}
        {!deliveries.length ? (
          <p className="flex h-40 items-center justify-center border border-dashed border-studio-border px-4 text-center text-sm text-studio-muted">
            No deliveries yet. Add one to send a private gallery.
          </p>
        ) : !filtered.length ? (
          <p className="text-sm text-studio-muted">No matches for &ldquo;{search.trim()}&rdquo;.</p>
        ) : (
          filtered.map((d) => {
            const active = isDeliveryActive(d)
            const open = selectedId === d.id
            return (
              <RevealOnOpen
                key={d.id}
                as="article"
                open={open}
                id={d.id}
                className="border border-studio-border bg-studio-panel text-sm"
              >
                <button
                  type="button"
                  className="w-full px-4 py-3 text-left"
                  onClick={() => onSelect(open ? null : d.id)}
                >
                  <p className="font-medium">{d.client_name}</p>
                  <p className="text-studio-muted">
                    {active ? formatTimeRemaining(d.expires_at) : d.revoked ? 'Revoked' : 'Expired'}
                    {d.images?.length ? ` · ${d.images.length} photo${d.images.length === 1 ? '' : 's'}` : ''}
                  </p>
                </button>
                {open ? (
                  <DeliveryDetail
                    delivery={d}
                    busy={busy}
                    onUpdate={onUpdate}
                    onResend={onResend}
                    onRestore={onRestore}
                    onRevoke={onRevoke}
                    onDelete={onDelete}
                    onClose={() => onSelect(null)}
                  />
                ) : null}
              </RevealOnOpen>
            )
          })
        )}
      </section>
      )}
    </div>
  )
}

function PersonBookingSheet({
  person,
  busy,
  onClose,
  onCreate,
}: {
  person: PersonRecord | null
  busy: boolean
  onClose: () => void
  onCreate: (input: { preferredAt?: string; feeNgn?: number; amountPaidNgn?: number; studioNotes?: string }) => Promise<boolean>
}) {
  const [preferred, setPreferred] = useState('')
  const [fee, setFee] = useState('')
  const [paid, setPaid] = useState('')
  const [notes, setNotes] = useState('')
  const feeNgn = Number(fee) || 0
  const amountPaidNgn = feeNgn > 0 ? Math.min(feeNgn, Math.max(0, Number(paid) || 0)) : 0
  const dirty = Boolean(preferred || fee || paid || notes.trim())

  return (
    <StudioFullscreenModal
      open={Boolean(person)}
      title="New booking"
      dirty={dirty}
      discardTitle="Discard this booking?"
      discardBody="You have started a booking that has not been saved."
      onClose={onClose}
      footer={
        <Button
          className="w-full"
          disabled={busy || !person}
          onClick={() =>
            void onCreate({
              preferredAt: preferred,
              feeNgn,
              amountPaidNgn,
              studioNotes: notes.trim() || undefined,
            })
          }
        >
          {busy ? 'Saving…' : 'Save booking'}
        </Button>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-studio-muted">
          {person?.name}
          {person?.phone_e164 ? ` · ${person.phone_e164}` : ''}
        </p>
        <div>
          <Label htmlFor="person-booking-date">Date</Label>
          <Input
            id="person-booking-date"
            className="mt-1"
            type="datetime-local"
            value={preferred}
            onChange={(e) => setPreferred(e.target.value)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="person-booking-fee">Fee</Label>
            <NairaField
              id="person-booking-fee"
              className="mt-1"
              placeholder="0"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="person-booking-paid">Paid</Label>
            <NairaField
              id="person-booking-paid"
              className="mt-1"
              placeholder="0"
              value={paid}
              onChange={(e) => setPaid(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="person-booking-notes">Notes</Label>
          <Textarea
            id="person-booking-notes"
            className="mt-1"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Deposit, outfit, pickup…"
          />
        </div>
      </div>
    </StudioFullscreenModal>
  )
}

function feedbackPreview(message: string) {
  const line = message.replace(/\s+/g, ' ').trim()
  if (!line) return 'No message'
  return line.length > 88 ? `${line.slice(0, 87)}…` : line
}

function FeedbackTab({
  feedback,
  busy,
  selectedId,
  onSelect,
  onSave,
  onPromote,
}: {
  feedback: DeliveryFeedback[]
  busy: boolean
  selectedId: string | null
  onSelect: (id: string | null) => void
  onSave: (id: string, data: Partial<{ message: string; reviewed: boolean; client_name: string }>) => void
  onPromote: (item: DeliveryFeedback, quote: string, author: string) => void
}) {
  return (
    <section className="space-y-3">
      <h2 className="sr-only">Feedback</h2>
      {!feedback.length ? <p className="text-sm text-studio-muted">No feedback yet.</p> : null}
      {feedback.map((item) => {
        const author = item.client_name ?? item.expand?.delivery?.client_name ?? 'Client'
        const open = selectedId === item.id
        return (
          <RevealOnOpen
            key={item.id}
            as="article"
            open={open}
            id={item.id}
            className="border border-studio-border bg-studio-panel text-sm"
          >
            <button
              type="button"
              className="w-full px-4 py-3 text-left"
              onClick={() => onSelect(open ? null : item.id)}
            >
              <p className="font-medium">{author}</p>
              <p className="truncate text-studio-muted">{feedbackPreview(item.message ?? '')}</p>
              <p className="mt-1 text-xs text-studio-muted">
                {formatDateTime(item.created) || 'Recent'}
                {item.promoted ? ' · Testimonial' : item.reviewed ? ' · Read' : ''}
              </p>
            </button>
            {open ? (
              <FeedbackDetail
                item={item}
                busy={busy}
                onSave={onSave}
                onPromote={onPromote}
                onClose={() => onSelect(null)}
              />
            ) : null}
          </RevealOnOpen>
        )
      })}
    </section>
  )
}

function FeedbackDetail({
  item,
  busy,
  onSave,
  onPromote,
  onClose,
}: {
  item: DeliveryFeedback
  busy: boolean
  onSave: (id: string, data: Partial<{ message: string; reviewed: boolean; client_name: string }>) => void
  onPromote: (item: DeliveryFeedback, quote: string, author: string) => void
  onClose: () => void
}) {
  const [message, setMessage] = useState(item.message ?? '')
  const [author, setAuthor] = useState(item.client_name ?? item.expand?.delivery?.client_name ?? 'Client')

  useEffect(() => {
    setMessage(item.message ?? '')
    setAuthor(item.client_name ?? item.expand?.delivery?.client_name ?? 'Client')
  }, [item.id, item.message, item.client_name, item.expand?.delivery?.client_name])

  return (
    <div className="space-y-3 border-t border-studio-border px-4 py-4">
      <div className="flex justify-end">
        <button type="button" className="text-xs text-studio-muted hover:text-studio-fg" onClick={onClose}>
          Close
        </button>
      </div>
      <Textarea
        aria-label={`Feedback from ${author}`}
        className="min-h-24"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <div className="space-y-1">
        <Label htmlFor={`feedback-author-${item.id}`}>Name</Label>
        <Input
          id={`feedback-author-${item.id}`}
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled={busy} onClick={() => onSave(item.id, { message, client_name: author, reviewed: true })}>
          Save
        </Button>
        <Button size="sm" disabled={busy || item.promoted} onClick={() => onPromote(item, message, author)}>
          {item.promoted ? 'Promoted' : 'Publish testimonial'}
        </Button>
      </div>
    </div>
  )
}

type InboxRow =
  | { key: string; sort: string; type: 'request'; booking: BookingRecord }
  | { key: string; sort: string; type: 'inquiry'; inquiry: FormInquiry }

function mergeInbox(inquiries: FormInquiry[], requests: BookingRecord[], folder: InboxFolder): InboxRow[] {
  const inq: InboxRow[] = filterInboxItems(inquiries, folder).map((inquiry) => ({
    key: `inq-${inquiry.id}`,
    sort: inquiry.created,
    type: 'inquiry',
    inquiry,
  }))
  const reqs: InboxRow[] =
    folder === 'requests'
      ? requests.map((booking) => ({
          key: `req-${booking.id}`,
          sort: booking.created,
          type: 'request',
          booking,
        }))
      : []
  return [...inq, ...reqs].sort((a, b) => (a.sort < b.sort ? 1 : -1))
}

function InboxTab({
  inquiries,
  requests,
  busyScope,
  onOpenTab,
  onAccept,
  onDelete,
  onMarkRead,
}: {
  inquiries: FormInquiry[]
  requests: BookingRecord[]
  busyScope: string | null
  onOpenTab: (tab: Tab) => void
  onAccept: (booking: BookingRecord) => void
  onDelete: (booking: BookingRecord) => void
  onMarkRead: (id: string) => void
}) {
  const [params, setParams] = useSearchParams()
  const folder: InboxFolder = params.get('folder') === 'messages' ? 'messages' : 'requests'
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const rows = useMemo(() => mergeInbox(inquiries, requests, folder), [inquiries, requests, folder])
  const selected = rows.find((r) => r.key === selectedKey) ?? null
  const inquiry = selected?.type === 'inquiry' ? selected.inquiry : null
  const busy = busyScope !== null

  function setFolder(next: InboxFolder) {
    const nextParams = new URLSearchParams(params)
    nextParams.set('tab', 'inbox')
    if (next === 'messages') nextParams.set('folder', 'messages')
    else nextParams.delete('folder')
    nextParams.delete('inquiry')
    nextParams.delete('booking')
    setParams(nextParams)
    setSelectedKey(null)
  }

  function openRow(key: string) {
    const nextKey = selectedKey === key ? null : key
    setSelectedKey(nextKey)
    const nextParams = new URLSearchParams(params)
    nextParams.set('tab', 'inbox')
    nextParams.delete('inquiry')
    nextParams.delete('booking')
    if (nextKey?.startsWith('inq-')) nextParams.set('inquiry', nextKey.slice(4))
    if (nextKey?.startsWith('req-')) nextParams.set('booking', nextKey.slice(4))
    setParams(nextParams, { replace: true })
  }

  useEffect(() => {
    const inquiryId = params.get('inquiry')
    const bookingId = params.get('booking')
    if (inquiryId) {
      const key = `inq-${inquiryId}`
      if (rows.some((r) => r.key === key)) setSelectedKey(key)
      return
    }
    if (bookingId && folder === 'requests') {
      const key = `req-${bookingId}`
      if (rows.some((r) => r.key === key)) setSelectedKey(key)
    }
  }, [params, rows, folder])

  useEffect(() => {
    if (selectedKey && !rows.some((r) => r.key === selectedKey)) setSelectedKey(null)
  }, [rows, selectedKey])

  useEffect(() => {
    if (inquiry && !presentInboxItem(inquiry).isRead) onMarkRead(inquiry.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inquiry?.id])

  return (
    <section className="space-y-3">
      <StudioTabs
        value={folder}
        onChange={setFolder}
        aria-label="Inbox folders"
        primary={INBOX_FOLDERS}
      />
      <p className="text-xs text-studio-muted">
        Requests from the site, and messages people write you. Accept a request to move it into Bookings.
      </p>
      {!rows.length ? <p className="text-sm text-studio-muted">Inbox empty.</p> : null}
      {rows.map((row) => {
        const open = selectedKey === row.key
        if (row.type === 'request') {
          const name = row.booking.expand?.person?.name ?? 'Booking request'
          return (
            <RevealOnOpen
              key={row.key}
              as="article"
              open={open}
              id={row.key}
              className="border border-studio-border bg-studio-panel text-sm"
            >
              <button type="button" className="w-full px-4 py-3 text-left" onClick={() => openRow(row.key)}>
                <p className="font-medium">{name}</p>
                <p className="text-studio-muted">
                  Booking request · {formatPreferredAt(row.booking.preferred_at)}
                </p>
              </button>
              {open ? (
                <InboxRequestDetail
                  booking={row.booking}
                  busy={busy}
                  onAccept={onAccept}
                  onDelete={onDelete}
                  onViewClient={() => {
                    const nextParams = new URLSearchParams(params)
                    nextParams.set('tab', 'people')
                    nextParams.set('person', row.booking.person)
                    nextParams.delete('folder')
                    nextParams.delete('inquiry')
                    nextParams.delete('booking')
                    setParams(nextParams)
                  }}
                  onClose={() => openRow(row.key)}
                />
              ) : null}
            </RevealOnOpen>
          )
        }
        const item = presentInboxItem(row.inquiry)
        return (
          <RevealOnOpen
            key={row.key}
            as="article"
            open={open}
            id={row.key}
            className="border border-studio-border bg-studio-panel text-sm"
          >
            <button type="button" className="w-full px-4 py-3 text-left" onClick={() => openRow(row.key)}>
              <p className={cn(!item.isRead && 'font-semibold')}>{item.from}</p>
              <p className="truncate text-studio-muted">{item.subject}</p>
            </button>
            {open ? (
              <InboxMessageDetail
                inquiry={row.inquiry}
                onOpenTab={onOpenTab}
                onClose={() => openRow(row.key)}
              />
            ) : null}
          </RevealOnOpen>
        )
      })}
    </section>
  )
}

function InboxRequestDetail({
  booking,
  busy,
  onAccept,
  onDelete,
  onViewClient,
  onClose,
}: {
  booking: BookingRecord
  busy: boolean
  onAccept: (booking: BookingRecord) => void
  onDelete: (booking: BookingRecord) => void
  onViewClient: () => void
  onClose: () => void
}) {
  return (
    <div className="space-y-3 border-t border-studio-border px-4 py-4">
      <div className="flex justify-end">
        <button type="button" className="text-xs text-studio-muted hover:text-studio-fg" onClick={onClose}>
          Close
        </button>
      </div>
      <p className="text-studio-muted">
        {booking.expand?.person?.phone_e164} · {formatPreferredAt(booking.preferred_at)}
      </p>
      <BookingAnswers answers={booking.answers} />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={busy} onClick={() => onAccept(booking)}>
          Accept
        </Button>
        {booking.person ? (
          <Button size="sm" variant="outline" onClick={onViewClient}>
            View client
          </Button>
        ) : null}
        <Button size="sm" variant="outline" disabled={busy} onClick={() => onDelete(booking)}>
          Delete
        </Button>
      </div>
    </div>
  )
}

function InboxMessageDetail({
  inquiry,
  onOpenTab,
  onClose,
}: {
  inquiry: FormInquiry
  onOpenTab: (tab: Tab) => void
  onClose: () => void
}) {
  const presented = presentInboxItem(inquiry)
  return (
    <div className="space-y-3 border-t border-studio-border px-4 py-4">
      <div className="flex justify-end">
        <button type="button" className="text-xs text-studio-muted hover:text-studio-fg" onClick={onClose}>
          Close
        </button>
      </div>
      <p className="font-medium">{presented.subject}</p>
      <p className="text-studio-muted">
        {presented.from} · {formatDateTime(presented.receivedAt)}
      </p>
      {presented.body ? <p className="whitespace-pre-wrap">{presented.body}</p> : null}
      {inquiry.kind === 'feedback' ? (
        <Button size="sm" onClick={() => onOpenTab('feedback')}>
          Open Feedback
        </Button>
      ) : null}
      {inquiry.kind === 'delivery_event' ? (
        <Button size="sm" onClick={() => onOpenTab('deliveries')}>
          Open Deliveries
        </Button>
      ) : null}
    </div>
  )
}

