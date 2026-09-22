import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BookingSection } from '@/components/public/BookingSection'
import { WriteSection } from '@/components/public/WriteSection'
import { HeroSlideControls, HeroSlideshow } from '@/components/public/HeroSlideshow'
import { PublicBreadcrumbs } from '@/components/public/PublicBreadcrumbs'
import { StreetAtmosphere } from '@/components/public/StreetAtmosphere'
import { SubjectCover } from '@/components/public/SubjectCover'
import { TestimonialsCarousel } from '@/components/public/TestimonialsCarousel'
import {
  listPublicPortfolio,
  listPublicWork,
  getArtistPortrait,
  mediaImageSources,
  type MediaRecord,
  type WorkRecord,
} from '@/lib/library'
import {
  type FaqItem,
  type Testimonial,
  type WebsiteGlobals,
  MAX_HOME_WORK_PICKS,
  HOME_ATMOSPHERE_MOBILE_COUNT,
  laneGridClass,
  laneItemClass,
  lanesHeadline,
  parseEyebrows,
  parseLanes,
  getWebsiteGlobals,
  bookingHelpText,
  listFaq,
  listPublishedTestimonials,
} from '@/lib/website'
import { whatsappHref } from '@/lib/phone'
import { publicErrorMessage } from '@/lib/pb-error'
import { formatNgPhoneDisplay, telHref } from '@/lib/format'
import { usePageSeo } from '@/lib/usePageSeo'
import { Alert } from '@/components/ui/alert'

function workCover(work: WorkRecord): MediaRecord | null {
  const expanded = work.expand?.cover as MediaRecord | MediaRecord[] | undefined
  const cover = Array.isArray(expanded) ? expanded[0] : expanded
  if (cover?.file) return cover
  const firstId = work.images?.[0]
  if (!firstId) return null
  const images = work.expand?.images as MediaRecord[] | undefined
  return images?.find((img) => img.id === firstId) ?? null
}

