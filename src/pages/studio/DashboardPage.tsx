import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, PartialDataNotice } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime, formatNgn } from '@/lib/format'
import {
  DESK_PERIODS,
  loadDashboardPulse,
  readDeskPeriod,
  writeDeskPeriod,
  type DashboardPulse,
  type DeskPeriod,
} from '@/lib/dashboard'
import { useAuth } from '@/lib/auth'
import { initials, profileLabel, profilePhotoUrl } from '@/lib/studio-identity'
import { pbErrorMessage } from '@/lib/pb-error'
import { StudioHubHeader } from '@/components/studio/StudioHubHeader'
import { StudioHubShell, StudioScrollPane } from '@/components/studio/StudioHubShell'
import { cn } from '@/lib/utils'

function DeskGreeting() {
  const { user } = useAuth()
  const photo = profilePhotoUrl(user, '200x200')
  const label = profileLabel(user)

  return (
    <Link
      to="/studio/settings?tab=profile"
      className="flex min-w-0 items-center gap-3 text-left hover:text-studio-fg"
    >
      {photo ? (
        <img src={photo} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
      ) : (
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-studio-panel text-sm font-medium"
          aria-hidden
        >
          {initials(user)}
        </span>
      )}
      <span className="min-w-0 truncate font-display text-2xl leading-tight text-studio-fg">{label}</span>
    </Link>
  )
}

function DashboardSkeleton() {
  return (
    <StudioHubShell>
      <StudioHubHeader title="Dashboard" />
      <StudioScrollPane innerClassName="space-y-8">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
          <Skeleton className="h-8 w-40" />
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-36 w-full" />
      </StudioScrollPane>
    </StudioHubShell>
  )
}

function PeriodControl({
  period,
  onChange,
}: {
  period: DeskPeriod
  onChange: (next: DeskPeriod) => void
}) {
  return (
    <div role="group" aria-label="Period" className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-studio-muted">
      {DESK_PERIODS.map((p) => (
        <button
          key={p.id}
          type="button"
          className={cn(
            'border-b border-transparent pb-0.5 transition-colors',
            period === p.id ? 'border-studio-fg font-medium text-studio-fg' : 'hover:text-studio-fg',
          )}
          aria-pressed={period === p.id}
          onClick={() => onChange(p.id)}
        >
          {p.short}
        </button>
      ))}
    </div>
  )
}

