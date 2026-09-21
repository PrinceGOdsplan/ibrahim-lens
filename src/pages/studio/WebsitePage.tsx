import { useCallback, useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AboutTab } from '@/components/studio/website/AboutTab'
import { ContactBookingTab } from '@/components/studio/website/ContactBookingTab'
import { HomeTab } from '@/components/studio/website/HomeTab'
import { SiteChromePanel } from '@/components/studio/website/SiteChromePanel'
import {
  SectionSaveBar,
  StudioSection,
  quietTextareaClass,
  useAccordion,
  useSectionSave,
} from '@/components/studio/StudioSection'
import {
  getArtistPortrait,
  listPublicWork,
  type MediaRecord,
  type WorkRecord,
} from '@/lib/library'
import {
  type FaqItem,
  type SeoMeta,
  type Testimonial,
  type WebsiteGlobals,
  type WebsiteGlobalsPatch,
  createFaq,
  createTestimonial,
  deleteFaq,
  deleteTestimonial,
  getWebsiteGlobals,
  listFaq,
  listPortfolioForFeatured,
  listSeo,
  listTestimonials,
  saveWebsiteGlobals,
  updateFaq,
  updateTestimonial,
  upsertSeo,
} from '@/lib/website'
import { CircleHelp, Home, Mail, Quote, User } from 'lucide-react'
import { StudioTabs } from '@/components/studio/StudioTabs'
import { StudioHubHeader } from '@/components/studio/StudioHubHeader'
import { StudioHubShell, StudioScrollPane } from '@/components/studio/StudioHubShell'
import { Alert, PartialDataNotice } from '@/components/ui/alert'
import { Skeleton, SkeletonText } from '@/components/ui/skeleton'
import { useConfirm } from '@/components/ui/confirm'
import { pbErrorMessage } from '@/lib/pb-error'
import { useUrlTab } from '@/lib/useUrlTab'
import { settleAll } from '@/lib/useAsyncData'

function WebsiteSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-full max-w-md rounded" />
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="rounded-lg border border-studio-border bg-studio-panel p-4">
          <Skeleton className="h-4 w-32" />
          <SkeletonText lines={2} className="mt-3" />
        </div>
      ))}
    </div>
  )
}

type PrimaryTab = 'home' | 'about' | 'contact'
type SecondaryTab = 'testimonials' | 'faq'
type Tab = PrimaryTab | SecondaryTab

const TABS: readonly Tab[] = ['home', 'about', 'contact', 'testimonials', 'faq']

const PRIMARY: { id: PrimaryTab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'about', label: 'About', icon: User },
  { id: 'contact', label: 'Contact & booking', icon: Mail },
]

const SECONDARY: { id: SecondaryTab; label: string; icon: typeof Quote }[] = [
  { id: 'testimonials', label: 'Testimonials', icon: Quote },
  { id: 'faq', label: 'FAQ', icon: CircleHelp },
]

