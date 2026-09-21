import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  SectionSaveBar,
  StudioSection,
  quietTextareaClass,
  studioRowActive,
  studioRowBadge,
  useAccordion,
  useSectionSave,
} from '@/components/studio/StudioSection'
import {
  DEFAULT_EYEBROWS,
  SEO_PAGES,
  type SeoMeta,
  type WebsiteGlobals,
  type WebsiteGlobalsPatch,
} from '@/lib/website'
import { Coach } from '@/components/studio/website/shared'
import { cn } from '@/lib/utils'

type Props = {
  globals: WebsiteGlobals
  seo: SeoMeta[]
  busy: boolean
  open: boolean
  onToggle: () => void
  onSave: (data: WebsiteGlobalsPatch) => Promise<void>
  onSaveSeo: (pageKey: string, title: string, description: string) => Promise<void>
}

const EYEBROW_LABELS: Record<string, string> = {
  booked_for: 'Home — Booked for',
  selected: 'Home — Selected Work',
  atmosphere: 'Home — Atmosphere',
  clients: 'Home — Testimonials',
  about: 'About page',
  contact: 'Contact page',
  also: 'Contact — Also',
}

export function SiteChromePanel({ globals, seo, busy, open, onToggle, onSave, onSaveSeo }: Props) {
  const { openId, toggle } = useAccordion()
  const rev = globals.updated
  const homeSeo = seo.find((s) => s.page_key === 'home')
  const contactSeo = seo.find((s) => s.page_key === 'contact')

  return (
    <div className="border-t border-studio-border">
      <button
        type="button"
        className={cn(
          'flex w-full items-center justify-between gap-3 border-l-2 px-1 py-2.5 text-left text-sm transition-colors',
          open ? 'border-l-studio-fg bg-studio-panel/50 font-medium' : 'border-l-transparent',
        )}
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className={open ? 'text-studio-fg' : 'text-studio-muted'}>More site settings</span>
        <span className={cn('text-xs', open ? 'text-studio-fg' : 'text-studio-muted')}>
          {open ? 'Hide' : 'Edit'}
        </span>
      </button>
      {open ? (
        <div className="border-t border-studio-border/80 px-1 pt-1">
          <FooterSection
            open={openId === 'footer'}
            onToggle={toggle}
            globals={globals}
            rev={rev}
            onSave={onSave}
          />
          <EyebrowsSection
            open={openId === 'eyebrows'}
            onToggle={toggle}
            globals={globals}
            rev={rev}
            onSave={onSave}
          />
          <SeoSection
            open={openId === 'seo'}
            onToggle={toggle}
            seo={seo}
            busy={busy}
            homeSeo={homeSeo}
            contactSeo={contactSeo}
            onSaveSeo={onSaveSeo}
          />
          <LegalSection
            open={openId === 'legal'}
            onToggle={toggle}
            globals={globals}
            rev={rev}
            onSave={onSave}
          />
        </div>
      ) : null}
    </div>
  )
}

function FooterSection({
  open,
  onToggle,
  globals,
  rev,
  onSave,
}: {
  open: boolean
  onToggle: (id: string) => void
  globals: WebsiteGlobals
  rev: string
  onSave: (data: WebsiteGlobalsPatch) => Promise<void>
}) {
  const { status, error, runSave, reset } = useSectionSave()
  const [name, setName] = useState(globals.site_display_name ?? '')
  const [blurb, setBlurb] = useState(globals.footer_blurb ?? '')

  useEffect(() => {
    if (!open) return
    setName(globals.site_display_name ?? '')
    setBlurb(globals.footer_blurb ?? '')
    reset()
  }, [open, rev, globals.site_display_name, globals.footer_blurb, reset])

  return (
    <StudioSection id="footer" title="Footer & identity" open={open} onToggle={onToggle}>
      <div className="space-y-3">
        <div>
          <Label htmlFor="site-name" className="text-xs text-studio-muted">
            Name on the website
          </Label>
          <Input id="site-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ibrahim Lens" />
        </div>
        <div>
          <Label htmlFor="footer-blurb" className="text-xs text-studio-muted">
            Footer line
          </Label>
          <textarea
            id="footer-blurb"
            className={quietTextareaClass}
            value={blurb}
            onChange={(e) => setBlurb(e.target.value)}
            placeholder="e.g. Portraits and weddings in Lagos"
          />
        </div>
      </div>
      <SectionSaveBar
        status={status}
        error={error}
        dirty={name !== (globals.site_display_name ?? '') || blurb !== (globals.footer_blurb ?? '')}
        onSave={() => runSave(() => onSave({ site_display_name: name, footer_blurb: blurb }))}
      />
    </StudioSection>
  )
}

