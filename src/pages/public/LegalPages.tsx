import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PublicBreadcrumbs } from '@/components/public/PublicBreadcrumbs'
import { StreetAtmosphere } from '@/components/public/StreetAtmosphere'
import { getWebsiteGlobals } from '@/lib/website'
import { usePageSeo } from '@/lib/usePageSeo'

const DEFAULT_PRIVACY = `This site is for the pictures and for getting in touch. We only keep what we need to reply, plan a session, and send your gallery.

## When you write in
A booking or a message may include your name, phone, email, a preferred date, and a few notes about the shoot. That is so we can reach you and prepare.

## Galleries
When a gallery is ready, we may use your name and an email so you can open it and leave feedback. Those links are short-lived — they close about a week after we send them.

## How it is used
What you send stays with Ibrahim Lens: to answer you, hold the date, deliver work, and follow up. It is not passed along for advertising.

## Studio Assistant
If Ibrahim uses Studio Assistant, a name, the last four digits of a phone number, and the text of a booking or a message may be sent to the service that writes the replies.

## Corrections
If something we hold is wrong, or you want it gone, write through Contact or WhatsApp. We will correct or remove what we can.`

const DEFAULT_TERMS = `Look around, ask for a session, and treat the work with the same care we do.

## Booking
A date you pick is a preference. Nothing is held until we confirm with you.

## Pictures
Photographs on this site, and work made for a session, remain Ibrahim Lens unless a separate agreement says otherwise.

## Galleries
Client galleries are private and temporary. Please do not publish or pass them on without a word from us.

## The site
Pages and availability may change. The note on this page is the one that applies today.`

type LegalBlock = { heading?: string; paragraphs: string[] }

function parseLegal(text: string): { lead: string; sections: LegalBlock[] } {
  const blocks = text
    .trim()
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)

  let lead = ''
  const rest = [...blocks]
  if (rest[0] && !rest[0].startsWith('## ')) {
    lead = rest.shift() ?? ''
  }

  const sections: LegalBlock[] = []
  for (const block of rest) {
    if (block.startsWith('## ')) {
      const newline = block.indexOf('\n')
      const heading = (newline === -1 ? block.slice(3) : block.slice(3, newline)).trim()
      const body = newline === -1 ? '' : block.slice(newline).trim()
      sections.push({ heading, paragraphs: body ? [body] : [] })
      continue
    }
    const last = sections[sections.length - 1]
    if (last) last.paragraphs.push(block)
    else sections.push({ paragraphs: [block] })
  }

  return { lead, sections }
}

function LegalDocument({
  eyebrow,
  title,
  text,
  other,
}: {
  eyebrow: string
  title: string
  text: string
  other: { to: string; label: string }
}) {
  const { lead, sections } = parseLegal(text)

  return (
    <div className="street-atmosphere-panel relative min-h-[70vh] overflow-hidden">
      <StreetAtmosphere glow="end" />
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-20 md:py-28">
        <PublicBreadcrumbs items={[{ label: title }]} />
        <p className="street-eyebrow">{eyebrow}</p>
        <h1 className="mt-2 font-display text-6xl leading-none">{title}</h1>
        {lead ? <p className="street-body mt-5 max-w-md text-base leading-relaxed md:text-lg">{lead}</p> : null}

        {sections.length ? (
          <div className="mt-14 space-y-12">
            {sections.map((section, i) => (
              <div key={`${section.heading ?? 'note'}-${i}`}>
                {section.heading ? <h2 className="street-eyebrow text-public-muted">{section.heading}</h2> : null}
                <div className={section.heading ? 'street-body mt-3 space-y-3 text-sm leading-relaxed' : 'street-body space-y-3 text-sm leading-relaxed'}>
                  {section.paragraphs.map((p) => (
                    <p key={p.slice(0, 40)}>{p}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <nav className="mt-16 flex flex-col gap-1 border-t border-white/10 pt-10 text-sm" aria-label="Continue">
          <Link to={other.to} className="tap-link text-public-fg underline-offset-4 hover:underline">
            {other.label}
          </Link>
          <Link to="/contact" className="tap-link text-public-fg underline-offset-4 hover:underline">
            Contact
          </Link>
        </nav>
      </section>
    </div>
  )
}

export function PrivacyPage() {
  usePageSeo('privacy', 'Privacy · Ibrahim Lens')
  const [body, setBody] = useState(DEFAULT_PRIVACY)

  useEffect(() => {
    getWebsiteGlobals()
      .then((g) => {
        const custom = (g.privacy_body ?? '').trim()
        if (custom) setBody(custom)
      })
      .catch(() => undefined)
  }, [])

  return (
    <LegalDocument
      eyebrow="House notes"
      title="Privacy"
      text={body}
      other={{ to: '/terms', label: 'Terms' }}
    />
  )
}

export function TermsPage() {
  usePageSeo('terms', 'Terms · Ibrahim Lens')
  const [body, setBody] = useState(DEFAULT_TERMS)

  useEffect(() => {
    getWebsiteGlobals()
      .then((g) => {
        const custom = (g.terms_body ?? '').trim()
        if (custom) setBody(custom)
      })
      .catch(() => undefined)
  }, [])

  return (
    <LegalDocument
      eyebrow="House notes"
      title="Terms"
      text={body}
      other={{ to: '/privacy', label: 'Privacy' }}
    />
  )
}
