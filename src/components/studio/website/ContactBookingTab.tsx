import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import {
  SectionSaveBar,
  StudioSection,
  useAccordion,
  useSectionSave,
} from '@/components/studio/StudioSection'
import {
  MAX_BOOKING_QUESTIONS,
  createEmptyField,
  type FormFieldDef,
  type WebsiteGlobals,
  type WebsiteGlobalsPatch,
} from '@/lib/website'
import { OpenPublicPageLink } from '@/components/studio/website/shared'

type Props = {
  globals: WebsiteGlobals
  busy: boolean
  onSave: (data: WebsiteGlobalsPatch) => Promise<void>
}

export function ContactBookingTab({ globals, busy, onSave }: Props) {
  const { openId, toggle } = useAccordion('voice')
  const voiceSave = useSectionSave()
  const bookingSave = useSectionSave()
  const reachSave = useSectionSave()

  const [h1, setH1] = useState(globals.contact_h1 ?? '')
  const [intro, setIntro] = useState(globals.contact_intro ?? '')
  const [writeBlurb, setWriteBlurb] = useState(globals.write_blurb ?? '')
  const [calendar, setCalendar] = useState(globals.booking_calendar_enabled !== false)
  const [help, setHelp] = useState(globals.booking_help_text ?? '')
  const [questions, setQuestions] = useState<FormFieldDef[]>(globals.booking_questions ?? [])
  const [email, setEmail] = useState(globals.contact_email ?? '')
  const [phone, setPhone] = useState(globals.contact_phone ?? '')
  const [location, setLocation] = useState(globals.contact_location ?? '')
  const [instagram, setInstagram] = useState(globals.social_instagram ?? '')

  useEffect(() => {
    setH1(globals.contact_h1 ?? '')
    setIntro(globals.contact_intro ?? '')
    setWriteBlurb(globals.write_blurb ?? '')
    setCalendar(globals.booking_calendar_enabled !== false)
    setHelp(globals.booking_help_text ?? '')
    setQuestions(globals.booking_questions ?? [])
    setEmail(globals.contact_email ?? '')
    setPhone(globals.contact_phone ?? '')
    setLocation(globals.contact_location ?? '')
    setInstagram(globals.social_instagram ?? '')
    voiceSave.reset()
    bookingSave.reset()
    reachSave.reset()
  }, [globals.updated])

  const voiceDirty =
    h1 !== (globals.contact_h1 ?? '') ||
    intro !== (globals.contact_intro ?? '') ||
    writeBlurb !== (globals.write_blurb ?? '')
  const bookingDirty =
    calendar !== (globals.booking_calendar_enabled !== false) ||
    help !== (globals.booking_help_text ?? '') ||
    JSON.stringify(questions) !== JSON.stringify(globals.booking_questions ?? [])
  const reachDirty =
    email !== (globals.contact_email ?? '') ||
    phone !== (globals.contact_phone ?? '') ||
    location !== (globals.contact_location ?? '') ||
    instagram !== (globals.social_instagram ?? '')

  return (
    <section className="space-y-2">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-studio-muted">
          What visitors see on Contact — the page words, Write, the booking form, and how they reach you.
        </p>
        <OpenPublicPageLink href="/contact" />
      </div>

      <StudioSection id="voice" title="Page words" open={openId === 'voice'} onToggle={toggle}>
        <div className="space-y-3">
          <div>
            <Label htmlFor="contact-h1" className="text-xs text-studio-muted">
              Page headline
            </Label>
            <Input id="contact-h1" value={h1} onChange={(e) => setH1(e.target.value)} placeholder="e.g. Book a session" />
          </div>
          <div>
            <Label htmlFor="contact-intro" className="text-xs text-studio-muted">
              Intro
            </Label>
            <Input
              id="contact-intro"
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              placeholder="e.g. Send a request, or WhatsApp me"
            />
          </div>
          <div>
            <Label htmlFor="write-blurb" className="text-xs text-studio-muted">
              Write blurb
            </Label>
            <Input
              id="write-blurb"
              value={writeBlurb}
              onChange={(e) => setWriteBlurb(e.target.value)}
              placeholder="Name, phone, and a short note."
            />
            <p className="mt-1 text-xs text-studio-muted">Shown under Write on Contact. Leave empty for the default line.</p>
          </div>
        </div>
        <SectionSaveBar
          status={voiceSave.status}
          error={voiceSave.error}
          dirty={voiceDirty}
          onSave={() =>
            voiceSave.runSave(() =>
              onSave({ contact_h1: h1, contact_intro: intro, write_blurb: writeBlurb }),
            )
          }
        />
      </StudioSection>

      <StudioSection id="booking" title="Booking form" open={openId === 'booking'} onToggle={toggle}>
        <p className="mb-3 text-xs text-studio-muted">
          Name + +234 phone are fixed. Extra questions max {MAX_BOOKING_QUESTIONS}.
        </p>
        <label className="mb-3 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={calendar} disabled={busy} onChange={(e) => setCalendar(e.target.checked)} />
          Enable request calendar
        </label>
        <div className="mb-3">
          <Label htmlFor="booking-help" className="text-xs text-studio-muted">
            Note under the form
          </Label>
          <Input
            id="booking-help"
            value={help}
            onChange={(e) => setHelp(e.target.value)}
            placeholder="e.g. I will reply within a day"
          />
        </div>
        <FieldList fields={questions} busy={busy} onChange={setQuestions} />
        <div className="mt-3">
          <button
            type="button"
            className="text-xs text-studio-accent hover:opacity-80 disabled:opacity-50"
            disabled={busy || questions.length >= MAX_BOOKING_QUESTIONS}
            onClick={() => setQuestions((q) => [...q, createEmptyField()])}
          >
            Add question
          </button>
        </div>
        <SectionSaveBar
          status={bookingSave.status}
          error={bookingSave.error}
          dirty={bookingDirty}
          onSave={() =>
            bookingSave.runSave(() =>
              onSave({
                booking_calendar_enabled: calendar,
                booking_help_text: help,
                booking_questions: questions,
              }),
            )
          }
        />
      </StudioSection>

      <StudioSection id="reach" title="Reach me" open={openId === 'reach'} onToggle={toggle}>
        <p className="mb-3 text-xs text-studio-muted">Phone drives WhatsApp on the public site when set.</p>
        <div className="space-y-3">
          {(
            [
              ['email', 'Public email', email, setEmail],
              ['phone', 'Phone (+234)', phone, setPhone],
              ['location', 'Location', location, setLocation],
              ['instagram', 'Instagram (@handle or URL)', instagram, setInstagram],
            ] as const
          ).map(([key, label, value, setValue]) => (
            <div key={key}>
              <Label htmlFor={`contact-${key}`} className="text-xs text-studio-muted">
                {label}
              </Label>
              <Input id={`contact-${key}`} value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
          ))}
        </div>
        <SectionSaveBar
          status={reachSave.status}
          error={reachSave.error}
          dirty={reachDirty}
          onSave={() =>
            reachSave.runSave(() =>
              onSave({
                contact_email: email,
                contact_phone: phone,
                contact_location: location,
                social_instagram: instagram,
              }),
            )
          }
        />
      </StudioSection>
    </section>
  )
}

