/** Studio-wide date, time, and money presentation. Locale is pinned so day/month
 *  order is a decision, not a property of the photographer's browser. */

const LOCALE = 'en-GB'

export function formatDateTime(value?: string | Date | null) {
  if (!value) return ''
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return typeof value === 'string' ? value : ''
  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d)
}

export function formatDate(value?: string | Date | null) {
  if (!value) return ''
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return typeof value === 'string' ? value : ''
  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

export function formatNgn(amount: number | null | undefined) {
  const n = typeof amount === 'number' && !Number.isNaN(amount) ? amount : 0
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(n)
}

/** Short relative time for Studio notices (en-GB). */
export function formatRelativeTime(value?: string | Date | null) {
  if (!value) return ''
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const delta = Date.now() - d.getTime()
  const sec = Math.round(delta / 1000)
  if (sec < 60) return 'Just now'
  const min = Math.round(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  if (hr < 48) return `${hr}h ago`
  const day = Math.round(hr / 24)
  if (day < 14) return `${day}d ago`
  return formatDate(d)
}

/** Grouped Nigerian number for display; dial target stays the stored e164. */
export function formatNgPhoneDisplay(raw?: string) {
  const digits = (raw ?? '').replace(/\D/g, '')
  if (!digits) return ''
  const national = digits.startsWith('234') ? digits.slice(3) : digits.replace(/^0+/, '')
  if (national.length === 10) {
    return `+234 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`
  }
  if (national.length === 11 && national.startsWith('0')) {
    const n = national.slice(1)
    return `+234 ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`
  }
  return raw?.trim() || `+234 ${national}`
}

export function telHref(raw?: string) {
  const digits = (raw ?? '').replace(/\D/g, '')
  if (!digits) return ''
  const withCountry = digits.startsWith('234') ? digits : digits.startsWith('0') ? `234${digits.replace(/^0+/, '')}` : digits
  return `tel:+${withCountry}`
}
