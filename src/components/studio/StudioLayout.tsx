import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Bell,
  CalendarDays,
  Globe,
  Images,
  LayoutDashboard,
  Moon,
  PanelLeft,
  PanelLeftClose,
  Settings,
  Sun,
  Users,
} from 'lucide-react'
import { SurfaceProvider } from '@/components/ui/surface'
import { AssistantChat } from '@/components/studio/AssistantDrawer'
import { StudioIcon } from '@/components/studio/StudioIconButton'
import { STUDIO_PRODUCT_NAME } from '@/lib/studio-brand'
import { useAuth } from '@/lib/auth'
import { startStudioHeartbeat } from '@/lib/notifications'
import { useStudioNotices } from '@/lib/studio-notices'
import { isStudioStandalone } from '@/lib/notice-channels'
import { initials, profileLabel, profilePhotoUrl } from '@/lib/studio-identity'
import { useStudioAppearance } from '@/lib/studio-appearance'
import {
  setStudioAppBadge,
  studioInstallCopy,
  studioLightVibrate,
  useStudioPwaSurface,
} from '@/lib/studio-pwa'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

const NAV_KEY = 'studio-nav-collapsed'

const hubs: { to: string; label: string; short: string; end?: boolean; icon: LucideIcon }[] = [
  { to: '/studio', label: 'Dashboard', short: 'Home', end: true, icon: LayoutDashboard },
  { to: '/studio/gallery', label: 'Gallery', short: 'Gallery', icon: Images },
  { to: '/studio/website', label: 'Website', short: 'Site', icon: Globe },
  { to: '/studio/bookings', label: 'Bookings', short: 'Book', icon: CalendarDays },
  { to: '/studio/clients', label: 'Clients', short: 'Clients', icon: Users },
  { to: '/studio/settings', label: 'Settings', short: 'Settings', icon: Settings },
]

function currentHubLabel(pathname: string) {
  const match = hubs
    .filter((hub) => (hub.end ? pathname === hub.to : pathname.startsWith(hub.to)))
    .sort((a, b) => b.to.length - a.to.length)[0]
  return match?.label ?? 'Studio'
}

function readCollapsed() {
  try {
    return localStorage.getItem(NAV_KEY) === '1'
  } catch {
    return false
  }
}

