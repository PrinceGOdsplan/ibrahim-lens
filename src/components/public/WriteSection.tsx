import { useId, useRef, useState, type FormEvent } from 'react'
import { PhoneNgInput } from '@/components/PhoneNgInput'
import { Alert } from '@/components/ui/alert'
import { DEFAULT_WRITE_BLURB, submitInquiry, type WebsiteGlobals } from '@/lib/website'
import { publicErrorMessage } from '@/lib/pb-error'
import { normalizeNgPhone } from '@/lib/phone'

/** Public Write — name, phone, message. Creates a contact inquiry, not a Booking. */
export function WriteSection({ globals }: { globals: WebsiteGlobals | null }) {
  const uid = useId()
  const [name, setName] = useState('')
  const [phoneNational, setPhoneNational] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [company, setCompany] = useState('')
  const inFlight = useRef(false)
  const phoneRef = useRef<HTMLInputElement>(null)

  const phoneId = `${uid}-phone`
  const phoneErrorId = `${uid}-phone-error`
  const blurb = (globals?.write_blurb ?? '').trim() || DEFAULT_WRITE_BLURB

  const fieldClass =
    'h-11 min-h-11 w-full border-0 border-b border-white/20 bg-transparent px-0 text-sm text-public-fg outline-none transition-colors focus:border-public-accent focus-visible:ring-2 focus-visible:ring-public-accent/60'

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

    inFlight.current = true
    setSubmitting(true)
    try {
      const trimmedName = name.trim()
      const trimmedMessage = message.trim()
      if (!trimmedName) throw new Error('Name is required.')
      if (!trimmedMessage) throw new Error('A message is required.')
      await submitInquiry(
        'contact',
        { name: trimmedName, phone: phone.e164, message: trimmedMessage },
        company,
      )
      setStatus('Message received — we will get back to you.')
      setName('')
      setPhoneNational('')
      setMessage('')
      setCompany('')
    } catch (err) {
      setError(publicErrorMessage(err, 'Could not send your message. Please try again.'))
    } finally {
      inFlight.current = false
      setSubmitting(false)
    }
  }

  return (
    <form
      id="write"
      onSubmit={onSubmit}
      className="street-raised relative scroll-mt-28 space-y-6 px-5 py-8 max-sm:pb-4 sm:px-10 md:px-12"
    >
      <div className="border-b border-public-fg/10 pb-6">
        <h2 className="font-display text-3xl">Write</h2>
        <p className="street-body mt-3 text-sm">{blurb}</p>
      </div>

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
          <div className="sm:col-span-2">
            <label htmlFor={`${uid}-message`} className="mb-1 block text-xs tracking-wide text-public-muted">
              Message *
            </label>
            <textarea
              id={`${uid}-message`}
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`min-h-24 ${fieldClass} h-auto`}
            />
          </div>
        </div>
      </div>

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
          {submitting ? 'Sending…' : 'Send message'}
        </button>
      </div>
    </form>
  )
}
