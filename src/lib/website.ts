import type { RecordModel } from 'pocketbase'
import { pb } from '@/lib/pocketbase'
import { isGuestHiddenCreate, pbErrorMessage } from '@/lib/pb-error'
import type { MediaRecord } from '@/lib/library'
import { listPublicPortfolio } from '@/lib/library'

export const DEFAULT_WRITE_BLURB = 'Name, phone, and a short note.'

/** Earlier seed copy. Treated as unset so the form does not repeat a product rule. */
const LEGACY_BOOKING_HELP =
  'Pick any preferred date and time — this is a request, not a confirmed booking.'

export function bookingHelpText(value?: string | null) {
  const text = (value ?? '').trim()
  if (!text || text === LEGACY_BOOKING_HELP) return ''
  return text
}

export const MAX_BOOKING_QUESTIONS = 8
export const HOME_LANES_COUNT = 3
/** Soft night Home Services cards — grow from defaults up to this cap. */
export const MAX_HOME_LANES = 6
export const MAX_HOME_WORK_PICKS = 3
export const MAX_HOME_FEATURED = 5
/** Atmosphere frames shown on a phone; the rest live on Portfolio. */
export const HOME_ATMOSPHERE_MOBILE_COUNT = 6
export const DEFAULT_LANES_HEADLINE = 'Portraits, fashion, lifestyle'

export type FormFieldType = 'text' | 'email' | 'choice' | 'yesno' | 'textarea'

export type FormFieldDef = {
  id: string
  label: string
  type: FormFieldType
  required?: boolean
  options?: string[]
}

const CONTACT_QUESTION_KEYS = new Set(['name', 'phone', 'email', 'tel'])

export function isContactBookingQuestion(field: Pick<FormFieldDef, 'id' | 'label'>) {
  return CONTACT_QUESTION_KEYS.has(field.id.trim().toLowerCase()) || CONTACT_QUESTION_KEYS.has(field.label.trim().toLowerCase())
}

const STUDIO_FIELD_COPY: Record<string, { label: string; placeholder: string }> = {
  session_type: { label: 'Session', placeholder: '' },
  people: { label: 'People', placeholder: 'e.g. 2' },
  location: { label: 'Location', placeholder: 'Lagos' },
}

function isClientPromptQuestion(field: Pick<FormFieldDef, 'id' | 'label' | 'type'>) {
  if (field.type === 'textarea') return true
  const id = field.id.trim().toLowerCase()
  const label = field.label.trim().toLowerCase()
  return id === 'notes' || /anything we should know|anything we need to know/.test(label)
}

/** Website questions that belong on a Studio manual book — facts, not client prompts. */
export function studioManualBookingQuestions(fields: FormFieldDef[]) {
  return fields.filter((field) => !isContactBookingQuestion(field) && !isClientPromptQuestion(field))
}

export function studioBookingFieldCopy(field: FormFieldDef): { label: string; placeholder: string } {
  const known = STUDIO_FIELD_COPY[field.id]
  if (known) return known
  const label =
    field.id.replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()).trim() || field.label.replace(/\?+$/, '')
  return { label, placeholder: field.type === 'choice' || field.type === 'yesno' ? '' : label }
}

/** One of the three Home lane cards (Portraits / Fashion / Lifestyle by default). */
export type LaneDef = {
  title: string
  body: string
  image_id?: string
}

export type AtmosphereMode = 'auto' | 'manual'

