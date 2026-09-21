import { useCallback, useEffect, useId, useImperativeHandle, useMemo, useRef, useState, forwardRef } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { PhoneNgInput } from '@/components/PhoneNgInput'
import { BookingAnswers } from '@/components/studio/BookingAnswers'
import { BookingQuestionFields } from '@/components/studio/BookingQuestionFields'
import { RevealOnOpen } from '@/components/studio/RevealOnOpen'
import { StudioFullscreenModal } from '@/components/studio/StudioFullscreenModal'
import { StudioHubHeader } from '@/components/studio/StudioHubHeader'
import { StudioHubShell, StudioScrollPane, StudioWorkSurface } from '@/components/studio/StudioHubShell'
import { StudioTextIconButton } from '@/components/studio/StudioIconButton'
import { StudioTabs } from '@/components/studio/StudioTabs'
import { Alert, PartialDataNotice } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useConfirm } from '@/components/ui/confirm'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NairaField } from '@/components/ui/naira-field'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton, SkeletonText } from '@/components/ui/skeleton'
import {
  type BookingEvent,
  type BookingRecord,
  type BookingStatus,
  type PersonRecord,
  HUB_BOOKING_STATUSES,
  HUB_VIEWS,
  applyReceivedPayment,
  createBooking,
  detailsIncomplete,
  filterHubView,
  financeSummary,
  formatNgn,
  hasUnpaidBalance,
  hubBookings,
  listBookingEvents,
  listBookings,
  listPeople,
  matchesHubView,
  outstandingNgn,
  parseHubView,
  paymentLine,
  removeBooking,
  statusLabel,
  updateBooking,
  type HubView,
} from '@/lib/bookings'
import { personReferences, removePerson } from '@/lib/clients'
import { formatDateTime } from '@/lib/format'
import { useStudioRecordRefresh } from '@/lib/studio-record-sync'
import { pbErrorMessage } from '@/lib/pb-error'
import { settleAll } from '@/lib/useAsyncData'
import { cn } from '@/lib/utils'
import { getWebsiteGlobals, type FormFieldDef } from '@/lib/website'

const GLOBAL_SCOPE = '*'
const LG_UP = '(min-width: 1024px)'

function isBusy(busyScope: string | null, recordId: string) {
  return busyScope === GLOBAL_SCOPE || busyScope === recordId
}

