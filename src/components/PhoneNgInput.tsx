import type { Ref } from 'react'
import { normalizeNgPhone } from '@/lib/phone'

type Props = {
  id?: string
  national: string
  onChange: (national: string) => void
  required?: boolean
  className?: string
  /** public = Soft night site; studio = underline tool field */
  tone?: 'public' | 'studio'
  invalid?: boolean
  /** id of the message describing a validation failure */
  describedBy?: string
  inputRef?: Ref<HTMLInputElement>
  onBlur?: () => void
}

/** Fixed +234 prefix; user edits national digits; leading 0 is stripped on change. */
export function PhoneNgInput({
  id,
  national,
  onChange,
  required,
  className,
  tone = 'studio',
  invalid,
  describedBy,
  inputRef,
  onBlur,
}: Props) {
  const studioField =
    'h-11 min-h-11 flex-1 border-0 border-b bg-transparent px-0 py-1 text-base text-studio-fg placeholder:text-studio-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-studio-fg md:h-8 md:text-sm'
  const publicField = 'h-11 min-h-11 flex-1 border-0 bg-transparent px-0 text-sm text-public-fg'

  const borderClass = invalid
    ? tone === 'public'
      ? 'border-public-danger'
      : 'border-studio-danger'
    : tone === 'public'
      ? 'border-white/20'
      : 'border-studio-border/70'

  const inputClass =
    tone === 'public'
      ? `${publicField} outline-none focus:border-public-accent focus-visible:ring-2 focus-visible:ring-public-accent/60`
      : `${studioField} ${invalid ? 'border-studio-danger' : 'border-studio-border/70'} focus-visible:border-studio-fg`

  const prefixClass =
    tone === 'public'
      ? 'inline-flex h-11 min-h-11 items-center pr-3 text-sm text-public-muted'
      : 'inline-flex h-11 min-h-11 items-end pb-1 pr-2 text-sm text-studio-muted md:h-8'

  function handle(raw: string) {
    const cleaned = raw.replace(/[^\d]/g, '')
    const normalized = normalizeNgPhone(cleaned.startsWith('234') ? cleaned : `234${cleaned}`)
    onChange(normalized?.national ?? cleaned.replace(/^0+/, ''))
  }

  return (
    <div
      className={['flex w-full items-end', tone === 'public' ? `border-b ${borderClass}` : '', className]
        .filter(Boolean)
        .join(' ')}
    >
      <span className={prefixClass}>+234</span>
      <input
        id={id}
        ref={inputRef}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        required={required}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        placeholder="8012345678"
        value={national}
        onChange={(e) => handle(e.target.value)}
        onBlur={onBlur}
        className={inputClass}
      />
    </div>
  )
}