function EyebrowsSection({
  open,
  onToggle,
  globals,
  rev,
  onSave,
}: {
  open: boolean
  onToggle: (id: string) => void
  globals: WebsiteGlobals
  rev: string
  onSave: (data: WebsiteGlobalsPatch) => Promise<void>
}) {
  const { status, error, runSave, reset } = useSectionSave()
  const [draft, setDraft] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) return
    const current =
      globals.eyebrows && typeof globals.eyebrows === 'object' ? { ...(globals.eyebrows as Record<string, string>) } : {}
    setDraft(current)
    reset()
  }, [open, rev, globals.eyebrows, reset])

  const eyebrowsDirty = Object.keys(DEFAULT_EYEBROWS).some((key) => {
    const saved = (globals.eyebrows as Record<string, string> | undefined)?.[key] ?? ''
    return (draft[key] ?? '').trim() !== saved.trim()
  })

  return (
    <StudioSection id="eyebrows" title="Section labels" open={open} onToggle={onToggle}>
      <div className="grid gap-3 sm:grid-cols-2">
        {Object.keys(DEFAULT_EYEBROWS).map((key) => (
          <div key={key}>
            <Label htmlFor={`eyebrow-${key}`} className="text-xs text-studio-muted">
              {EYEBROW_LABELS[key] ?? key}
            </Label>
            <Input
              id={`eyebrow-${key}`}
              value={draft[key] ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
              placeholder={DEFAULT_EYEBROWS[key]}
            />
          </div>
        ))}
      </div>
      <SectionSaveBar
        status={status}
        error={error}
        dirty={eyebrowsDirty}
        onSave={() =>
          runSave(async () => {
            const next: Record<string, string> = {}
            for (const [key, value] of Object.entries(draft)) {
              const trimmed = value.trim()
              if (trimmed) next[key] = trimmed
            }
            await onSave({ eyebrows: next })
          })
        }
      />
    </StudioSection>
  )
}

/**
 * Share previews are read from static tags in the built HTML, so nothing in the
 * CMS can tell us whether that image exists. Ask the browser directly.
 */
function ShareImageCoach() {
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    const url = document.head
      .querySelector<HTMLMetaElement>('meta[property="og:image"]')
      ?.content?.trim()
    if (!url) {
      setMissing(true)
      return
    }
    let cancelled = false
    const probe = new Image()
    probe.onerror = () => {
      if (!cancelled) setMissing(true)
    }
    probe.src = url
    return () => {
      cancelled = true
    }
  }, [])

  if (!missing) return null

  return (
    <Coach>No share image yet.</Coach>
  )
}