export function StudioDashboardPage() {
  const [period, setPeriod] = useState<DeskPeriod>(readDeskPeriod)
  const [data, setData] = useState<DashboardPulse | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback((p: DeskPeriod, opts?: { soft?: boolean }) => {
    let alive = true
    setError(null)
    if (!opts?.soft) setData(null)
    else setRefreshing(true)
    loadDashboardPulse(p)
      .then((next) => {
        if (alive) {
          setError(null)
          setData(next)
        }
      })
      .catch((e) => {
        if (alive) setError(pbErrorMessage(e, 'Could not load your dashboard.'))
      })
      .finally(() => {
        if (alive) setRefreshing(false)
      })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    return load(period, { soft: true })
  }, [load, period])

  function onPeriod(next: DeskPeriod) {
    if (next === period) return
    writeDeskPeriod(next)
    setPeriod(next)
  }

  if (error && !data) {
    return (
      <StudioHubShell>
        <StudioHubHeader title="Dashboard" />
        <StudioScrollPane innerClassName="space-y-8">
          <DeskGreeting />
          <Alert variant="error" className="mt-2" onRetry={() => load(period)}>
            {error}
          </Alert>
        </StudioScrollPane>
      </StudioHubShell>
    )
  }

  if (!data) {
    return <DashboardSkeleton />
  }

  const quiet = data.period !== 'all' && data.counts.every((c) => c.period === 0)
  const { finance, attention } = data
  const pulseLinks = [
    { label: 'To accept', value: attention.requests, href: '/studio/clients?tab=inbox' },
    { label: 'Messages', value: attention.unreadMessages, href: '/studio/clients?tab=inbox&folder=messages' },
    { label: 'Feedback', value: attention.unreadFeedback, href: '/studio/clients?tab=feedback' },
    { label: 'Links ending', value: attention.expiring, href: '/studio/clients?tab=deliveries' },
    { label: 'Unpaid', value: attention.unpaid, href: '/studio/bookings?view=unpaid' },
  ]

  return (
    <StudioHubShell>
      <StudioHubHeader
        title="Dashboard"
        actions={<PeriodControl period={period} onChange={onPeriod} />}
      />
      <StudioScrollPane
        innerClassName={cn('space-y-8 transition-opacity duration-200', refreshing && 'opacity-70')}
      >
        <DeskGreeting />
        <PartialDataNotice missing={data.failed} onRetry={() => load(period, { soft: true })} />
        {error ? (
          <Alert variant="error" onRetry={() => load(period, { soft: true })}>
            {error}
          </Alert>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)] lg:items-stretch">
          <section
            aria-labelledby="desk-earnings"
            className="border border-studio-border bg-studio-panel px-5 py-6 sm:px-7 sm:py-7"
          >
            <h2 id="desk-earnings" className="sr-only">
              Earnings
            </h2>
            <p className="font-display text-4xl tracking-tight text-studio-fg sm:text-5xl">
              {formatNgn(finance.totalEarned)}
            </p>
            <p className="mt-1 text-sm text-studio-muted">Total earned</p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-studio-muted">{data.periodLabel}</p>
                <dl className="mt-3 space-y-2.5 text-sm">
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-studio-muted">Collected</dt>
                    <dd className="font-medium text-studio-fg">{formatNgn(finance.collectedPeriod)}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-studio-muted">Booked</dt>
                    <dd className="font-medium text-studio-fg">{formatNgn(finance.bookedPeriod)}</dd>
                  </div>
                </dl>
              </div>
              <div className="sm:border-l sm:border-studio-border sm:pl-6">
                <p className="text-xs uppercase tracking-[0.14em] text-studio-muted">Now</p>
                <Link
                  to="/studio/bookings?view=unpaid"
                  className="mt-3 flex items-baseline justify-between gap-4 text-sm hover:text-studio-fg"
                >
                  <span className="text-studio-muted">Outstanding</span>
                  <span className="font-medium text-studio-fg">{formatNgn(finance.outstanding)}</span>
                </Link>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="desk-pulse"
            className="flex flex-col border border-studio-border bg-studio-panel px-5 py-6 sm:px-6"
          >
            <h2 id="desk-pulse" className="text-xs uppercase tracking-[0.14em] text-studio-muted">
              Pulse
            </h2>
            <ul className="mt-4 flex flex-1 flex-col justify-between gap-1">
              {pulseLinks.map((row) => (
                <li key={row.label}>
                  <Link
                    to={row.href}
                    className="flex items-baseline justify-between gap-3 py-1.5 text-sm hover:text-studio-fg"
                  >
                    <span className="text-studio-muted">{row.label}</span>
                    <span className="font-display text-2xl leading-none text-studio-fg">{row.value}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section
          aria-labelledby="desk-today"
          className="border border-studio-border bg-studio-panel px-5 py-6 sm:px-7 sm:py-7"
        >
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 id="desk-today" className="font-display text-xl text-studio-fg">
              Coming up
            </h2>
            <Link to="/studio/bookings?view=upcoming" className="text-xs text-studio-muted hover:text-studio-fg">
              Next 7 days
            </Link>
          </div>
          {data.today.length ? (
            <ul className="space-y-1">
              {data.today.map((shoot) => (
                <li key={shoot.id}>
                  <Link
                    to={shoot.href}
                    className="flex items-baseline justify-between gap-3 py-2 text-sm hover:text-studio-fg"
                  >
                    <span className="min-w-0 truncate">
                      <span className="font-medium text-studio-fg">{shoot.name}</span>
                      <span className="text-studio-muted"> · {shoot.status}</span>
                      {shoot.isToday ? (
                        <span className="ml-2 text-xs uppercase tracking-[0.12em] text-studio-accent">Today</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-studio-muted">{formatDateTime(shoot.when)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-studio-muted">Nothing on the book in the next 7 days.</p>
          )}
        </section>

        <section aria-labelledby="desk-studio">
          <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-studio-border pb-3">
            <h2 id="desk-studio" className="font-display text-xl text-studio-fg">
              Studio
            </h2>
            {data.period !== 'all' ? (
              <p className="text-xs text-studio-muted">+ in {data.periodLabel.toLowerCase()}</p>
            ) : null}
          </div>
          <ul className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3 xl:grid-cols-6">
            {data.counts.map((c) => (
              <li key={c.id}>
                <Link to={c.href} className="group block">
                  <p className="text-sm text-studio-muted group-hover:text-studio-fg">{c.label}</p>
                  <p className="mt-1 font-display text-3xl leading-none text-studio-fg">{c.lifetime}</p>
                  {data.period !== 'all' ? (
                    <p className="mt-1 text-sm text-studio-muted">+{c.period}</p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
          {quiet ? (
            <p className="mt-6 text-sm text-studio-muted">Nothing new in this stretch.</p>
          ) : null}
        </section>
      </StudioScrollPane>
    </StudioHubShell>
  )
}