export type WebsiteGlobals = RecordModel & {
  key: string
  home_tagline?: string
  home_featured: string[]
  /** Three Home lane cards — title/body/image, JSON on the record. */
  home_lanes?: LaneDef[]
  /** Authored Home lanes headline; empty uses DEFAULT_LANES_HEADLINE. */
  home_lanes_headline?: string
  /** auto = Portfolio minus Artist portrait; manual = atmosphere_ids order. */
  atmosphere_mode?: AtmosphereMode
  atmosphere_ids?: string[]
  /** Home Selected Work picks (max 3), ids into work_projects, in pick order. */
  home_work?: string[]
  about_body?: string
  about_subtitle?: string
  about_tease_headline?: string
  about_tease_lead?: string
  contact_h1?: string
  contact_intro?: string
  contact_email?: string
  contact_phone?: string
  contact_location?: string
  /** Instagram handle or full URL — shown in public footer when set */
  social_instagram?: string
  booking_questions?: FormFieldDef[]
  booking_calendar_enabled?: boolean
  booking_help_text?: string
  /** One-line note under Write on Contact. Empty uses DEFAULT_WRITE_BLURB. */
  write_blurb?: string
  /** Site chrome (tucked): rare, low-frequency fields below. */
  footer_blurb?: string
  eyebrows?: Record<string, string>
  privacy_body?: string
  terms_body?: string
  site_display_name?: string
  expand?: { home_featured?: MediaRecord[] }
}

export type Testimonial = RecordModel & {
  quote: string
  author_name: string
  author_role?: string
  published: boolean
  sort: number
}

export type FaqItem = RecordModel & {
  question: string
  answer: string
  sort: number
}

export type SeoMeta = RecordModel & {
  page_key: string
  title?: string
  description?: string
}

export const SEO_PAGES = [
  { key: 'home', label: 'Home' },
  { key: 'about', label: 'About' },
  { key: 'portfolio', label: 'Portfolio' },
  { key: 'work', label: 'Work' },
  { key: 'contact', label: 'Contact' },
  { key: 'privacy', label: 'Privacy' },
  { key: 'terms', label: 'Terms' },
] as const

export const DEFAULT_LANES: LaneDef[] = [
  {
    title: 'Portraits',
    body: 'Personal branding, birthdays, and milestone sessions — presence, attitude, and clean light.',
  },
  {
    title: 'Fashion',
    body: 'Brand lookbooks and campaigns — fabric, street energy, and frames built to sell.',
  },
  {
    title: 'Lifestyle',
    body: 'Celebrity and lifestyle work — culture, moments, and the images that carry the vibe.',
  },
]

export const DEFAULT_EYEBROWS: Record<string, string> = {
  booked_for: 'Booked for',
  selected: 'Selected',
  atmosphere: 'From the portfolio',
  clients: 'Clients',
  about: 'About',
  contact: 'Contact',
  also: 'Also',
}

/** Normalizes stored home_lanes (array, JSON string, or missing). Empty → Soft night defaults. Cap → MAX_HOME_LANES. */
export function parseLanes(raw: unknown): LaneDef[] {
  let arr: unknown[] = []
  if (Array.isArray(raw)) {
    arr = raw
  } else if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) arr = parsed
    } catch {
      arr = []
    }
  }

  if (!arr.length) {
    return DEFAULT_LANES.map((lane) => ({ ...lane }))
  }

  return arr.slice(0, MAX_HOME_LANES).map((entry, i) => {
    const item = (entry ?? {}) as Partial<LaneDef>
    const fallback = DEFAULT_LANES[i]
    const title = typeof item.title === 'string' ? item.title.trim() : ''
    const body = typeof item.body === 'string' ? item.body.trim() : ''
    return {
      title: title || fallback?.title || `Service ${i + 1}`,
      body: body || fallback?.body || '',
      image_id: typeof item.image_id === 'string' && item.image_id ? item.image_id : undefined,
    }
  })
}

export function lanesHeadline(raw?: string | null) {
  const value = (raw ?? '').trim()
  return value || DEFAULT_LANES_HEADLINE
}

/** Track count for Home lanes: 1→1, 2→2, 3→3, 4→2, 5→3 with a shared trailing row, 6→3. */
export function laneGridClass(count: number) {
  if (count <= 1) return 'max-w-md grid-cols-1'
  if (count === 2 || count === 4) return 'sm:grid-cols-2'
  if (count === 5) return 'sm:grid-cols-2 lg:grid-cols-6'
  return 'sm:grid-cols-2 lg:grid-cols-3'
}