export function StudioLayout() {
  const { user, logout } = useAuth()
  const headerPhoto = profilePhotoUrl(user, '100x100')
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const [menu, setMenu] = useState<null | 'notices' | 'profile'>(null)
  const [installEvent, setInstallEvent] = useState<{ prompt: () => Promise<unknown> } | null>(null)
  const railRef = useRef<HTMLElement>(null)
  const phoneRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const prevPath = useRef(location.pathname)
  const prevNoticeCount = useRef(0)
  const { items, dismiss, dismissAll } = useStudioNotices()
  const hubLabel = currentHubLabel(location.pathname)
  const { appearance, toggleAppearance } = useStudioAppearance()

  useStudioPwaSurface(appearance)

  useEffect(() => {
    setMenu(null)
    if (prevPath.current !== location.pathname) {
      const left = hubs.some((h) =>
        h.end ? prevPath.current === h.to : prevPath.current.startsWith(h.to),
      )
      const entered = hubs.some((h) =>
        h.end ? location.pathname === h.to : location.pathname.startsWith(h.to),
      )
      if (left && entered) studioLightVibrate(10)
      prevPath.current = location.pathname
    }
  }, [location.pathname])

  useEffect(() => {
    document.title = `${hubLabel} · ${STUDIO_PRODUCT_NAME}`
  }, [hubLabel])

  useEffect(() => {
    return startStudioHeartbeat()
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('studio-lock-scroll')
    return () => root.classList.remove('studio-lock-scroll')
  }, [])

  useEffect(() => {
    void setStudioAppBadge(items.length)
    if (items.length > prevNoticeCount.current) studioLightVibrate([12, 40, 12])
    prevNoticeCount.current = items.length
  }, [items.length])

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault()
      const e = event as Event & { prompt: () => Promise<unknown> }
      setInstallEvent(e)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  useEffect(() => {
    if (!menu) return
    function onPointer(event: MouseEvent) {
      const target = event.target as Node
      if (railRef.current?.contains(target)) return
      if (phoneRef.current?.contains(target)) return
      if (menuRef.current?.contains(target)) return
      setMenu(null)
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [menu])

  function toggleCollapsed() {
    setCollapsed((open) => {
      const next = !open
      try {
        localStorage.setItem(NAV_KEY, next ? '1' : '0')
      } catch {
        /* ignore */
      }
      return next
    })
  }

  useEffect(() => {
    const onShell = (event: Event) => {
      const detail = (event as CustomEvent<{ sidebar?: string }>).detail
      const want = String(detail?.sidebar || '').toLowerCase()
      if (want !== 'collapse' && want !== 'expand' && want !== 'toggle') return
      setCollapsed((current) => {
        const next = want === 'collapse' ? true : want === 'expand' ? false : !current
        try {
          localStorage.setItem(NAV_KEY, next ? '1' : '0')
        } catch {
          /* ignore */
        }
        return next
      })
    }
    window.addEventListener('studio-shell', onShell as EventListener)
    return () => window.removeEventListener('studio-shell', onShell as EventListener)
  }, [])

  function HubNav({ iconsOnly }: { iconsOnly?: boolean }) {
    return (
      <nav aria-label="Studio hubs" className={cn('flex flex-1 flex-col gap-1 p-2', iconsOnly && 'items-center')}>
        {hubs.map((hub) => (
          <NavLink
            key={hub.to}
            to={hub.to}
            end={hub.end}
            title={hub.label}
            className={({ isActive }) =>
              cn(
                'inline-flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                iconsOnly && 'w-11 justify-center px-0',
                isActive
                  ? 'bg-studio-bg font-medium text-studio-fg'
                  : 'text-studio-muted hover:bg-studio-bg hover:text-studio-fg',
              )
            }
          >
            <StudioIcon icon={hub.icon} />
            <span className={cn(iconsOnly && 'sr-only')}>{hub.label}</span>
          </NavLink>
        ))}
      </nav>
    )
  }

  function OperatorMenu({ iconsOnly }: { iconsOnly?: boolean }) {
    const shared = iconsOnly ? 'w-11 justify-center px-0' : 'justify-start px-3'
    return (
      <div className={cn('flex flex-col gap-1 p-2 pt-0', iconsOnly && 'items-center')}>
        <button
          type="button"
          className={cn(
            'inline-flex min-h-11 items-center gap-2 rounded-md text-sm text-studio-muted transition-colors hover:bg-studio-bg hover:text-studio-fg',
            shared,
          )}
          aria-label={appearance === 'light' ? 'Switch to night' : 'Switch to light'}
          onClick={toggleAppearance}
        >
          <StudioIcon icon={appearance === 'light' ? Moon : Sun} />
          <span className={cn(iconsOnly && 'sr-only')}>
            {appearance === 'light' ? 'Night' : 'Light'}
          </span>
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenu((current) => (current === 'notices' ? null : 'notices'))}
            aria-expanded={menu === 'notices'}
            className={cn(
              'relative inline-flex min-h-11 w-full items-center gap-2 rounded-md text-sm text-studio-muted transition-colors hover:bg-studio-bg hover:text-studio-fg',
              shared,
            )}
            aria-label={items.length ? `${items.length} notifications` : 'Notifications'}
          >
            <StudioIcon icon={Bell} />
            {items.length > 0 ? (
              <span
                className={cn(
                  'absolute rounded-full bg-studio-fg px-1 text-[10px] leading-4 text-studio-bg',
                  iconsOnly ? 'right-1 top-1' : 'right-3 top-1.5',
                )}
              >
                {items.length > 9 ? '9+' : items.length}
              </span>
            ) : null}
            <span className={cn(iconsOnly && 'sr-only')}>Notifications</span>
          </button>
          {menu === 'notices' ? <NoticesMenu /> : null}
        </div>
        <div className="relative">
          <button
            type="button"
            className={cn(
              'inline-flex min-h-11 w-full items-center gap-2 rounded-md text-sm text-studio-fg transition-colors hover:bg-studio-bg',
              shared,
            )}
            aria-expanded={menu === 'profile'}
            aria-label="Profile"
            onClick={() => setMenu((current) => (current === 'profile' ? null : 'profile'))}
          >
            {headerPhoto ? (
              <img src={headerPhoto} alt="" className="h-7 w-7 rounded-full object-cover" />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-studio-bg text-xs font-medium">
                {initials(user)}
              </span>
            )}
            <span className={cn('min-w-0 truncate', iconsOnly && 'sr-only')}>{profileLabel(user)}</span>
          </button>
          {menu === 'profile' ? <ProfileMenu /> : null}
        </div>
      </div>
    )
  }

  function ProfileMenu({ compact }: { compact?: boolean }) {
    return (
      <div
        ref={menu === 'profile' ? menuRef : undefined}
        className={cn(
          'z-50 border border-studio-border bg-studio-panel py-1 shadow-sm',
          compact
            ? 'absolute right-0 top-full mt-1 w-56'
            : 'absolute bottom-0 left-full ml-1 w-56',
        )}
      >
        <p className="truncate px-3 py-2 text-sm">{profileLabel(user)}</p>
        <Link
          to="/studio/settings?tab=profile"
          className="block px-3 py-2 text-sm text-studio-muted hover:bg-studio-bg hover:text-studio-fg"
          onClick={() => setMenu(null)}
        >
          Profile
        </Link>
        <Link
          to="/studio/settings?tab=account"
          className="block px-3 py-2 text-sm text-studio-muted hover:bg-studio-bg hover:text-studio-fg"
          onClick={() => setMenu(null)}
        >
          Account
        </Link>
        <InstallMenuItem event={installEvent} />
        <button
          type="button"
          className="block w-full px-3 py-2 text-left text-sm text-studio-muted hover:bg-studio-bg hover:text-studio-fg"
          onClick={logout}
        >
          Log out
        </button>
      </div>
    )
  }

  function NoticesMenu({ compact }: { compact?: boolean }) {
    return (
      <div
        ref={menu === 'notices' ? menuRef : undefined}
        className={cn(
          'z-50 border border-studio-border bg-studio-panel p-3 shadow-sm',
          compact
            ? 'absolute right-0 top-full mt-1 w-[min(20rem,calc(100vw-1.5rem))]'
            : 'absolute bottom-0 left-full ml-1 w-[min(20rem,calc(100vw-1.5rem))]',
        )}
      >
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium">Notifications</p>
          <button type="button" className="text-xs text-studio-muted" onClick={dismissAll}>
            Clear
          </button>
        </div>
        {items.length === 0 ? (
          <p className="text-sm text-studio-muted">Nothing new.</p>
        ) : (
          <ul className="max-h-72 space-y-1 overflow-y-auto">
            {items.map((n) => (
              <li key={n.id}>
                <NavLink
                  to={n.href}
                  className="block rounded-md px-2 py-2 text-sm hover:bg-studio-bg"
                  onClick={() => {
                    dismiss(n.id)
                    setMenu(null)
                  }}
                >
                  <span className="block font-medium">{n.title}</span>
                  {n.when ? (
                    <span className="mt-0.5 block text-xs text-studio-muted">{n.when}</span>
                  ) : null}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  return (
    <SurfaceProvider surface="studio">
      <div
        className="studio-shell flex h-dvh min-h-0 flex-col overflow-hidden overscroll-none bg-studio-bg text-studio-fg [touch-action:manipulation]"
        data-studio-appearance={appearance}
      >
        {/* Phone operator strip: only on small viewports, does not name the hub. */}
        <header
          ref={phoneRef}
          className="relative z-30 flex shrink-0 items-center justify-end gap-1 border-b border-studio-border bg-studio-panel px-3 py-1.5 pt-[max(0.375rem,env(safe-area-inset-top))] md:hidden"
        >
          <button
            type="button"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-studio-muted hover:bg-studio-bg hover:text-studio-fg"
            aria-label={appearance === 'light' ? 'Switch to night' : 'Switch to light'}
            onClick={toggleAppearance}
          >
            <StudioIcon icon={appearance === 'light' ? Moon : Sun} />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenu((current) => (current === 'notices' ? null : 'notices'))}
              aria-expanded={menu === 'notices'}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-md text-studio-muted hover:bg-studio-bg hover:text-studio-fg"
              aria-label={items.length ? `${items.length} notifications` : 'Notifications'}
            >
              <StudioIcon icon={Bell} />
              {items.length ? (
                <span className="absolute right-1 top-1 min-w-4 rounded-full bg-studio-fg px-1 text-[10px] leading-4 text-studio-bg">
                  {items.length > 9 ? '9+' : items.length}
                </span>
              ) : null}
            </button>
            {menu === 'notices' ? <NoticesMenu compact /> : null}
          </div>
          <div className="relative">
            <button
              type="button"
              className="inline-flex h-11 min-w-11 items-center justify-center rounded-md px-2 text-sm text-studio-fg hover:bg-studio-bg"
              aria-expanded={menu === 'profile'}
              aria-label="Profile"
              onClick={() => setMenu((current) => (current === 'profile' ? null : 'profile'))}
            >
              {headerPhoto ? (
                <img src={headerPhoto} alt="" className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-studio-bg text-xs font-medium">
                  {initials(user)}
                </span>
              )}
            </button>
            {menu === 'profile' ? <ProfileMenu compact /> : null}
          </div>
        </header>

        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          {/* Desktop rail: hubs on top, operator controls at foot. */}
          <aside
            ref={railRef}
            className={cn(
              'relative hidden h-full min-h-0 shrink-0 flex-col overscroll-none border-r border-studio-border bg-studio-panel md:flex',
              collapsed ? 'w-14' : 'w-56',
              menu ? 'z-40 overflow-visible' : 'overflow-hidden',
            )}
          >
            <div className={cn('flex items-center p-2', collapsed && 'justify-center')}>
              <p
                className={cn(
                  'truncate text-sm font-semibold tracking-tight text-studio-fg',
                  collapsed && 'sr-only',
                )}
              >
                {STUDIO_PRODUCT_NAME}
              </p>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <HubNav iconsOnly={collapsed} />
            </div>
            <OperatorMenu iconsOnly={collapsed} />
            <div
              className={cn(
                'shrink-0 border-t border-studio-border p-2',
                collapsed && 'flex justify-center',
              )}
            >
              <button
                type="button"
                className={cn(
                  'inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm text-studio-muted hover:bg-studio-bg hover:text-studio-fg',
                  collapsed && 'w-11 justify-center px-0',
                )}
                aria-pressed={collapsed}
                aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
                onClick={toggleCollapsed}
              >
                <StudioIcon icon={collapsed ? PanelLeft : PanelLeftClose} />
                <span className={cn(collapsed && 'sr-only')}>{collapsed ? 'Expand' : 'Collapse'}</span>
              </button>
            </div>
          </aside>

          <main className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
            <div className="absolute inset-0 flex min-h-0 flex-col overflow-hidden">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Phone bottom hub bar. */}
        <nav
          aria-label="Studio hubs"
          className="flex shrink-0 border-t border-studio-border bg-studio-panel pb-[env(safe-area-inset-bottom)] md:hidden"
        >
          {hubs.map((hub) => (
            <NavLink
              key={hub.to}
              to={hub.to}
              end={hub.end}
              title={hub.label}
              className={({ isActive }) =>
                cn(
                  'flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 py-1 text-[10px] leading-tight',
                  isActive ? 'font-medium text-studio-fg' : 'text-studio-muted',
                )
              }
            >
              <StudioIcon icon={hub.icon} className="h-5 w-5" />
              <span className="max-w-full truncate">{hub.short}</span>
            </NavLink>
          ))}
        </nav>
        <AssistantChat />
      </div>
    </SurfaceProvider>
  )
}

function InstallMenuItem({ event }: { event: { prompt: () => Promise<unknown> } | null }) {
  if (isStudioStandalone()) return null
  if (event) {
    return (
      <button
        type="button"
        className="block w-full px-3 py-2 text-left text-sm text-studio-muted hover:bg-studio-bg hover:text-studio-fg"
        onClick={() => void event.prompt()}
      >
        Add to Home Screen
      </button>
    )
  }
  return <p className="px-3 py-2 text-xs text-studio-muted">{studioInstallCopy()}</p>
}