/** Matches Tailwind `lg` — side-by-side bookings vs list + sheet. */
function useLgUp() {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(LG_UP).matches : true,
  )
  useEffect(() => {
    const mq = window.matchMedia(LG_UP)
    const sync = () => setMatches(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return matches
}

function formatPreferredAt(iso?: string) {
  if (!iso) return 'No date set'
  return formatDateTime(iso) || iso
}

function viewCount(bookings: BookingRecord[], view: HubView) {
  return filterHubView(bookings, view).length
}

type ManualBookingInput = {
  personId?: string
  name?: string
  phone?: string
  email?: string
  preferredAt?: string
  feeNgn?: number
  amountPaidNgn?: number
  studioNotes?: string
  answers?: Record<string, unknown>
}

function filledAnswers(
  questions: Record<string, string>,
  contact: { name?: string; phone?: string; email?: string },
) {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(questions)) {
    if (value.trim()) out[key] = value.trim()
  }
  if (contact.name?.trim()) out.name = contact.name.trim()
  if (contact.phone?.trim()) out.phone = contact.phone.trim()
  if (contact.email?.trim()) out.email = contact.email.trim()
  return out
}

type NewBookingFormHandle = {
  submit: () => void
  canSubmit: boolean
}

const NewBookingForm = forwardRef<NewBookingFormHandle, {
  people: PersonRecord[]
  questions: FormFieldDef[]
  busy: boolean
  initialPersonId?: string
  onCreate: (input: ManualBookingInput) => Promise<void>
  onDirtyChange?: (dirty: boolean) => void
  onCanSubmitChange?: (canSubmit: boolean) => void
}>(function NewBookingForm(
  { people, questions, busy: _busy, initialPersonId, onCreate, onDirtyChange, onCanSubmitChange },
  ref,
) {

  const fieldId = useId()
  const [personId, setPersonId] = useState(initialPersonId ?? '')
  const [name, setName] = useState('')
  const [national, setNational] = useState('')
  const [email, setEmail] = useState('')
  const [preferred, setPreferred] = useState('')
  const [fee, setFee] = useState('')
  const [paid, setPaid] = useState('')
  const [notes, setNotes] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const existing = people.find((p) => p.id === personId)
  const canSubmit = Boolean(personId || (name.trim() && national))
  const feeNgn = Number(fee) || 0
  const amountPaidNgn = feeNgn > 0 ? Math.min(feeNgn, Math.max(0, Number(paid) || 0)) : 0

  useEffect(() => {
    if (initialPersonId) setPersonId(initialPersonId)
  }, [initialPersonId])

  useEffect(() => {
    onDirtyChange?.(
      Boolean(personId || name.trim() || national || email.trim() || preferred || fee || paid || notes.trim()),
    )
  }, [personId, name, national, email, preferred, fee, paid, notes, onDirtyChange])

  useEffect(() => {
    onCanSubmitChange?.(canSubmit)
  }, [canSubmit, onCanSubmitChange])

  function payload(): ManualBookingInput {
    return {
      personId: personId || undefined,
      name,
      phone: national ? `+234${national}` : undefined,
      email: email.trim() || undefined,
      preferredAt: preferred,
      feeNgn,
      amountPaidNgn,
      studioNotes: notes.trim(),
      answers: filledAnswers(answers, {
        name: existing?.name ?? name,
        phone: existing?.phone_e164 ?? (national ? `+234${national}` : undefined),
        email: existing?.email ?? email,
      }),
    }
  }

  useImperativeHandle(ref, () => ({
    submit: () => {
      void onCreate(payload())
    },
    canSubmit,
  }), [canSubmit, onCreate, personId, name, national, email, preferred, fee, paid, notes, answers, existing])

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-3">
          <Label htmlFor={`${fieldId}-person`}>Person</Label>
          <Select
            id={`${fieldId}-person`}
            className="mt-1"
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
          >
            <option value="">New client</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.phone_e164}
              </option>
            ))}
          </Select>
        </div>
        {!personId ? (
          <>
            <div>
              <Label htmlFor={`${fieldId}-name`}>Name</Label>
              <Input
                id={`${fieldId}-name`}
                className="mt-1"
                placeholder="Client name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`${fieldId}-phone`}>Phone</Label>
              <PhoneNgInput id={`${fieldId}-phone`} className="mt-1" national={national} onChange={setNational} />
            </div>
            <div>
              <Label htmlFor={`${fieldId}-email`}>Email</Label>
              <Input
                id={`${fieldId}-email`}
                className="mt-1"
                type="email"
                placeholder="Optional"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </>
        ) : (
          <p className="sm:col-span-2 lg:col-span-3 text-sm text-studio-muted">
            {existing?.name} · {existing?.phone_e164}
            {existing?.email ? ` · ${existing.email}` : ''}
          </p>
        )}

        <div>
          <Label htmlFor={`${fieldId}-preferred`}>Date</Label>
          <Input
            id={`${fieldId}-preferred`}
            className="mt-1"
            type="datetime-local"
            value={preferred}
            onChange={(e) => setPreferred(e.target.value)}
          />
        </div>
        <div>
            <Label htmlFor={`${fieldId}-fee`}>Fee</Label>
            <NairaField
              id={`${fieldId}-fee`}
              className="mt-1"
              placeholder="0"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
            />
        </div>
        <div>
            <Label htmlFor={`${fieldId}-paid`}>Paid</Label>
            <NairaField
              id={`${fieldId}-paid`}
              className="mt-1"
              placeholder="0"
              value={paid}
              onChange={(e) => setPaid(e.target.value)}
            />
        </div>

        <BookingQuestionFields
          fields={questions}
          values={answers}
          idPrefix={`${fieldId}-q`}
          onChange={(id, value) => setAnswers((prev) => ({ ...prev, [id]: value }))}
        />

        <div className="sm:col-span-2 lg:col-span-3">
          <Label htmlFor={`${fieldId}-notes`}>Notes</Label>
          <Textarea
            id={`${fieldId}-notes`}
            className="mt-1"
            placeholder="Deposit, outfit, pickup…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      {feeNgn > 0 ? (
        <p className="studio-numeral text-xs text-studio-muted">
          Outstanding {formatNgn(Math.max(0, feeNgn - amountPaidNgn))}
        </p>
      ) : null}
    </div>
  )
})