export function laneItemClass(count: number, index: number) {
  if (count !== 5) return ''
  return index < 3 ? 'lg:col-span-2' : 'lg:col-span-3'
}

export function emptyLane(index = 0): LaneDef {
  const fallback = DEFAULT_LANES[index]
  return {
    title: fallback?.title ?? '',
    body: fallback?.body ?? '',
  }
}

/** Normalizes stored eyebrows (object, JSON string, or missing), merged over Soft night defaults. */
export function parseEyebrows(raw: unknown): Record<string, string> {
  let obj: Record<string, unknown> = {}
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    obj = raw as Record<string, unknown>
  } else if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) obj = parsed
    } catch {
      obj = {}
    }
  }
  const merged: Record<string, string> = { ...DEFAULT_EYEBROWS }
  for (const key of Object.keys(DEFAULT_EYEBROWS)) {
    const value = obj[key]
    if (typeof value === 'string' && value.trim()) merged[key] = value.trim()
  }
  return merged
}

function newId() {
  return `f_${Math.random().toString(36).slice(2, 10)}`
}

let globalsInflight: Promise<WebsiteGlobals> | null = null

async function fetchOrCreateGlobals(): Promise<WebsiteGlobals> {
  const list = await pb.collection('website_globals').getList<WebsiteGlobals>(1, 1, {
    filter: 'key="site"',
    expand: 'home_featured',
  })
  if (list.items[0]) return list.items[0]

  try {
    return await pb.collection('website_globals').create<WebsiteGlobals>({
      key: 'site',
      home_tagline: 'Portraits & fashion — shooting across Nigeria.',
      home_featured: [],
      about_body: '',
      booking_questions: [],
      booking_calendar_enabled: true,
      booking_help_text: '',
    })
  } catch (error) {
    // React Strict Mode (and parallel page loads) can race two creates on key=site.
    const again = await pb.collection('website_globals').getList<WebsiteGlobals>(1, 1, {
      filter: 'key="site"',
      expand: 'home_featured',
    })
    if (again.items[0]) return again.items[0]
    throw new Error(pbErrorMessage(error, 'Failed to create website settings.'))
  }
}

export async function getWebsiteGlobals(): Promise<WebsiteGlobals> {
  if (!globalsInflight) {
    globalsInflight = fetchOrCreateGlobals().finally(() => {
      globalsInflight = null
    })
  }
  return globalsInflight
}

export type WebsiteGlobalsPatch = Partial<{
  home_tagline: string
  home_featured: string[]
  home_lanes: LaneDef[]
  home_lanes_headline: string
  atmosphere_mode: AtmosphereMode
  atmosphere_ids: string[]
  home_work: string[]
  about_body: string
  about_subtitle: string
  about_tease_headline: string
  about_tease_lead: string
  contact_h1: string
  contact_intro: string
  contact_email: string
  contact_phone: string
  contact_location: string
  social_instagram: string
  booking_questions: FormFieldDef[]
  booking_calendar_enabled: boolean
  booking_help_text: string
  write_blurb: string
  footer_blurb: string
  eyebrows: Record<string, string>
  privacy_body: string
  terms_body: string
  site_display_name: string
}>

export async function saveWebsiteGlobals(id: string, data: WebsiteGlobalsPatch) {
  const payload: Record<string, unknown> = { ...data }
  if ('contact_email' in payload) {
    const email = String(payload.contact_email ?? '').trim()
    // PocketBase email fields reject empty/invalid values
    if (!email) delete payload.contact_email
    else payload.contact_email = email
  }
  try {
    return await pb.collection('website_globals').update<WebsiteGlobals>(id, payload)
  } catch (error) {
    throw new Error(pbErrorMessage(error, 'Failed to save website settings.'))
  }
}

export async function listPortfolioForFeatured() {
  return listPublicPortfolio()
}

