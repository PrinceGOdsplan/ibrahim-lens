import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { applyDocumentFavicon, brandFaviconUrl, brandLogoUrl, getBrandSettings } from '@/lib/library'
import { whatsappHref } from '@/lib/phone'
import { getWebsiteGlobals, type WebsiteGlobals } from '@/lib/website'
import { StreetAtmosphere } from '@/components/public/StreetAtmosphere'
import { Dialog } from '@/components/ui/dialog'
import { SurfaceProvider } from '@/components/ui/surface'

const navItems = [
  { to: '/about', label: 'About' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/work', label: 'Work' },
  { to: '/contact', label: 'Contact' },
]

function instagramHref(raw?: string) {
  const v = (raw ?? '').trim()
  if (!v) return ''
  if (/^https?:\/\//i.test(v)) return v
  const handle = v.replace(/^@/, '')
  return handle ? `https://instagram.com/${handle}` : ''
}

export function PublicLayout() {
  const location = useLocation()
  const [logoUrl, setLogoUrl] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [globals, setGlobals] = useState<WebsiteGlobals | null>(null)
  const [heroSolid, setHeroSolid] = useState(false)
  const filmHero = location.pathname === '/'
  const headerRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  useEffect(() => {
    getBrandSettings()
      .then((brand) => {
        setLogoUrl(brandLogoUrl(brand))
        applyDocumentFavicon(brandFaviconUrl(brand))
      })
      .catch(() => {
        setLogoUrl('')
        applyDocumentFavicon('')
      })
    getWebsiteGlobals()
      .then(setGlobals)
      .catch(() => setGlobals(null))
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!filmHero) {
      setHeroSolid(false)
      return
    }
    const onScroll = () => {
      setHeroSolid(window.scrollY > window.innerHeight * 0.72)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [filmHero])

  // The header is fixed, so content below needs an offset equal to whatever it
  // actually occupies — which varies with the top safe-area inset. A hardcoded
  // value under-compensates on notched devices and clips the first heading.
  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const sync = () => {
      document.documentElement.style.setProperty('--public-header-h', `${el.offsetHeight}px`)
    }
    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const ig = instagramHref(globals?.social_instagram)
  const phone = (globals?.contact_phone ?? '').trim()
  const phoneHref = phone ? `tel:${phone.replace(/\s+/g, '')}` : ''
  const wa = whatsappHref(phone)

  const onFilm = filmHero && !heroSolid
  const headerInk = onFilm ? 'text-white' : 'text-public-fg'
  const headerMuted = onFilm ? 'text-white/70' : 'text-public-muted'
  const barClass = onFilm
    ? 'fixed inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent'
    : 'fixed inset-x-0 top-0 border-b border-white/10 bg-public-bg/92 backdrop-blur-sm'

  return (
    <SurfaceProvider surface="public">
    <div className="public-shell relative min-h-screen bg-public-bg text-public-fg">
      <div className="street-grain" aria-hidden />
      <a
        href="#main"
        className="sr-only z-50 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded focus:bg-public-fg focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-public-bg"
      >
        Skip to content
      </a>
      <header
        ref={headerRef}
        className={['z-40 w-full pt-[env(safe-area-inset-top)] transition-colors duration-300', barClass].join(' ')}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5">
          <NavLink to="/" className={`flex items-center gap-3 font-display text-3xl leading-none tracking-[0.06em] ${headerInk}`}>
            {logoUrl ? <img src={logoUrl} alt="" className="h-8 w-auto object-contain" /> : null}
            <span>Ibrahim Lens</span>
          </NavLink>

          <div className="hidden items-center gap-6 md:flex">
            <nav aria-label="Primary" className={`flex items-center gap-5 text-xs tracking-[0.1em] uppercase ${headerMuted}`}>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      'border-b pb-0.5 transition-colors',
                      isActive
                        ? `${headerInk} border-current`
                        : 'border-transparent hover:text-public-fg',
                      onFilm && !isActive ? 'hover:text-white' : '',
                    ].join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <Link
                to="/contact#booking"
                className="border-b border-transparent pb-0.5 font-bold text-public-accent hover:opacity-80"
              >
                Book
              </Link>
            </nav>
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            className={`inline-flex h-11 w-11 items-center justify-center md:hidden ${headerInk}`}
            aria-expanded={menuOpen}
            aria-controls="public-mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="sr-only">{menuOpen ? 'Close' : 'Menu'}</span>
            <span aria-hidden className="flex w-5 flex-col gap-1.5">
              <span
                className={[
                  'h-px w-full transition',
                  onFilm ? 'bg-white' : 'bg-public-fg',
                  menuOpen ? 'translate-y-[3.5px] rotate-45' : '',
                ].join(' ')}
              />
              <span
                className={[
                  'h-px w-full transition',
                  onFilm ? 'bg-white' : 'bg-public-fg',
                  menuOpen ? 'opacity-0' : '',
                ].join(' ')}
              />
              <span
                className={[
                  'h-px w-full transition',
                  onFilm ? 'bg-white' : 'bg-public-fg',
                  menuOpen ? '-translate-y-[3.5px] -rotate-45' : '',
                ].join(' ')}
              />
            </span>
          </button>
        </div>
      </header>

      <Dialog
        open={menuOpen}
        onClose={closeMenu}
        label="Site menu"
        className="z-50 flex flex-col bg-public-raised px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] md:hidden"
      >
        <div id="public-mobile-menu" className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center justify-between">
            <p className="font-display text-2xl text-public-fg">Ibrahim Lens</p>
            <button type="button" className="text-sm text-public-muted" onClick={closeMenu}>
              Close
            </button>
          </div>
          <nav className="mt-12 flex flex-col gap-6 font-display text-3xl" aria-label="Mobile primary">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive
                    ? 'w-fit border-b border-public-fg/40 pb-1 text-public-fg'
                    : 'text-public-fg/80 hover:text-public-fg'
                }
                onClick={closeMenu}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto space-y-3 border-t border-white/10 pt-8 text-sm text-public-muted">
            <Link to="/contact#booking" className="block text-public-fg" onClick={closeMenu}>
              Book a session
            </Link>
            {ig || wa ? (
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {ig ? (
                  <a href={ig} target="_blank" rel="noreferrer" className="hover:text-public-fg">
                    Instagram
                  </a>
                ) : null}
                {wa ? (
                  <a href={wa} target="_blank" rel="noreferrer" className="tap-link hover:text-public-fg">
                    WhatsApp
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </Dialog>

      <main
        id="main"
        tabIndex={-1}
        className="relative z-10"
        style={filmHero ? undefined : { paddingTop: 'var(--public-header-h, 4.75rem)' }}
      >
        <Outlet />
      </main>

      <footer className="street-atmosphere-panel street-footer relative z-10 mt-20 overflow-hidden border-t border-white/10 md:mt-28">
        <StreetAtmosphere glow="start" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:py-20">
          <div className="grid gap-14 md:grid-cols-[1.5fr_0.85fr_1.1fr] md:gap-8">
            <div className="max-w-sm">
              <p className="font-display text-5xl leading-[1.05] md:text-6xl">
                {(globals?.site_display_name ?? '').trim() || 'Ibrahim Lens'}
              </p>
              <p className="street-body mt-5 text-sm leading-relaxed">
                {(globals?.footer_blurb ?? '').trim() ||
                  'Portraits, fashion, and lifestyle — shooting across Nigeria.'}
              </p>
            </div>

            <div className="md:mt-8">
              <p className="street-eyebrow">Explore</p>
              <nav className="mt-4 flex flex-col text-sm" aria-label="Footer">
                <NavLink to="/" end className="tap-link hover:text-public-fg">
                  Home
                </NavLink>
                {navItems.map((item) => (
                  <NavLink key={item.to} to={item.to} className="tap-link hover:text-public-fg">
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="md:mt-3 md:text-right">
              <p className="street-eyebrow">Reach</p>
              <div className="mt-4 flex flex-col md:items-end">
                <NavLink to="/contact#write" className="tap-link hover:text-public-fg">
                  Write
                </NavLink>
                <NavLink to="/contact#booking" className="tap-link hover:text-public-fg">
                  Book a session
                </NavLink>
                {wa ? (
                  <a href={wa} target="_blank" rel="noreferrer" className="tap-link hover:text-public-fg">
                    WhatsApp
                  </a>
                ) : phoneHref ? (
                  <a href={phoneHref} className="tap-link hover:text-public-fg">
                    {phone}
                  </a>
                ) : null}
                {ig ? (
                  <a href={ig} target="_blank" rel="noreferrer" className="tap-link hover:text-public-fg">
                    @{String(globals?.social_instagram ?? 'ibra.himlens').replace(/^@/, '')}
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-public-muted">
            <p>© {new Date().getFullYear()} Ibrahim Lens</p>
            <div className="flex gap-5">
              <NavLink to="/privacy" className="tap-link hover:text-public-fg">
                Privacy
              </NavLink>
              <NavLink to="/terms" className="tap-link hover:text-public-fg">
                Terms
              </NavLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </SurfaceProvider>
  )
}
