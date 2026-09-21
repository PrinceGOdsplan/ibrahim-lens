/** Nigeria phone helpers: UI uses fixed +234 prefix; national part may include trunk 0. */

export type NgPhone = {
  /** Display / storage e.g. +2348031234567 */
  e164: string
  /** Digits only e.g. 2348031234567 — used for matching */
  digits: string
  /** National subscriber digits without leading 0 e.g. 8031234567 */
  national: string
}

export function digitsOnly(input: string) {
  return input.replace(/\D/g, '')
}

/**
 * Normalize from national segment (what user types after +234) or a full number.
 * Strips one leading 0 on the national part after +234 / 234.
 */
export function normalizeNgPhone(input: string): NgPhone | null {
  let d = digitsOnly(input)
  if (!d) return null

  if (d.startsWith('234')) {
    d = d.slice(3)
  }
  // trunk zero immediately after country code
  if (d.startsWith('0')) d = d.replace(/^0+/, '')

  // Nigerian mobile typically 10 digits starting with 7/8/9
  if (d.length < 7 || d.length > 11) return null

  const national = d
  const digits = `234${national}`
  return { e164: `+${digits}`, digits, national }
}

export function nationalFromE164(e164: string) {
  const normalized = normalizeNgPhone(e164)
  return normalized?.national ?? ''
}

/** Build wa.me link from a phone string (+234… or digits). */
export function whatsappHref(phone?: string) {
  const d = digitsOnly(phone ?? '')
  if (!d) return ''
  const withCountry = d.startsWith('234') ? d : d.startsWith('0') ? `234${d.replace(/^0+/, '')}` : d.length >= 10 ? `234${d}` : d
  if (withCountry.length < 11) return ''
  return `https://wa.me/${withCountry}`
}

export { formatNgn } from './format'