function SeoSection({
  open,
  onToggle,
  seo,
  busy,
  homeSeo,
  contactSeo,
  onSaveSeo,
}: {
  open: boolean
  onToggle: (id: string) => void
  seo: SeoMeta[]
  busy: boolean
  homeSeo?: SeoMeta
  contactSeo?: SeoMeta
  onSaveSeo: (pageKey: string, title: string, description: string) => Promise<void>
}) {
  const { status, error, runSave, reset } = useSectionSave()
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, { title: string; description: string }>>({})
  const baseline = useRef('')

  useEffect(() => {
    if (!open) return
    const next: Record<string, { title: string; description: string }> = {}
    for (const page of SEO_PAGES) {
      const row = seo.find((s) => s.page_key === page.key)
      next[page.key] = { title: row?.title ?? '', description: row?.description ?? '' }
    }
    setDrafts(next)
    setActiveKey(null)
    baseline.current = ''
    reset()
  }, [open, seo, reset])

  function openPage(key: string) {
    if (activeKey === key) {
      setActiveKey(null)
      baseline.current = ''
      reset()
      return
    }
    const d = drafts[key] ?? { title: '', description: '' }
    setActiveKey(key)
    baseline.current = `${key}:${d.title}|${d.description}`
    reset()
  }

  const draft = activeKey ? (drafts[activeKey] ?? { title: '', description: '' }) : null
  const dirty = activeKey != null && draft != null && `${activeKey}:${draft.title}|${draft.description}` !== baseline.current

  return (
    <StudioSection id="seo" title="SEO" open={open} onToggle={onToggle}>
      {!homeSeo?.description?.trim() ? <Coach>Home description is empty.</Coach> : null}
      {!contactSeo?.description?.trim() ? <Coach>Contact description is empty.</Coach> : null}
      <ShareImageCoach />
      <ul className="mt-2 divide-y divide-studio-border/50">
        {SEO_PAGES.map((page) => {
          const isOpen = activeKey === page.key
          return (
            <li key={page.key}>
              <button
                type="button"
                className={studioRowActive(isOpen)}
                aria-expanded={isOpen}
                onClick={() => openPage(page.key)}
              >
                <span className="min-w-0 flex-1 truncate text-sm">{page.label}</span>
                {studioRowBadge(isOpen)}
              </button>
              {isOpen && draft ? (
                <div className="space-y-2.5 pb-3">
                  <div>
                    <Label htmlFor={`seo-title-${page.key}`} className="text-xs text-studio-muted">
                      Title Google shows
                    </Label>
                    <Input
                      id={`seo-title-${page.key}`}
                      value={draft.title}
                      placeholder="e.g. Ibrahim Lens — photographer in Lagos"
                      onChange={(e) =>
                        setDrafts((d) => ({ ...d, [page.key]: { ...draft, title: e.target.value } }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`seo-desc-${page.key}`} className="text-xs text-studio-muted">
                      Short description Google shows
                    </Label>
                    <Input
                      id={`seo-desc-${page.key}`}
                      value={draft.description}
                      placeholder="e.g. Portraits, weddings, and fashion in Lagos"
                      onChange={(e) =>
                        setDrafts((d) => ({ ...d, [page.key]: { ...draft, description: e.target.value } }))
                      }
                    />
                  </div>
                  <SectionSaveBar
                    status={status}
                    error={error}
                    dirty={dirty}
                    disabled={busy}
                    onSave={() =>
                      runSave(async () => {
                        await onSaveSeo(page.key, draft.title, draft.description)
                        baseline.current = `${page.key}:${draft.title}|${draft.description}`
                      })
                    }
                  />
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
    </StudioSection>
  )
}

function LegalSection({
  open,
  onToggle,
  globals,
  rev,
  onSave,
}: {
  open: boolean
  onToggle: (id: string) => void
  globals: WebsiteGlobals
  rev: string
  onSave: (data: WebsiteGlobalsPatch) => Promise<void>
}) {
  const { status, error, runSave, reset } = useSectionSave()
  const [privacy, setPrivacy] = useState(globals.privacy_body ?? '')
  const [terms, setTerms] = useState(globals.terms_body ?? '')

  useEffect(() => {
    if (!open) return
    setPrivacy(globals.privacy_body ?? '')
    setTerms(globals.terms_body ?? '')
    reset()
  }, [open, rev, globals.privacy_body, globals.terms_body, reset])

  return (
    <StudioSection id="legal" title="Privacy and terms" open={open} onToggle={onToggle}>
      <p className="mb-3 text-xs text-studio-muted">Blank line for a paragraph. ## for a heading.</p>
      <div className="space-y-3">
        <div>
          <Label htmlFor="privacy-body" className="text-xs text-studio-muted">
            Privacy
          </Label>
          <textarea id="privacy-body" className={quietTextareaClass + ' min-h-28'} value={privacy} onChange={(e) => setPrivacy(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="terms-body" className="text-xs text-studio-muted">
            Terms
          </Label>
          <textarea id="terms-body" className={quietTextareaClass + ' min-h-28'} value={terms} onChange={(e) => setTerms(e.target.value)} />
        </div>
      </div>
      <SectionSaveBar
        status={status}
        error={error}
        dirty={privacy !== (globals.privacy_body ?? '') || terms !== (globals.terms_body ?? '')}
        onSave={() => runSave(() => onSave({ privacy_body: privacy, terms_body: terms }))}
      />
    </StudioSection>
  )
}