export function HomePage() {
  usePageSeo('home', 'Ibrahim Lens')
  const [globals, setGlobals] = useState<WebsiteGlobals | null>(null)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [work, setWork] = useState<WorkRecord[]>([])
  const [portfolio, setPortfolio] = useState<MediaRecord[]>([])
  const [artist, setArtist] = useState<MediaRecord | null>(null)
  const [heroIndex, setHeroIndex] = useState(0)
  const [heroPaused, setHeroPaused] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadHome = useCallback(() => {
    setLoadError(null)
    Promise.all([
      getWebsiteGlobals(),
      listPublishedTestimonials(),
      listPublicWork(),
      listPublicPortfolio(),
      getArtistPortrait().catch(() => null),
    ])
      .then(([g, t, w, port, artistPortrait]) => {
        setGlobals(g)
        setTestimonials(t)
        setWork(w)
        setPortfolio(port)
        setArtist(artistPortrait)
      })
      .catch((e) => setLoadError(publicErrorMessage(e, 'Could not load the site.')))
  }, [])

  useEffect(() => {
    loadHome()
  }, [loadHome])

  const featured = useMemo(() => {
    const expanded = globals?.expand?.home_featured
    if (Array.isArray(expanded) && expanded.length) return expanded as MediaRecord[]
    return [] as MediaRecord[]
  }, [globals])

  const byId = useMemo(() => {
    const map = new Map<string, MediaRecord>()
    for (const m of [...featured, ...portfolio]) map.set(m.id, m)
    return map
  }, [featured, portfolio])

  const nonArtistPortfolio = useMemo(
    () => portfolio.filter((m) => !m.is_artist_portrait),
    [portfolio],
  )

  const heroSlides = featured.length ? featured : nonArtistPortfolio.slice(0, 5)

  const atmosphere = useMemo(() => {
    if (globals?.atmosphere_mode === 'manual' && (globals.atmosphere_ids?.length ?? 0) > 0) {
      return (globals.atmosphere_ids ?? []).map((id) => byId.get(id)).filter(Boolean) as MediaRecord[]
    }
    return nonArtistPortfolio.slice(0, 12)
  }, [globals, byId, nonArtistPortfolio])

  const proof = useMemo(() => {
    const picks = globals?.home_work ?? []
    if (picks.length) {
      return picks.map((id) => work.find((w) => w.id === id)).filter(Boolean).slice(0, MAX_HOME_WORK_PICKS) as WorkRecord[]
    }
    return work.slice(0, MAX_HOME_WORK_PICKS)
  }, [globals, work])

  const eyebrows = useMemo(() => parseEyebrows(globals?.eyebrows), [globals])

  useEffect(() => {
    setHeroIndex(0)
  }, [heroSlides.length])

  useEffect(() => {
    const el = document.getElementById('photographer-jsonld')
    if (!el) return
    const data: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'PhotographBusiness',
      name: globals?.site_display_name?.trim() || 'Ibrahim Lens',
      url: window.location.origin,
    }
    if (globals?.contact_email?.trim()) data.email = globals.contact_email.trim()
    if (globals?.contact_phone?.trim()) data.telephone = globals.contact_phone.trim()
    const address: Record<string, string> = { '@type': 'PostalAddress', addressCountry: 'NG' }
    if (globals?.contact_location?.trim()) address.addressLocality = globals.contact_location.trim()
    data.address = address
    el.textContent = JSON.stringify(data)
  }, [globals])

  const activeSlide = heroSlides[heroIndex] ?? heroSlides[0]
  const heroLine =
    activeSlide?.caption?.trim() ||
    globals?.home_tagline ||
    'Portraits & fashion — shooting across Nigeria.'

  const laneImages = useMemo(() => {
    const lanes = parseLanes(globals?.home_lanes)
    const pool = [...featured, ...nonArtistPortfolio]
    const unique: MediaRecord[] = []
    const seen = new Set<string>()
    for (const m of pool) {
      if (!m?.id || seen.has(m.id)) continue
      seen.add(m.id)
      unique.push(m)
    }
    return lanes.map((lane, i) => ({
      ...lane,
      image: (lane.image_id ? byId.get(lane.image_id) : undefined) ?? unique[i] ?? unique[0],
    }))
  }, [globals, featured, nonArtistPortfolio, byId])

  const aboutTeaseHeadline = (globals?.about_tease_headline ?? '').trim()
  const aboutTeaseLead =
    (globals?.about_tease_lead ?? '').trim() ||
    (globals?.about_body ?? '').trim().slice(0, 220) ||
    'Portraits and fashion bookings, lifestyle frames with presence — available across Nigeria.'

  return (
    <div>
      <section className="relative min-h-[100svh] overflow-hidden bg-public-bg">
        <HeroSlideshow images={heroSlides} index={heroIndex} onIndexChange={setHeroIndex} paused={heroPaused} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/25" />

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-28 sm:pb-10 sm:pt-32">
          <h1
            key={`${activeSlide?.id ?? 'none'}-${heroLine}`}
            className="atelier-fade-up max-w-3xl font-display text-5xl leading-[0.95] text-white sm:text-6xl md:max-w-5xl md:text-7xl lg:text-8xl"
          >
            {heroLine}
          </h1>
          <div className="atelier-fade-up-delay mt-10 flex items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link to="/contact#booking" className="street-cta-primary">
                Book a session
              </Link>
              <Link
                to="/portfolio"
                className="text-sm tracking-[0.12em] uppercase text-white/60 transition-colors hover:text-white"
              >
                Portfolio
              </Link>
            </div>
            <HeroSlideControls
              slides={heroSlides}
              index={heroIndex}
              paused={heroPaused}
              onPausedChange={setHeroPaused}
              onIndexChange={setHeroIndex}
            />
          </div>
        </div>
      </section>

      {loadError ? (
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-8">
          <Alert variant="error" tone="public" onRetry={loadHome}>
            {loadError}
          </Alert>
        </div>
      ) : null}

      <section className="street-section relative mx-auto max-w-7xl px-6 py-16 md:py-28" aria-label="What I shoot">
        <p className="street-eyebrow">{eyebrows.booked_for}</p>
        <h2 className="mt-2 font-display text-5xl leading-[1.05] text-public-fg md:text-7xl">
          {lanesHeadline(globals?.home_lanes_headline)}
        </h2>
        <p className="street-body mt-5 max-w-md text-sm md:max-w-lg">
          Portraits and fashion brands are the core bookings. Lifestyle carries celebrity and culture frames.
        </p>
      <ul
        className={[
          'mt-14 grid gap-4 border-t border-white/10 pt-10',
          laneGridClass(laneImages.length),
        ].join(' ')}
      >
          {laneImages.map((lane, i) => (
            <li key={`${lane.title}-${i}`} className={['group relative aspect-[3/4] overflow-hidden bg-white/5 sm:aspect-[4/5]', laneItemClass(laneImages.length, i)].filter(Boolean).join(' ')}>
              {lane.image ? (
                <SubjectCover
                  record={lane.image}
                  widthKey="half"
                  sizes="(min-width: 768px) 33vw, 100vw"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 transition duration-700 group-hover:scale-[1.03]"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <h3 className="font-display text-3xl leading-none text-white md:text-4xl">{lane.title}</h3>
                <p className="mt-2 max-w-[16rem] text-xs leading-relaxed text-white/70 sm:text-sm">{lane.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {proof.length ? (
        <section className="street-section relative border-y border-white/10 py-16 md:py-28" aria-label="Selected work">
          <div className="relative mx-auto max-w-7xl px-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-md">
                <p className="street-eyebrow">{eyebrows.selected}</p>
                <h2 className="mt-2 font-display text-5xl leading-none md:text-7xl">Work</h2>
                <p className="street-body mt-4 text-sm">
                  Full shoot stories — process, people, details.
                </p>
              </div>
              <Link
                to="/work"
                className="tap-link self-start text-sm text-public-muted hover:text-public-fg sm:mb-2 sm:self-end"
              >
                All work →
              </Link>
            </div>
            <div
              className={[
                'mt-12 grid gap-4',
                proof.length === 1 ? 'max-w-md sm:grid-cols-1' : proof.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3',
              ].join(' ')}
            >
              {proof.map((item) => {
                const cover = workCover(item)
                return (
                  <Link
                    key={item.id}
                    to={`/work/${item.slug}`}
                    className="group relative block overflow-hidden bg-public-fg/5"
                  >
                    <div className="aspect-[4/5]">
                      {cover ? (
                        <SubjectCover
                          record={cover}
                          widthKey="half"
                          sizes="(min-width: 640px) 33vw, 100vw"
                          alt={item.title}
                          loading="lazy"
                          decoding="async"
                          className="transition duration-700 group-hover:scale-[1.03]"
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    </div>
                    <h3 className="absolute bottom-4 left-4 right-4 font-display text-2xl leading-none text-white sm:text-3xl">
                      {item.title}
                    </h3>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      ) : null}

      {atmosphere.length ? (
        <section className="py-14 md:py-24" aria-label="Atmosphere">
          <div className="mx-auto mb-6 flex max-w-7xl items-end justify-between gap-4 px-6 md:mb-10">
            <div>
              <p className="street-eyebrow">{eyebrows.atmosphere}</p>
              <h2 className="mt-2 font-display text-4xl leading-none text-public-fg md:text-6xl">
                Atmosphere
              </h2>
            </div>
            <Link to="/portfolio" className="tap-link mb-1 text-sm text-public-muted hover:text-public-fg">
              Portfolio →
            </Link>
          </div>
          <div className="public-masonry mx-auto max-w-7xl px-4 md:px-6">
            {atmosphere.map((item, index) => (
              <figure
                key={item.id}
                className={[
                  'public-masonry-item overflow-hidden bg-public-fg/5',
                  index >= HOME_ATMOSPHERE_MOBILE_COUNT ? 'max-md:hidden' : '',
                ].join(' ')}
              >
                <img
                  {...mediaImageSources(item, 'column')}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  alt={item.caption || 'Selected photograph'}
                  className="h-auto w-full"
                  loading="lazy"
                  decoding="async"
                />
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {testimonials.length ? <TestimonialsCarousel items={testimonials} /> : null}

      <section className="street-section relative mx-auto max-w-7xl px-6 py-16 md:py-28">
        <div className="grid gap-10 border-t border-public-fg/10 pt-14 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.25fr)] md:gap-10 md:pt-20">
          <div className="md:pt-10">
            <p className="street-eyebrow">{eyebrows.about}</p>
            {aboutTeaseHeadline ? (
              <h2 className="mt-2 whitespace-pre-line font-display text-5xl leading-none md:text-6xl">
                {aboutTeaseHeadline}
              </h2>
            ) : (
              <h2 className="mt-2 font-display text-5xl leading-none md:text-6xl">
                Less talk.
                <br />
                More visuals.
              </h2>
            )}
            <p className="street-body mt-6 max-w-sm text-sm">
              {aboutTeaseLead}
              {!globals?.about_tease_lead && (globals?.about_body ?? '').trim().length > 220 ? '…' : ''}
            </p>
            <Link
              to="/about"
              className="mt-8 inline-flex border-b border-public-fg/70 pb-1 text-sm tracking-[0.12em] uppercase"
            >
              Read more
            </Link>
          </div>
          <div className="relative min-h-80 overflow-hidden bg-public-fg/5 md:min-h-[32rem]">
            {artist ? (
              <SubjectCover
                record={artist}
                widthKey="half"
                sizes="(min-width: 768px) 45vw, 100vw"
                alt="Portrait of Ibrahim, the photographer"
                loading="lazy"
                decoding="async"
                className="absolute inset-0"
              />
            ) : (
              <div className="flex h-full min-h-80 items-end p-8 md:min-h-[32rem]">
                <p className="font-display text-6xl text-public-fg/15">IL</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export function AboutPage() {
  usePageSeo('about', 'About · Ibrahim Lens')
  const [body, setBody] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [eyebrow, setEyebrow] = useState('About')
  const [displayName, setDisplayName] = useState('Ibrahim Lens')
  const [artist, setArtist] = useState<MediaRecord | null>(null)
  const [wa, setWa] = useState('')

  useEffect(() => {
    getWebsiteGlobals()
      .then((g) => {
        setBody(g.about_body ?? '')
        setSubtitle((g.about_subtitle ?? '').trim())
        setEyebrow(parseEyebrows(g.eyebrows).about)
        setDisplayName((g.site_display_name ?? '').trim() || 'Ibrahim Lens')
        setWa(whatsappHref(g.contact_phone))
      })
      .catch(() => setBody(''))
    getArtistPortrait()
      .then(setArtist)
      .catch(() => setArtist(null))
  }, [])

  return (
    <div className="street-atmosphere-panel relative min-h-[70vh] overflow-hidden">
      <StreetAtmosphere glow="start" />
      <section className="relative z-10 mx-auto grid max-w-7xl gap-10 py-20 px-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)] md:items-start md:gap-8 md:py-28">
        <div className="relative order-2 aspect-[4/5] overflow-hidden bg-public-fg/5 md:order-1 md:sticky md:top-28">
          {artist ? (
            <SubjectCover
              record={artist}
              widthKey="half"
              sizes="(min-width: 768px) 55vw, 100vw"
              alt={`Portrait of ${displayName}`}
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          ) : (
            <div className="flex h-full items-end p-8">
              <p className="font-display text-5xl leading-none text-public-fg/20" aria-hidden="true">IL</p>
            </div>
          )}
        </div>
        <div className="order-1 md:order-2 md:pt-8">
          <PublicBreadcrumbs items={[{ label: 'About' }]} />
          <p className="street-eyebrow">{eyebrow}</p>
          <h1 className="mt-2 font-display text-6xl leading-none sm:text-7xl">{displayName}</h1>
          <p className="street-body mt-4 text-sm">
            {subtitle || 'Portraits / Fashion / Lifestyle / Across Nigeria'}
          </p>
          <div className="street-body mt-8 max-w-md whitespace-pre-wrap text-base leading-relaxed md:text-lg">
            {body ||
              'Booked for portraits and fashion brands. Lifestyle and celebrity frames show the range. Available for shoots across Nigeria.'}
          </div>
          <nav className="mt-10 flex flex-col gap-1 text-sm" aria-label="Continue">
            <Link to="/portfolio" className="tap-link text-public-fg underline-offset-4 hover:underline">
              Browse the portfolio
            </Link>
            <Link to="/work" className="tap-link text-public-fg underline-offset-4 hover:underline">
              See Work
            </Link>
            <Link to="/contact#booking" className="tap-link text-public-fg underline-offset-4 hover:underline">
              Book a session
            </Link>
            {wa ? (
              <a href={wa} target="_blank" rel="noreferrer" className="tap-link text-public-fg underline-offset-4 hover:underline">
                WhatsApp
              </a>
            ) : null}
          </nav>
        </div>
      </section>
    </div>
  )
}

export function ContactPage() {
  usePageSeo('contact', 'Contact · Ibrahim Lens')
  const location = useLocation()
  const [globals, setGlobals] = useState<WebsiteGlobals | null>(null)
  const [faq, setFaq] = useState<FaqItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getWebsiteGlobals()
      .then(setGlobals)
      .catch((e) => setError(publicErrorMessage(e, 'Could not load contact details.')))
    listFaq()
      .then(setFaq)
      .catch(() => setFaq([]))
  }, [])

  useEffect(() => {
    const hash = location.hash.replace('#', '')
    if (hash !== 'booking' && hash !== 'write') return
    const id = window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
    return () => window.clearTimeout(id)
  }, [location.hash, location.pathname, globals])

  const wa = whatsappHref(globals?.contact_phone)
  const contactH1 = (globals?.contact_h1 ?? '').trim() || 'Let’s shoot'
  const contactIntro =
    (globals?.contact_intro ?? '').trim() || 'Request a session — or WhatsApp below.'
  const contactEyebrow = parseEyebrows(globals?.eyebrows).contact
  const alsoEyebrow = parseEyebrows(globals?.eyebrows).also

  return (
    <div className="street-atmosphere-panel relative min-h-[70vh] overflow-hidden">
      <StreetAtmosphere glow="end" />
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-20 md:max-w-4xl md:py-28">
        <PublicBreadcrumbs items={[{ label: 'Contact' }]} />
        <p className="street-eyebrow">{contactEyebrow}</p>
        <h1 className="mt-2 font-display text-6xl leading-none">{contactH1}</h1>
        <p className="street-body mt-4 text-sm">{contactIntro}</p>

        {error ? (
          <Alert variant="error" tone="public" className="mt-6">
            {error}
          </Alert>
        ) : null}

        <div className="mt-10 space-y-10">
          <WriteSection globals={globals} />
          <div className="space-y-4">
            <div className="px-5 sm:px-10 md:px-12">
              <h2 className="font-display text-3xl">Book</h2>
              {bookingHelpText(globals?.booking_help_text) ? (
                <p className="street-body mt-3 text-sm">{bookingHelpText(globals?.booking_help_text)}</p>
              ) : null}
            </div>
            <BookingSection globals={globals} hideHeading />
          </div>
        </div>

        <div className="mt-12 space-y-2 border-t border-white/10 pt-10 text-public-muted">
          <p className="street-eyebrow">{alsoEyebrow}</p>
          {globals?.contact_email ? (
            <p className="mt-4">
              <a href={`mailto:${globals.contact_email}`} className="tap-link text-public-fg underline-offset-4 hover:underline">
                {globals.contact_email}
              </a>
            </p>
          ) : null}
          {globals?.contact_phone ? (
            <p>
              <a href={telHref(globals.contact_phone)} className="tap-link text-public-fg underline-offset-4 hover:underline">
                {formatNgPhoneDisplay(globals.contact_phone) || globals.contact_phone}
              </a>
            </p>
          ) : null}
          {globals?.contact_location ? <p>{globals.contact_location}</p> : null}
          {wa ? (
            <p className="mt-2">
              <a href={wa} target="_blank" rel="noreferrer" className="tap-link text-public-fg underline-offset-4 hover:underline">
                WhatsApp
              </a>
            </p>
          ) : null}
          {!globals ? (
            <p className="mt-4">Loading contact details…</p>
          ) : !globals.contact_email && !globals.contact_phone ? (
            <p className="mt-4">Reach out through Write or Book above.</p>
          ) : null}
        </div>

        {faq.length ? (
          <div className="mt-16 space-y-8 border-t border-public-fg/10 pt-12">
            <h2 className="font-display text-3xl">FAQ</h2>
            {faq.map((item) => (
              <div key={item.id}>
                <h3 className="font-medium text-public-fg">{item.question}</h3>
                <p className="street-body mt-2 text-sm leading-relaxed">
                  {/^see work\.?$/i.test(item.answer.trim()) ? (
                    <Link to="/work" className="text-public-fg underline-offset-4 hover:underline">
                      See Work.
                    </Link>
                  ) : (
                    item.answer
                  )}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  )
}