function BookingsSkeleton() {
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

export function StudioBookingsPage() {
  const [params, setParams] = useSearchParams()
  const bookingParam = params.get('booking')
  const personParam = params.get('person')
  const newParam = params.get('new')
  const view = parseHubView(params.get('view'))

  const [people, setPeople] = useState<PersonRecord[]>([])
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [busyScope, setBusyScope] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState<string[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const { confirm, dialog: confirmDialog } = useConfirm()

  const refresh = useCallback(async () => {
    const { values, failed: missing } = await settleAll({
      People: listPeople,
      Bookings: listBookings,
    })
    setFailed(missing)
    if (values.People) setPeople(values.People)
    if (values.Bookings) setBookings(values.Bookings)
    if (missing.length === 2) throw new Error('Could not load bookings.')
  }, [])

  const load = useCallback(() => {
    let alive = true
    setError(null)
    setLoaded(false)
    refresh()
      .then(() => {
        if (alive) setError(null)
      })
      .catch((e) => {
        if (alive) setError(pbErrorMessage(e, 'Could not load bookings.'))
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

  const onAssistantWrite = useCallback(
    (change: { collection: string; id: string }) => {
      void refresh().then(() => {
        if (change.collection === 'bookings' && change.id === bookingParam) {
          setMessage('This booking changed.')
        }
      })
    },
    [refresh, bookingParam],
  )
  useStudioRecordRefresh(['bookings', 'people'], onAssistantWrite)

  useEffect(() => {
    if (personParam && newParam === '1') {
      setShowCreate(true)
      setParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('new')
        return next
      }, { replace: true })
    }
  }, [personParam, newParam, setParams])

  async function run(action: () => Promise<void>, ok = 'Saved.', scope = GLOBAL_SCOPE): Promise<boolean> {
    setBusyScope(scope)
    setError(null)
    setMessage(null)
    try {
      await action()
    } catch (e) {
      setError(pbErrorMessage(e))
      setBusyScope(null)
      return false
    }
    try {
      await refresh()
      if (ok) setMessage(ok)
    } catch {
      if (ok) setMessage(ok)
    } finally {
      setBusyScope(null)
    }
    return true
  }

  useEffect(() => {
    if (!message) return
    const id = window.setTimeout(() => setMessage(null), 4000)
    return () => window.clearTimeout(id)
  }, [message])

  const accepted = useMemo(() => hubBookings(bookings), [bookings])
  const fin = useMemo(() => financeSummary(accepted), [accepted])
  const unacceptedMatch =
    bookingParam && bookings.some((b) => b.id === bookingParam && b.status === 'needs_contact')

  const onViewChange = useCallback(
    (next: HubView) => {
      setParams((prev) => {
        const nextParams = new URLSearchParams(prev)
        if (next === 'upcoming') nextParams.delete('view')
        else nextParams.set('view', next)
        return nextParams
      }, { replace: true })
    },
    [setParams],
  )

  if (loaded && unacceptedMatch) {
    return <Navigate to="/studio/clients?tab=inbox" replace />
  }

  return (
    <StudioHubShell>
      <StudioHubHeader
        title="Bookings"
        actions={
          loaded ? (
            <StudioTextIconButton
              label={showCreate ? 'Close' : 'Add'}
              icon={Plus}
              onClick={() => setShowCreate((open) => !open)}
            />
          ) : undefined
        }
      >
        {loaded ? (
          <div className="mt-3">
            <StudioTabs
              value={view}
              onChange={onViewChange}
              aria-label="Booking views"
              primary={HUB_VIEWS.map((item) => ({
                ...item,
                count: viewCount(accepted, item.id),
              }))}
            />
          </div>
        ) : null}
      </StudioHubHeader>
      <StudioScrollPane innerClassName="flex min-h-0 flex-col space-y-6">
      {error ? (
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

      {!loaded ? <BookingsSkeleton /> : null}

      {loaded ? (
        <StudioWorkSurface>
          <BookingsManager
            bookings={accepted}
            people={people}
            busyScope={busyScope}
            paidTotal={fin.paidPeriod}
            outstanding={fin.outstanding}
            view={view}
            showCreate={showCreate}
            onShowCreate={setShowCreate}
            initialBookingId={bookingParam}
            initialPersonId={personParam}
            onViewChange={onViewChange}
            onCreate={async (input) => {
              let createdId: string | null = null
              const ok = await run(async () => {
                const row = await createBooking({ ...input, status: 'pending', source: 'manual' })
                createdId = row.id
              }, 'Booking created.')
              return ok ? createdId : null
            }}
            onUpdate={(id, patch) => run(() => updateBooking(id, patch).then(() => undefined), 'Saved.', id)}
            onRemove={async (booking) => {
              const name = booking.expand?.person?.name?.trim() || 'this client'
              const ok = await confirm({
                title: `Remove ${name}'s booking?`,
                body: 'The booking and its history will be removed and cannot be recovered.',
                confirmLabel: 'Remove booking',
                destructive: true,
              })
              if (!ok) return false
              const personId = booking.person
              const removed = await run(() => removeBooking(booking.id), 'Booking removed.', booking.id)
              if (!removed) return false
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
              return true
            }}
          />
          {confirmDialog}
        </StudioWorkSurface>
      ) : null}

      </StudioScrollPane>
    </StudioHubShell>
  )
}

function BookingsManager({
  bookings,
  people,
  busyScope,
  paidTotal,
  outstanding,
  view,
  showCreate,
  onShowCreate,
  initialBookingId,
  initialPersonId,
  onViewChange,
  onCreate,
  onUpdate,
  onRemove,
}: {
  bookings: BookingRecord[]
  people: PersonRecord[]
  busyScope: string | null
  paidTotal: number
  outstanding: number
  view: HubView
  showCreate: boolean
  onShowCreate: (open: boolean) => void
  initialBookingId: string | null
  initialPersonId: string | null
  onViewChange: (view: HubView) => void
  onCreate: (input: ManualBookingInput) => Promise<string | null>
  onUpdate: (id: string, patch: Partial<BookingRecord>) => void
  onRemove: (booking: BookingRecord) => Promise<boolean>
}) {
  const lgUp = useLgUp()
  const createFormRef = useRef<NewBookingFormHandle>(null)
  const [createDirty, setCreateDirty] = useState(false)
  const [canCreate, setCanCreate] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [events, setEvents] = useState<BookingEvent[]>([])
  const [questions, setQuestions] = useState<FormFieldDef[]>([])

  useEffect(() => {
    getWebsiteGlobals()
      .then((g) => setQuestions(g.booking_questions ?? []))
      .catch(() => setQuestions([]))
  }, [])

  const filtered = useMemo(() => filterHubView(bookings, view), [bookings, view])
  const selected = filtered.find((b) => b.id === selectedId) ?? null
  const desktopSelected = selected ?? (lgUp ? filtered[0] ?? null : null)

  function openBooking(id: string) {
    setSelectedId((current) => (!lgUp && current === id ? null : id))
  }

  useEffect(() => {
    if (!initialBookingId) return
    const row = bookings.find((b) => b.id === initialBookingId)
    if (!row) return
    setSelectedId(initialBookingId)
    // Only when the address booking changes. Reacting to `view` would snap back to All after Unpaid.
    if (!matchesHubView(row, view)) onViewChange('all')
    // eslint-disable-next-line react-hooks/exhaustive-deps -- view/onViewChange omitted on purpose
  }, [initialBookingId, bookings])

  useEffect(() => {
    if (!lgUp) return
    if (!selectedId && filtered[0]) setSelectedId(filtered[0].id)
    else if (selectedId && !filtered.some((b) => b.id === selectedId) && filtered[0]) {
      setSelectedId(filtered[0].id)
    }
  }, [lgUp, selectedId, filtered])

  useEffect(() => {
    const id = (lgUp ? desktopSelected : selected)?.id
    if (!id) {
      setEvents([])
      return
    }
    listBookingEvents(id)
      .then(setEvents)
      .catch(() => setEvents([]))
  }, [lgUp, desktopSelected?.id, selected?.id])

  const detailBooking = lgUp ? desktopSelected : selected

  function renderDetail(booking: BookingRecord, onClose?: () => void) {
    return (
      <BookingDetail
        key={booking.id}
        booking={booking}
        events={events}
        busy={isBusy(busyScope, booking.id)}
        onUpdate={onUpdate}
        onClose={onClose}
        onRemove={async () => {
          const gone = await onRemove(booking)
          if (!gone) return
          setSelectedId(null)
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-studio-muted">
        Paid {formatNgn(paidTotal)}
        {' · '}
        <button
          type="button"
          className="underline-offset-2 hover:underline"
          onClick={() => onViewChange('unpaid')}
        >
          Outstanding {formatNgn(outstanding)}
        </button>
      </p>

      {showCreate ? (
        <StudioFullscreenModal
          open={showCreate}
          title="New booking"
          dirty={createDirty}
          discardTitle="Discard this booking?"
          discardBody="You have started a new booking that has not been created."
          onClose={() => onShowCreate(false)}
          footer={
            <Button
              className="w-full"
              disabled={busyScope === GLOBAL_SCOPE || !canCreate}
              onClick={() => createFormRef.current?.submit()}
            >
              {busyScope === GLOBAL_SCOPE ? 'Creating…' : 'Create booking'}
            </Button>
          }
        >
          <NewBookingForm
            ref={createFormRef}
            people={people}
            questions={questions}
            busy={busyScope === GLOBAL_SCOPE}
            initialPersonId={initialPersonId ?? undefined}
            onDirtyChange={setCreateDirty}
            onCanSubmitChange={setCanCreate}
            onCreate={async (input) => {
              const id = await onCreate(input)
              if (!id) return
              openBooking(id)
              if (view !== 'upcoming') onViewChange('upcoming')
              onShowCreate(false)
            }}
          />
        </StudioFullscreenModal>
      ) : null}

      {lgUp ? (
        <div className="grid min-h-0 overflow-hidden rounded-lg border border-studio-border lg:h-[min(70dvh,44rem)] lg:grid-cols-[minmax(18rem,26rem)_minmax(0,1fr)]">
          <div className="min-h-0 min-w-0 overflow-auto lg:h-full lg:border-r lg:border-studio-border">
            {!filtered.length ? (
              <p className="p-4 text-sm text-studio-muted">
                {view === 'upcoming' ? 'Nothing upcoming.' : 'No bookings in this view.'}
              </p>
            ) : null}
            {filtered.map((b) => (
              <BookingListRow
                key={b.id}
                booking={b}
                active={desktopSelected?.id === b.id}
                onClick={() => openBooking(b.id)}
              />
            ))}
          </div>
          <div className="min-h-0 min-w-0">
            {detailBooking ? (
              renderDetail(detailBooking)
            ) : (
              <div className="flex items-center justify-center p-8 text-sm text-studio-muted">Select a booking</div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {!filtered.length ? (
            <p className="text-sm text-studio-muted">
              {view === 'upcoming' ? 'Nothing upcoming.' : 'No bookings in this view.'}
            </p>
          ) : null}
          {filtered.map((b) => {
            const open = selectedId === b.id
            return (
              <RevealOnOpen
                key={b.id}
                as="article"
                open={open}
                id={b.id}
                className="border border-studio-border bg-studio-panel text-sm"
              >
                <BookingListRow booking={b} active={open} onClick={() => openBooking(b.id)} inset />
                {open ? renderDetail(b, () => setSelectedId(null)) : null}
              </RevealOnOpen>
            )
          })}
        </div>
      )}
    </div>
  )
}

function BookingListRow({
  booking,
  active,
  onClick,
  inset,
}: {
  booking: BookingRecord
  active: boolean
  onClick: () => void
  inset?: boolean
}) {
  const incomplete = detailsIncomplete(booking)
  const unpaid = hasUnpaidBalance(booking)
  return (
    <button
      type="button"
      aria-expanded={inset ? active : undefined}
      className={cn(
        'block w-full text-left text-sm',
        inset ? 'px-4 py-3' : 'border-b border-studio-border px-3 py-3',
        !inset && (active ? 'bg-studio-bg' : 'hover:bg-studio-bg/70'),
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium">{booking.expand?.person?.name ?? 'Client'}</p>
        <p className="shrink-0 text-xs text-studio-muted">{formatPreferredAt(booking.preferred_at)}</p>
      </div>
      <p className="mt-0.5 text-xs text-studio-muted">
        {statusLabel(booking.status)} · {paymentLine(booking)}
      </p>
      {incomplete || unpaid ? (
        <p className="mt-1 text-xs text-studio-muted">
          {incomplete ? 'Fee not set' : null}
          {incomplete && unpaid ? ' · ' : null}
          {unpaid ? 'Balance due' : null}
        </p>
      ) : null}
    </button>
  )
}

function BookingDetail({
  booking,
  events,
  busy,
  onUpdate,
  onRemove,
  onClose,
}: {
  booking: BookingRecord
  events: BookingEvent[]
  busy: boolean
  onUpdate: (id: string, patch: Partial<BookingRecord>) => void
  onRemove: () => void
  onClose?: () => void
}) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <BookingEditor
        booking={booking}
        events={events}
        busy={busy}
        onUpdate={onUpdate}
        onRemove={onRemove}
        onDone={() => setEditing(false)}
        onClose={onClose}
      />
    )
  }

  return (
    <BookingCard
      booking={booking}
      busy={busy}
      onUpdate={onUpdate}
      onEdit={() => setEditing(true)}
      onClose={onClose}
    />
  )
}

function BookingCard({
  booking,
  busy,
  onUpdate,
  onEdit,
  onClose,
}: {
  booking: BookingRecord
  busy: boolean
  onUpdate: (id: string, patch: Partial<BookingRecord>) => void
  onEdit: () => void
  onClose?: () => void
}) {
  const incomplete = detailsIncomplete(booking)
  const unpaid = hasUnpaidBalance(booking)
  const due = outstandingNgn(booking)
  const [fee, setFee] = useState('')
  const [received, setReceived] = useState(String(due || ''))

  useEffect(() => {
    setReceived(due > 0 ? String(due) : '')
  }, [due, booking.id])

  const notes = booking.studio_notes?.trim()

  return (
    <div
      className={cn(
        'min-w-0 space-y-4 overflow-auto text-sm',
        onClose ? 'border-t border-studio-border px-4 py-4' : 'p-4',
      )}
    >
      {onClose ? (
        <div className="flex justify-end">
          <button type="button" className="text-xs text-studio-muted hover:text-studio-fg" onClick={onClose}>
            Close
          </button>
        </div>
      ) : null}
      <div>
        <h2 className="font-sans text-xl font-semibold">{booking.expand?.person?.name ?? 'Client'}</h2>
        <p className="text-studio-muted">{booking.expand?.person?.phone_e164}</p>
        <p className="mt-2">{formatPreferredAt(booking.preferred_at)}</p>
        <p className="mt-1 text-studio-muted">
          {statusLabel(booking.status)} · {paymentLine(booking)}
        </p>
        <Link
          to={`/studio/clients?tab=people&person=${booking.person}`}
          className="mt-1 inline-block text-xs text-studio-muted underline-offset-2 hover:underline"
        >
          View client
        </Link>
      </div>

      {incomplete ? (
        <section className="space-y-3 rounded-md border border-studio-border px-3 py-3">
          <Alert variant="info" tone="studio">
            Fee and details not filled in yet.
          </Alert>
          <div>
            <Label htmlFor={`set-fee-${booking.id}`}>Set fee</Label>
            <NairaField
              id={`set-fee-${booking.id}`}
              className="mt-1"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
            />
          </div>
          <Button
            size="sm"
            disabled={busy || !(Number(fee) > 0)}
            onClick={() => onUpdate(booking.id, { fee_ngn: Number(fee) || 0 })}
          >
            Set fee
          </Button>
        </section>
      ) : null}

      {unpaid ? (
        <section className="space-y-3 rounded-md border border-studio-border px-3 py-3">
          <p className="studio-numeral text-xs text-studio-muted">Outstanding {formatNgn(due)}</p>
          <div>
            <Label htmlFor={`received-${booking.id}`}>Amount received</Label>
            <NairaField
              id={`received-${booking.id}`}
              className="mt-1"
              value={received}
              onChange={(e) => setReceived(e.target.value)}
            />
          </div>
          <Button
            size="sm"
            disabled={busy || !(Number(received) > 0)}
            onClick={() =>
              onUpdate(booking.id, {
                amount_paid_ngn: applyReceivedPayment(booking, Number(received) || 0),
              })
            }
          >
            Record payment
          </Button>
        </section>
      ) : null}

      {notes ? <p className="whitespace-pre-wrap text-studio-muted">{notes}</p> : null}

      <BookingAnswers answers={booking.answers} />

      <div className="flex flex-wrap gap-2">
        {booking.status === 'pending' ? (
          <Button size="sm" disabled={busy} onClick={() => onUpdate(booking.id, { status: 'confirmed' })}>
            Confirm
          </Button>
        ) : null}
        {booking.status === 'confirmed' ? (
          <Button size="sm" disabled={busy} onClick={() => onUpdate(booking.id, { status: 'completed' })}>
            Complete
          </Button>
        ) : null}
        {booking.status === 'confirmed' || booking.status === 'completed' ? (
          <Button size="sm" variant="outline" asChild>
            <Link to={`/studio/clients?tab=deliveries&person=${booking.person}&booking=${booking.id}`}>
              Send photos
            </Link>
          </Button>
        ) : null}
        <Button size="sm" variant="outline" onClick={onEdit}>
          Edit details
        </Button>
      </div>
    </div>
  )
}

function BookingEditor({
  booking,
  events,
  busy,
  onUpdate,
  onRemove,
  onDone,
  onClose,
}: {
  booking: BookingRecord
  events: BookingEvent[]
  busy: boolean
  onUpdate: (id: string, patch: Partial<BookingRecord>) => void
  onRemove: () => void
  onDone: () => void
  onClose?: () => void
}) {
  const [fee, setFee] = useState(String(booking.fee_ngn ?? 0))
  const [paid, setPaid] = useState(String(booking.amount_paid_ngn ?? 0))
  const [notes, setNotes] = useState(booking.studio_notes ?? '')
  const [preferred, setPreferred] = useState(booking.preferred_at ?? '')
  const fieldId = useId()

  useEffect(() => {
    setFee(String(booking.fee_ngn ?? 0))
    setPaid(String(booking.amount_paid_ngn ?? 0))
    setNotes(booking.studio_notes ?? '')
    setPreferred(booking.preferred_at ?? '')
  }, [booking.id, booking.fee_ngn, booking.amount_paid_ngn, booking.studio_notes, booking.preferred_at])

  return (
    <div
      className={cn(
        'min-w-0 space-y-4 overflow-auto text-sm',
        onClose ? 'border-t border-studio-border px-4 py-4' : 'p-4',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-sans text-xl font-semibold">{booking.expand?.person?.name ?? 'Client'}</h2>
          <p className="text-studio-muted">{booking.expand?.person?.phone_e164}</p>
        </div>
        <div className="flex items-center gap-2">
          {onClose ? (
            <button type="button" className="text-xs text-studio-muted hover:text-studio-fg" onClick={onClose}>
              Close
            </button>
          ) : null}
          <Button size="sm" variant="ghost" onClick={onDone}>
            Done
          </Button>
        </div>
      </div>

      <div>
        <label className="sr-only" htmlFor={`${fieldId}-status`}>
          Booking status
        </label>
        <Select
          id={`${fieldId}-status`}
          className="w-auto"
          disabled={busy}
          value={booking.status}
          onChange={(e) => onUpdate(booking.id, { status: e.target.value as BookingStatus })}
        >
          {HUB_BOOKING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor={`${fieldId}-preferred`}>Preferred date and time</Label>
        <Input
          id={`${fieldId}-preferred`}
          className="mt-1"
          type="datetime-local"
          value={preferred}
          onChange={(e) => setPreferred(e.target.value)}
        />
        <Button size="sm" className="mt-2" disabled={busy} onClick={() => onUpdate(booking.id, { preferred_at: preferred })}>
          Save schedule
        </Button>
      </div>

      <section className="rounded-md border border-studio-border px-3 py-3">
        <h3 className="font-medium">Payment</h3>
        <div className="mt-3 space-y-3">
          <p className="studio-numeral text-xs text-studio-muted">{paymentLine(booking)}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor={`${fieldId}-fee`}>Fee</Label>
              <NairaField id={`${fieldId}-fee`} className="mt-1" value={fee} onChange={(e) => setFee(e.target.value)} />
            </div>
            <div>
              <Label htmlFor={`${fieldId}-paid`}>Amount paid</Label>
              <NairaField id={`${fieldId}-paid`} className="mt-1" value={paid} onChange={(e) => setPaid(e.target.value)} />
            </div>
          </div>
          <p className="studio-numeral text-xs text-studio-muted">
            Outstanding {formatNgn(outstandingNgn({ fee_ngn: Number(fee) || 0, amount_paid_ngn: Number(paid) || 0 }))}
          </p>
          <Button
            size="sm"
            disabled={busy}
            onClick={() =>
              onUpdate(booking.id, {
                fee_ngn: Number(fee) || 0,
                amount_paid_ngn: Number(paid) || 0,
              })
            }
          >
            Save payment
          </Button>
        </div>
      </section>

      <div className="space-y-2">
        <Label htmlFor={`${fieldId}-notes`}>Private notes</Label>
        <Textarea
          id={`${fieldId}-notes`}
          className="min-h-20"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <Button size="sm" disabled={busy} onClick={() => onUpdate(booking.id, { studio_notes: notes })}>
          Save notes
        </Button>
      </div>

      <BookingAnswers answers={booking.answers} />

      <details className="rounded-md border border-studio-border">
        <summary className="cursor-pointer px-3 py-2 font-medium">History</summary>
        <ul className="max-h-48 space-y-2 overflow-auto border-t border-studio-border px-3 py-3">
          {!events.length ? <li className="text-studio-muted">No events yet.</li> : null}
          {events.map((ev) => (
            <li key={ev.id} className="rounded border border-studio-border px-2 py-1 text-xs">
              <span className="font-medium">{ev.type}</span> · {formatDateTime(ev.created)}
              {ev.actor ? ` · ${ev.actor}` : ''}
            </li>
          ))}
        </ul>
      </details>

      <button
        type="button"
        className="text-xs text-studio-danger underline-offset-2 hover:underline disabled:opacity-50"
        disabled={busy}
        onClick={onRemove}
      >
        Remove booking
      </button>
    </div>
  )
}
