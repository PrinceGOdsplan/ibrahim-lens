import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { PhoneNgInput } from '@/components/PhoneNgInput'
import { Alert } from '@/components/ui/alert'
import { getWebsiteGlobals, isContactBookingQuestion, type FormFieldDef, type WebsiteGlobals } from '@/lib/website'
import { submitPublicBooking } from '@/lib/bookings'
import { publicErrorMessage } from '@/lib/pb-error'
import { normalizeNgPhone, whatsappHref } from '@/lib/phone'

/** `datetime-local` compares against a local-time string, not an ISO instant. */
function localNowValue() {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

function DynamicFields({
  fields,
  values,
  onChange,
}: {
  fields: FormFieldDef[]
  values: Record<string, string>
  onChange: (id: string, value: string) => void
}) {
  const uid = useId()
  const controlClass =
    'h-11 min-h-11 w-full border-0 border-b border-white/20 bg-transparent px-0 py-2 text-sm text-public-fg outline-none focus:border-public-accent focus-visible:ring-2 focus-visible:ring-public-accent/60'

  return (
    <div className="space-y-4">
      {fields
        .filter((field) => !isContactBookingQuestion(field))
        .map((field) => {
          const controlId = `${uid}-${field.id}`
          return (
            <div key={field.id}>
              <label htmlFor={controlId} className="mb-1 block text-sm text-public-fg">
                {field.label}
                {field.required ? ' *' : ''}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  id={controlId}
                  className={`min-h-24 ${controlClass} h-auto sm:max-w-none`}
                  required={field.required}
                  value={values[field.id] ?? ''}
                  onChange={(e) => onChange(field.id, e.target.value)}
                />
              ) : field.type === 'choice' ? (
                <select
                  id={controlId}
                  className={`bg-public-raised ${controlClass} sm:max-w-xs`}
                  required={field.required}
                  value={values[field.id] ?? ''}
                  onChange={(e) => onChange(field.id, e.target.value)}
                >
                  <option value="">Select…</option>
                  {(field.options ?? []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.type === 'yesno' ? (
                <select
                  id={controlId}
                  className={`bg-public-raised ${controlClass} sm:max-w-xs`}
                  required={field.required}
                  value={values[field.id] ?? ''}
                  onChange={(e) => onChange(field.id, e.target.value)}
                >
                  <option value="">Select…</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              ) : (
                <input
                  id={controlId}
                  type={field.type === 'email' ? 'email' : 'text'}
                  className={`${controlClass} sm:max-w-sm`}
                  required={field.required}
                  value={values[field.id] ?? ''}
                  onChange={(e) => onChange(field.id, e.target.value)}
                />
              )}
            </div>
          )
        })}
    </div>
  )
}

/** Shared booking request form — creates Person + Booking (needs_contact). */
export function BookingSection({ globals, hideHeading = false }: { globals: WebsiteGlobals | null; hideHeading?: boolean }) {
  const uid = useId()
  const [name, setName] = useState('')
  const [phoneNational, setPhoneNational] = useState('')
  const [email, setEmail] = useState('')
  const [values, setValues] = useState<Record<string, string>>({})
  const [preferredAt, setPreferredAt] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [company, setCompany] = useState('')

  // State updates are async, so a second click can arrive before `submitting`
  // has re-rendered the disabled button. The ref closes that window.
  const inFlight = useRef(false)
  const phoneRef = useRef<HTMLInputElement>(null)
  const [minPreferred, setMinPreferred] = useState(localNowValue)

  const phoneId = `${uid}-phone`
  const phoneErrorId = `${uid}-phone-error`

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (inFlight.current) return

    setStatus(null)
    setError(null)
    setPhoneError(null)

    const phone = normalizeNgPhone(phoneNational)
    if (!phone) {
      setPhoneError('Enter a valid Nigerian phone number.')
      phoneRef.current?.focus()
      return
    }

    if (preferredAt && preferredAt < localNowValue()) {
      setError('Choose a preferred date and time in the future.')
      return
    }

    inFlight.current = true
    setSubmitting(true)
    try {
      await submitPublicBooking({
        name,
        phone: phone.e164,
        email: email.trim() || undefined,
        preferredAt,
        answers: { ...values, name, phone: phone.e164, email },
        trap: company,
      })
      setStatus('Booking request received — we will contact you to confirm.')
      setName('')
      setPhoneNational('')
      setEmail('')
      setCompany('')
      setValues({})
      setPreferredAt('')
    } catch (err) {
      setError(publicErrorMessage(err, 'Could not send your request. Please try again.'))
    } finally {
      inFlight.current = false
      setSubmitting(false)
    }
  }

  const questions = globals?.booking_questions ?? []
  const wa = whatsappHref(globals?.contact_phone)

  const fieldClass =
    'h-11 min-h-11 w-full border-0 border-b border-white/20 bg-transparent px-0 text-sm text-public-fg outline-none transition-colors focus:border-public-accent focus-visible:ring-2 focus-visible:ring-public-accent/60'

  return (
    <form
      id="booking"
      onSubmit={onSubmit}
      className="street-raised relative scroll-mt-28 space-y-6 px-5 py-8 max-sm:pb-4 sm:px-10 md:px-12"
    >
      {hideHeading ? null : (
      <div className="border-b border-public-fg/10 pb-6">
        <h2 className="font-display text-3xl">Book a session</h2>
        <p className="street-body mt-3 text-sm">
          {globals?.booking_help_text ||
            'Pick any preferred date and time — this is a request, not a confirmed booking.'}
        </p>
      </div>
      )}

      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor={`${uid}-company`}>Company</label>
        <input
          id={`${uid}-company`}
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <div className="max-sm:pb-20 sm:pb-0">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <label htmlFor={`${uid}-name`} className="mb-1 block text-xs tracking-wide text-public-muted">
              Name *
            </label>
            <input
              id={`${uid}-name`}
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div className="sm:col-span-1">
            <label htmlFor={phoneId} className="mb-1 block text-xs tracking-wide text-public-muted">
              Phone *
            </label>
            <PhoneNgInput
              id={phoneId}
              tone="public"
              national={phoneNational}
              onChange={setPhoneNational}
              required
              invalid={Boolean(phoneError)}
              describedBy={phoneError ? phoneErrorId : undefined}
              inputRef={phoneRef}
            />
            {phoneError ? (
              <p id={phoneErrorId} role="alert" className="mt-1 text-xs text-public-danger">
                {phoneError}
              </p>
            ) : null}
          </div>
          <div className="sm:col-span-1">
            <label htmlFor={`${uid}-email`} className="mb-1 block text-xs tracking-wide text-public-muted">
              Email (optional)
            </label>
            <input
              id={`${uid}-email`}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
            />
          </div>

          {globals?.booking_calendar_enabled !== false ? (
            <div className="sm:col-span-1">
              <label htmlFor={`${uid}-when`} className="mb-1 block text-xs tracking-wide text-public-muted">
                Preferred date &amp; time *
              </label>
              <input
                id={`${uid}-when`}
                type="datetime-local"
                required
                min={minPreferred}
                value={preferredAt}
                onChange={(e) => setPreferredAt(e.target.value)}
                onFocus={() => setMinPreferred(localNowValue())}
                className={fieldClass}
              />
            </div>
          ) : null}
          <div className="sm:col-span-2">
          <DynamicFields
            fields={questions}
            values={values}
            onChange={(id, value) => setValues((prev) => ({ ...prev, [id]: value }))}
          />
          </div>
        </div>
      </div>

      {/* Outcome lives with the submit control: on a phone this bar is stuck to
          the bottom, so a message at the top of the form would be off screen. */}
      <div className="flex flex-col gap-3 pt-2 max-sm:sticky max-sm:bottom-0 max-sm:z-10 max-sm:-mx-5 max-sm:border-t max-sm:border-white/10 max-sm:bg-public-raised max-sm:px-5 max-sm:pt-3 max-sm:pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:gap-4 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:pt-2">
        {error ? (
          <Alert variant="error" tone="public">
            {error}
          </Alert>
        ) : null}
        {status ? (
          <Alert variant="success" tone="public">
            {status}
          </Alert>
        ) : null}
        <button type="submit" disabled={submitting} className="street-cta-primary w-fit max-sm:w-full disabled:opacity-60">
          {submitting ? 'Sending…' : 'Request booking'}
        </button>
        {wa ? (
          <p className="text-sm text-public-muted">
            Or message on{' '}
            <a href={wa} target="_blank" rel="noreferrer" className="tap-link text-public-fg underline-offset-4 hover:underline">
              WhatsApp
            </a>
          </p>
        ) : null}
      </div>
    </form>
  )
}

export function useWebsiteGlobals() {
  const [globals, setGlobals] = useState<WebsiteGlobals | null>(null)
  useEffect(() => {
    getWebsiteGlobals()
      .then(setGlobals)
      .catch(() => setGlobals(null))
  }, [])
  return globals
}