export async function listTestimonials() {
  return pb.collection('testimonials').getFullList<Testimonial>({ sort: 'sort,created' })
}

export async function listPublishedTestimonials() {
  return pb.collection('testimonials').getFullList<Testimonial>({
    filter: 'published = true',
    sort: 'sort,created',
  })
}

export async function createTestimonial(data: {
  quote: string
  author_name: string
  author_role?: string
  published?: boolean
}) {
  const all = await listTestimonials()
  try {
    return await pb.collection('testimonials').create<Testimonial>({
      quote: data.quote,
      author_name: data.author_name,
      author_role: data.author_role ?? '',
      published: data.published ?? true,
      sort: all.length + 1,
    })
  } catch (error) {
    throw new Error(pbErrorMessage(error, 'Failed to create testimonial.'))
  }
}

export async function updateTestimonial(id: string, data: Partial<Testimonial>) {
  return pb.collection('testimonials').update<Testimonial>(id, data)
}

export async function deleteTestimonial(id: string) {
  return pb.collection('testimonials').delete(id)
}

export async function listFaq() {
  return pb.collection('faq_items').getFullList<FaqItem>({ sort: 'sort,created' })
}

export async function createFaq(data: { question: string; answer: string }) {
  const all = await listFaq()
  try {
    return await pb.collection('faq_items').create<FaqItem>({
      ...data,
      sort: all.length + 1,
    })
  } catch (error) {
    throw new Error(pbErrorMessage(error, 'Failed to create FAQ.'))
  }
}

export async function updateFaq(id: string, data: Partial<FaqItem>) {
  return pb.collection('faq_items').update<FaqItem>(id, data)
}

export async function deleteFaq(id: string) {
  return pb.collection('faq_items').delete(id)
}

export async function listSeo() {
  return pb.collection('seo_meta').getFullList<SeoMeta>({ sort: 'page_key' })
}

export async function upsertSeo(pageKey: string, title: string, description: string) {
  const existing = await pb.collection('seo_meta').getList<SeoMeta>(1, 1, {
    filter: `page_key="${pageKey.replaceAll('"', '\\"')}"`,
  })
  try {
    if (existing.items[0]) {
      return await pb.collection('seo_meta').update<SeoMeta>(existing.items[0].id, { title, description })
    }
    return await pb.collection('seo_meta').create<SeoMeta>({ page_key: pageKey, title, description })
  } catch (error) {
    // Race on create: refetch
    const again = await pb.collection('seo_meta').getList<SeoMeta>(1, 1, {
      filter: `page_key="${pageKey.replaceAll('"', '\\"')}"`,
    })
    if (again.items[0]) {
      return pb.collection('seo_meta').update<SeoMeta>(again.items[0].id, { title, description })
    }
    throw new Error(pbErrorMessage(error, 'Failed to save SEO.'))
  }
}

export async function getSeo(pageKey: string) {
  try {
    return await pb.collection('seo_meta').getFirstListItem<SeoMeta>(`page_key="${pageKey.replaceAll('"', '\\"')}"`)
  } catch {
    return null
  }
}

export function createEmptyField(type: FormFieldType = 'text'): FormFieldDef {
  return { id: newId(), label: 'New question', type, required: false, options: type === 'choice' ? ['Option A', 'Option B'] : undefined }
}

export async function submitInquiry(
  kind: 'contact' | 'booking',
  payload: Record<string, unknown>,
  trap?: string,
) {
  try {
    return await pb.collection('form_inquiries').create(
      {
        kind,
        payload: {
          ...payload,
          ...(kind === 'booking' ? { booking_status: 'pending' } : {}),
          inbox_read: false,
        },
      },
      trap ? { query: { hp: trap } } : undefined,
    )
  } catch (error) {
    if (isGuestHiddenCreate(error)) {
      return { id: '', kind, payload } as unknown as RecordModel
    }
    throw new Error(pbErrorMessage(error, 'Failed to submit form.'))
  }
}