function FieldList({
  fields,
  busy,
  onChange,
}: {
  fields: FormFieldDef[]
  busy: boolean
  onChange: (next: FormFieldDef[]) => void
}) {
  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div key={field.id} className="space-y-2 border-b border-studio-border/60 pb-3">
          <div>
            <Label htmlFor={`q-${field.id}`} className="text-xs text-studio-muted">
              Question
            </Label>
            <Input
              id={`q-${field.id}`}
              className="mt-1"
              value={field.label}
              placeholder="e.g. What kind of shoot?"
              onChange={(e) => {
                const next = [...fields]
                next[index] = { ...field, label: e.target.value }
                onChange(next)
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Label htmlFor={`q-type-${field.id}`} className="sr-only">
              Answer type
            </Label>
            <Select
              id={`q-type-${field.id}`}
              variant="toolbar"
              className="min-w-0 flex-1"
              value={field.type}
              disabled={busy}
              onChange={(e) => {
                const type = e.target.value as FormFieldDef['type']
                const next = [...fields]
                const updated: FormFieldDef = { ...field, type }
                if (type === 'choice' && !(updated.options && updated.options.length)) {
                  updated.options = ['Option A', 'Option B']
                }
                next[index] = updated
                onChange(next)
              }}
            >
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="textarea">Long text</option>
              <option value="choice">Choice</option>
              <option value="yesno">Yes / No</option>
            </Select>
            <label className="flex items-center gap-1.5 text-xs text-studio-muted">
              <input
                type="checkbox"
                checked={Boolean(field.required)}
                disabled={busy}
                onChange={(e) => {
                  const next = [...fields]
                  next[index] = { ...field, required: e.target.checked }
                  onChange(next)
                }}
              />
              Required
            </label>
            <button
              type="button"
              className="shrink-0 text-xs text-studio-muted hover:text-studio-danger disabled:opacity-50"
              disabled={busy}
              onClick={() => onChange(fields.filter((f) => f.id !== field.id))}
            >
              Remove
            </button>
          </div>
          {field.type === 'choice' ? (
            <div className="space-y-2 pl-1">
              <p className="text-xs text-studio-muted">Options</p>
              {(field.options ?? []).map((opt, oi) => (
                <div key={`${field.id}-opt-${oi}`} className="flex items-center gap-2">
                  <Label htmlFor={`q-${field.id}-opt-${oi}`} className="sr-only">
                    Option {oi + 1}
                  </Label>
                  <Input
                    id={`q-${field.id}-opt-${oi}`}
                    value={opt}
                    disabled={busy}
                    onChange={(e) => {
                      const options = [...(field.options ?? [])]
                      options[oi] = e.target.value
                      const next = [...fields]
                      next[index] = { ...field, options }
                      onChange(next)
                    }}
                  />
                  <button
                    type="button"
                    className="shrink-0 text-xs text-studio-muted hover:text-studio-danger disabled:opacity-50"
                    disabled={busy || (field.options ?? []).length <= 1}
                    onClick={() => {
                      const options = (field.options ?? []).filter((_, i) => i !== oi)
                      const next = [...fields]
                      next[index] = { ...field, options }
                      onChange(next)
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="text-xs text-studio-accent hover:opacity-80 disabled:opacity-50"
                disabled={busy}
                onClick={() => {
                  const options = [...(field.options ?? []), `Option ${(field.options?.length ?? 0) + 1}`]
                  const next = [...fields]
                  next[index] = { ...field, options }
                  onChange(next)
                }}
              >
                Add option
              </button>
            </div>
          ) : null}
        </div>
      ))}
      {!fields.length ? <p className="text-xs text-studio-muted">No extra questions yet.</p> : null}
    </div>
  )
}