export function StudioWebsitePage() {
  const [tab, setTab] = useUrlTab<Tab>('tab', TABS, 'home')
  const [chromeOpen, setChromeOpen] = useState(false)
  const [globals, setGlobals] = useState<WebsiteGlobals | null>(null)
  const [portfolio, setPortfolio] = useState<MediaRecord[]>([])
  const [websiteWork, setWebsiteWork] = useState<WorkRecord[]>([])
  const [artistPortrait, setArtistPortrait] = useState<MediaRecord | null>(null)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [faq, setFaq] = useState<FaqItem[]>([])
  const [seo, setSeo] = useState<SeoMeta[]>([])
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState<string[]>([])
  const { confirm, dialog: confirmDialog } = useConfirm()

  const refresh = useCallback(async () => {
    const { values, failed: missing } = await settleAll({
      Settings: getWebsiteGlobals,
      Portfolio: listPortfolioForFeatured,
      Work: listPublicWork,
      'About photo': getArtistPortrait,
      Testimonials: listTestimonials,
      FAQ: listFaq,
      SEO: listSeo,
    })

    // Without site settings there is nothing to edit, so that one is fatal.
    if (!values.Settings) throw new Error('Could not load your website settings.')

    setGlobals(values.Settings)
    if (values.Portfolio) setPortfolio(values.Portfolio)
    if (values.Work) setWebsiteWork(values.Work)
    setArtistPortrait(values['About photo'] ?? null)
    if (values.Testimonials) setTestimonials(values.Testimonials)
    if (values.FAQ) setFaq(values.FAQ)
    if (values.SEO) setSeo(values.SEO)
    setFailed(missing.filter((key) => key !== 'About photo'))
  }, [])

  const load = useCallback(() => {
    let alive = true
    setError(null)
    refresh()
      .then(() => {
        if (alive) setError(null)
      })
      .catch((e) => {
        if (alive) setError(pbErrorMessage(e, 'Could not load your website.'))
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

  async function run(action: () => Promise<void>, ok?: string) {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      await action()
      await refresh()
      if (ok) setMessage(ok)
    } catch (e) {
      setError(pbErrorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (!message) return
    const id = window.setTimeout(() => setMessage(null), 4000)
    return () => window.clearTimeout(id)
  }, [message])

  async function saveGlobals(data: WebsiteGlobalsPatch) {
    if (!globals) throw new Error('Website not loaded')
    setBusy(true)
    setError(null)
    try {
      await saveWebsiteGlobals(globals.id, data)
      await refresh()
    } catch (e) {
      setError(pbErrorMessage(e))
      throw e
    } finally {
      setBusy(false)
    }
  }

  return (
    <StudioHubShell>
      <StudioHubHeader title="Website">
        <div className="mt-3">
          <StudioTabs
            value={tab}
            onChange={setTab}
            aria-label="Website sections"
            primary={PRIMARY}
            secondary={SECONDARY}
          />
        </div>
      </StudioHubHeader>
      <StudioScrollPane innerClassName="space-y-6">
      {error ? (
        <Alert variant="error" onRetry={load}>
          {error}
        </Alert>
      ) : null}
      <PartialDataNotice missing={failed} onRetry={load} />
      {message ? (
        <Alert variant="success">
          {message}
        </Alert>
      ) : null}
      {!loaded ? <WebsiteSkeleton /> : null}

      {!globals ? <p className="text-sm text-studio-muted">Loading…</p> : null}

      {globals && tab === 'home' ? (
        <HomeTab
          globals={globals}
          portfolio={portfolio}
          allMedia={portfolio}
          websiteWork={websiteWork}
          busy={busy}
          onSave={saveGlobals}
          onRefresh={refresh}
        />
      ) : null}

      {globals && tab === 'about' ? (
        <AboutTab globals={globals} artistPortrait={artistPortrait} busy={busy} onSave={saveGlobals} onRefresh={refresh} />
      ) : null}

      {globals && tab === 'contact' ? <ContactBookingTab globals={globals} busy={busy} onSave={saveGlobals} /> : null}

      {tab === 'testimonials' ? (
        <TestimonialsEditor
          items={testimonials}
          busy={busy}
          onCreate={() =>
            run(
              () =>
                createTestimonial({
                  quote: 'New quote…',
                  author_name: 'Client',
                  published: false,
                }).then(() => undefined),
              'Testimonial added.',
            )
          }
          onSave={async (id, data) => {
            await updateTestimonial(id, data)
            await refresh()
          }}
          onDelete={async (id) => {
            const item = testimonials.find((t) => t.id === id)
            const ok = await confirm({
              title: 'Delete this testimonial?',
              body: item
                ? `"${item.quote.slice(0, 80)}${item.quote.length > 80 ? '…' : ''}" will be removed from the site. This cannot be undone.`
                : 'It will be removed from the site. This cannot be undone.',
              confirmLabel: 'Delete',
              destructive: true,
            })
            if (!ok) return
            await run(() => deleteTestimonial(id).then(() => undefined), 'Testimonial deleted.')
          }}
        />
      ) : null}

      {tab === 'faq' ? (
        <FaqEditor
          items={faq}
          busy={busy}
          onCreate={() => run(() => createFaq({ question: 'New question?', answer: 'Answer…' }).then(() => undefined), 'FAQ added.')}
          onSave={async (id, data) => {
            await updateFaq(id, data)
            await refresh()
          }}
          onDelete={async (id) => {
            const item = faq.find((f) => f.id === id)
            const ok = await confirm({
              title: 'Delete this FAQ?',
              body: item
                ? `"${item.question}" will be removed from the site. This cannot be undone.`
                : 'It will be removed from the site. This cannot be undone.',
              confirmLabel: 'Delete',
              destructive: true,
            })
            if (!ok) return
            await run(() => deleteFaq(id).then(() => undefined), 'FAQ deleted.')
          }}
        />
      ) : null}

      {globals ? (
        <SiteChromePanel
          globals={globals}
          seo={seo}
          busy={busy}
          open={chromeOpen}
          onToggle={() => setChromeOpen((o) => !o)}
          onSave={saveGlobals}
          onSaveSeo={async (pageKey, title, description) => {
            await upsertSeo(pageKey, title, description)
            await refresh()
          }}
        />
      ) : null}

      {confirmDialog}
      </StudioScrollPane>
    </StudioHubShell>
  )
}

function TestimonialsEditor({
  items,
  busy,
  onCreate,
  onSave,
  onDelete,
}: {
  items: Testimonial[]
  busy: boolean
  onCreate: () => void
  onSave: (id: string, data: Partial<Testimonial>) => Promise<void>
  onDelete: (id: string) => void
}) {
  const { openId, toggle } = useAccordion()

  return (
    <section className="space-y-2">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-studio-muted">Published testimonials appear on Home.</p>
          <p className="mt-1 text-xs text-studio-muted">
            Promote from delivery feedback →{' '}
            <Link to="/studio/clients?tab=feedback" className="underline">
              Clients → Feedback
            </Link>
          </p>
        </div>
        <button type="button" className="text-xs text-studio-accent hover:opacity-80 disabled:opacity-50" disabled={busy} onClick={onCreate}>
          Add
        </button>
      </div>
      {items.map((item) => (
        <TestimonialSection
          key={item.id}
          item={item}
          open={openId === item.id}
          onToggle={toggle}
          busy={busy}
          onSave={onSave}
          onDelete={onDelete}
        />
      ))}
      {!items.length ? <p className="text-sm text-studio-muted">No testimonials yet.</p> : null}
    </section>
  )
}

function TestimonialSection({
  item,
  open,
  onToggle,
  busy,
  onSave,
  onDelete,
}: {
  item: Testimonial
  open: boolean
  onToggle: (id: string) => void
  busy: boolean
  onSave: (id: string, data: Partial<Testimonial>) => Promise<void>
  onDelete: (id: string) => void
}) {
  const { status, error, runSave, reset } = useSectionSave()
  const [quote, setQuote] = useState(item.quote)
  const [author, setAuthor] = useState(item.author_name)
  const [role, setRole] = useState(item.author_role ?? '')
  const [published, setPublished] = useState(!!item.published)

  useEffect(() => {
    if (!open) return
    setQuote(item.quote)
    setAuthor(item.author_name)
    setRole(item.author_role ?? '')
    setPublished(!!item.published)
    reset()
  }, [open, item, reset])

  const fieldId = useId()
  const dirty =
    quote !== item.quote ||
    author !== item.author_name ||
    role !== (item.author_role ?? '') ||
    published !== !!item.published

  return (
    <StudioSection
      id={item.id}
      title={item.author_name || 'Testimonial'}
      hint={item.published ? 'Published' : 'Draft'}
      open={open}
      onToggle={onToggle}
    >
      <div className="space-y-3">
        <div>
          <Label htmlFor={`${fieldId}-quote`} className="text-xs text-studio-muted">
            Quote
          </Label>
          <textarea
            id={`${fieldId}-quote`}
            className={quietTextareaClass}
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder="e.g. Working with Ibrahim felt easy."
          />
        </div>
        <div>
          <Label htmlFor={`${fieldId}-author`} className="text-xs text-studio-muted">
            Name
          </Label>
          <Input
            id={`${fieldId}-author`}
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="e.g. Ada"
          />
        </div>
        <div>
          <Label htmlFor={`${fieldId}-role`} className="text-xs text-studio-muted">
            Who they are
          </Label>
          <Input
            id={`${fieldId}-role`}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Bride, Lagos"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={published} disabled={busy} onChange={(e) => setPublished(e.target.checked)} />
          Published on Home
        </label>
      </div>
      <SectionSaveBar
        status={status}
        error={error}
        dirty={dirty}
        onSave={() =>
          runSave(() =>
            onSave(item.id, {
              quote,
              author_name: author.trim() || item.author_name,
              author_role: role,
              published,
            }),
          )
        }
      />
      <button
        type="button"
        className="mt-2 text-xs text-studio-muted hover:text-studio-danger disabled:opacity-50"
        disabled={busy}
        onClick={() => onDelete(item.id)}
      >
        Delete
      </button>
    </StudioSection>
  )
}

function FaqEditor({
  items,
  busy,
  onCreate,
  onSave,
  onDelete,
}: {
  items: FaqItem[]
  busy: boolean
  onCreate: () => void
  onSave: (id: string, data: Partial<FaqItem>) => Promise<void>
  onDelete: (id: string) => void
}) {
  const { openId, toggle } = useAccordion()

  return (
    <section className="space-y-2">
      <div className="mb-3 flex justify-between gap-3">
        <p className="text-sm text-studio-muted">FAQ items publish on the Contact page only.</p>
        <button type="button" className="text-xs text-studio-accent hover:opacity-80 disabled:opacity-50" disabled={busy} onClick={onCreate}>
          Add
        </button>
      </div>
      {items.map((item) => (
        <FaqSection key={item.id} item={item} open={openId === item.id} onToggle={toggle} busy={busy} onSave={onSave} onDelete={onDelete} />
      ))}
      {!items.length ? <p className="text-sm text-studio-muted">No FAQ items yet.</p> : null}
    </section>
  )
}

function FaqSection({
  item,
  open,
  onToggle,
  busy,
  onSave,
  onDelete,
}: {
  item: FaqItem
  open: boolean
  onToggle: (id: string) => void
  busy: boolean
  onSave: (id: string, data: Partial<FaqItem>) => Promise<void>
  onDelete: (id: string) => void
}) {
  const { status, error, runSave, reset } = useSectionSave()
  const [question, setQuestion] = useState(item.question)
  const [answer, setAnswer] = useState(item.answer)

  useEffect(() => {
    if (!open) return
    setQuestion(item.question)
    setAnswer(item.answer)
    reset()
  }, [open, item, reset])

  const fieldId = useId()
  const dirty = question !== item.question || answer !== item.answer

  return (
    <StudioSection id={item.id} title={item.question || 'FAQ'} open={open} onToggle={onToggle}>
      <div className="space-y-3">
        <div>
          <Label htmlFor={`${fieldId}-question`} className="text-xs text-studio-muted">
            Question
          </Label>
          <Input
            id={`${fieldId}-question`}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. How do I book?"
          />
        </div>
        <div>
          <Label htmlFor={`${fieldId}-answer`} className="text-xs text-studio-muted">
            Answer
          </Label>
          <textarea
            id={`${fieldId}-answer`}
            className={quietTextareaClass}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="e.g. Yes — send a request on Contact, or WhatsApp me."
          />
        </div>
      </div>
      <SectionSaveBar
        status={status}
        error={error}
        dirty={dirty}
        onSave={() =>
          runSave(() =>
            onSave(item.id, {
              question: question.trim() || item.question,
              answer,
            }),
          )
        }
      />
      <button
        type="button"
        className="mt-2 text-xs text-studio-muted hover:text-studio-danger disabled:opacity-50"
        disabled={busy}
        onClick={() => onDelete(item.id)}
      >
        Delete
      </button>
    </StudioSection>
  )
}
