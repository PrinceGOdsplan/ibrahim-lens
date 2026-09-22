import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, PartialDataNotice } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNgn } from '@/lib/format'
import {
  DESK_PERIODS,
  loadDashboardPulse,
  readDeskPeriod,
  writeDeskPeriod,
  type DashboardPulse,
  type DeskFunnel,
  type DeskMicro,
  type DeskMix,
  type DeskMoneyPoint,
  type DeskNeedsYou,
  type DeskPeriod,
  type DeskShootDay,
} from '@/lib/dashboard'
import { loadSiteAnalytics, type SiteAnalytics } from '@/lib/site-analytics'
import { pbErrorMessage } from '@/lib/pb-error'
import { StudioHubHeader } from '@/components/studio/StudioHubHeader'
import { StudioHubShell, StudioScrollPane } from '@/components/studio/StudioHubShell'
import { STUDIO_SHORT_NAME } from '@/lib/studio-brand'
import { cn } from '@/lib/utils'
import { useStudioRecordRefresh } from '@/lib/studio-record-sync'

function DashboardSkeleton() {
  return (
    <StudioHubShell>
      <StudioHubHeader title="Dashboard" mobileTitle={STUDIO_SHORT_NAME} />
      <StudioScrollPane innerClassName="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
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

function LineChart({
  series,
  max,
  label,
  formatValue = (n: number) => String(n),
}: {
  series: DeskMoneyPoint[]
  max: number
  label: string
  formatValue?: (n: number) => string
}) {
  const [active, setActive] = useState<number | null>(null)
  const width = 800
  const height = 160
  const padX = 16
  const padTop = 28
  const padBottom = 28
  const innerW = width - padX * 2
  const innerH = height - padTop - padBottom
  const yMax = Math.max(max, 1)
  const stepX = series.length > 1 ? innerW / (series.length - 1) : innerW

  const x = useCallback((i: number) => padX + stepX * i, [stepX])
  const y = useCallback((v: number) => padTop + innerH - (v / yMax) * innerH, [innerH, yMax])

  const d = useMemo(() => {
    if (!series.length) return ''
    return series.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.value)}`).join(' ')
  }, [series, x, y])

  const areaD = useMemo(() => {
    if (!series.length) return ''
    const baseline = padTop + innerH
    const first = `M ${x(0)} ${baseline}`
    const path = series.map((p, i) => `L ${x(i)} ${y(p.value)}`).join(' ')
    const last = `L ${x(series.length - 1)} ${baseline} Z`
    return `${first} ${path} ${last}`
  }, [series, x, y, innerH])

  if (!series.length) return null

  const tip = active != null ? series[active] : null
  const gradId = `area-${label.replace(/\s+/g, '-')}`

  return (
    <div className="relative">
      <div className="mb-1 flex min-h-5 items-baseline justify-between gap-2 text-xs text-studio-muted">
        <span className="tabular-nums text-studio-fg">
          {tip ? `${tip.label}: ${formatValue(tip.value)}` : `Peak ${formatValue(yMax)}`}
        </span>
        {series.length > 1 ? (
          <span>
            {series[0]?.label} – {series[series.length - 1]?.label}
          </span>
        ) : null}
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full max-h-36"
        role="img"
        aria-label={label}
        onMouseLeave={() => setActive(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.14" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#${gradId})`} className="text-studio-fg" />
        <path
          d={d}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-studio-fg"
        />
        {series.map((p, i) => (
          <g key={p.iso ?? i}>
            <circle
              cx={x(i)}
              cy={y(p.value)}
              r={active === i ? 5 : 3.5}
              className="fill-studio-bg stroke-studio-fg"
              strokeWidth="2"
            />
            {/* Wide hit target for hover / focus */}
            <circle
              cx={x(i)}
              cy={y(p.value)}
              r="14"
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              tabIndex={0}
              role="img"
              aria-label={`${p.label}: ${formatValue(p.value)}`}
            />
          </g>
        ))}
      </svg>
    </div>
  )
}

function MixChart({ mix }: { mix: DeskMix }) {
  const parts = [
    { key: 'pending', label: 'Pending', value: mix.pending },
    { key: 'confirmed', label: 'Confirmed', value: mix.confirmed },
    { key: 'unpaid', label: 'Unpaid', value: mix.unpaid },
  ]
  const total = Math.max(parts.reduce((s, p) => s + p.value, 0), 1)

  return (
    <div className="space-y-3">
      <div className="flex h-3 overflow-hidden rounded-full bg-studio-bg">
        {parts.map((p) =>
          p.value > 0 ? (
            <div
              key={p.key}
              title={`${p.label}: ${p.value}`}
              className={cn(
                'h-full',
                p.key === 'pending' && 'bg-studio-muted/50',
                p.key === 'confirmed' && 'bg-studio-fg',
                p.key === 'unpaid' && 'bg-studio-accent',
              )}
              style={{ width: `${(p.value / total) * 100}%` }}
            />
          ) : null,
        )}
      </div>
      <ul className="grid grid-cols-3 gap-2 text-sm">
        {parts.map((p) => (
          <li key={p.key}>
            <p className="text-xs text-studio-muted">{p.label}</p>
            <p className="font-sans font-medium tabular-nums text-studio-fg">{p.value}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FunnelChart({ funnel }: { funnel: DeskFunnel }) {
  const steps = [
    { label: 'Requests', value: funnel.requests },
    { label: 'Booked', value: funnel.accepted },
    { label: 'Paid', value: funnel.paid },
    { label: 'Delivered', value: funnel.delivered },
    { label: 'Feedback', value: funnel.feedback },
  ]
  const max = Math.max(...steps.map((s) => s.value), 1)

  return (
    <ul className="space-y-2">
      {steps.map((s) => (
        <li key={s.label} className="flex items-center gap-2 text-xs">
          <span className="w-16 shrink-0 text-studio-muted">{s.label}</span>
          <div className="h-1.5 min-w-0 flex-1 rounded-full bg-studio-bg">
            <div
              className="h-full rounded-full bg-studio-fg/80"
              style={{ width: `${(s.value / max) * 100}%` }}
            />
          </div>
          <span className="w-6 shrink-0 text-right font-sans tabular-nums text-studio-fg">{s.value}</span>
        </li>
      ))}
    </ul>
  )
}

function MicroStats({ micro }: { micro: DeskMicro }) {
  const items = [
    {
      label: 'Collection rate',
      value: micro.collectionPct == null ? '—' : `${micro.collectionPct}%`,
    },
    { label: 'Booked', value: formatNgn(micro.booked) },
    { label: 'Amount due', value: formatNgn(micro.outstanding), href: '/studio/bookings?view=unpaid' },
    { label: 'Avg fee', value: micro.avgFee == null ? '—' : formatNgn(micro.avgFee) },
  ]
  return (
    <dl className="grid grid-cols-2 gap-x-3 gap-y-3">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-xs text-studio-muted">{item.label}</dt>
          <dd className="mt-0.5 font-sans text-sm font-medium tabular-nums text-studio-fg">
            {item.href ? (
              <Link to={item.href} className="hover:text-studio-accent">
                {item.value}
              </Link>
            ) : (
              item.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function DeltaBadge({ delta }: { delta: DashboardPulse['collectedDelta'] }) {
  if (!delta) return null
  if (delta.pct == null) {
    return <p className="text-xs text-studio-muted">No prior period</p>
  }
  const up = delta.pct >= 0
  return (
    <p className={cn('text-xs font-medium tabular-nums', up ? 'text-studio-accent' : 'text-studio-danger')}>
      {up ? '▲' : '▼'} {Math.abs(delta.pct)}% vs prior
    </p>
  )
}

function TodayStrip({
  today,
  attention,
  outstanding,
}: {
  today: DashboardPulse['today']
  attention: DashboardPulse['attention']
  outstanding: number
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-studio-border bg-studio-panel px-4 py-3">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.14em] text-studio-muted">Today</p>
        {today ? (
          <Link to={today.href} className="mt-0.5 block truncate text-sm font-medium text-studio-fg hover:text-studio-accent">
            {today.name} · {today.when} · {today.status}
          </Link>
        ) : (
          <p className="mt-0.5 text-sm text-studio-muted">No shoots scheduled</p>
        )}
      </div>
      <div className="flex flex-wrap gap-4 text-xs">
        {attention.requests > 0 ? (
          <Link to="/studio/clients?tab=inbox" className="hover:text-studio-accent">
            <p className="text-studio-muted">Open requests</p>
            <p className="font-medium tabular-nums text-studio-fg">{attention.requests}</p>
          </Link>
        ) : null}
        {attention.unpaid > 0 ? (
          <Link to="/studio/bookings?view=unpaid" className="hover:text-studio-accent">
            <p className="text-studio-muted">Unpaid</p>
            <p className="font-medium tabular-nums text-studio-fg">{attention.unpaid}</p>
          </Link>
        ) : null}
        <Link to="/studio/bookings?view=unpaid" className="hover:text-studio-accent">
          <p className="text-studio-muted">Amount due</p>
          <p className="font-medium tabular-nums text-studio-fg">{formatNgn(outstanding)}</p>
        </Link>
      </div>
    </div>
  )
}

function NeedsYou({ rows }: { rows: DeskNeedsYou[] }) {
  return (
    <section aria-labelledby="desk-needs" className="rounded-xl border border-studio-border bg-studio-panel p-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id="desk-needs" className="font-sans text-sm font-semibold text-studio-fg">
          Action required
        </h2>
        <Link to="/studio/clients?tab=inbox" className="text-[10px] text-studio-muted hover:text-studio-fg">
          View inbox
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-studio-muted">Nothing needs attention.</p>
      ) : (
        <ul className="divide-y divide-studio-border">
          {rows.map((row) => (
            <li key={row.id}>
              <Link
                to={row.href}
                className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 py-2 text-xs hover:text-studio-accent"
              >
                <span className="font-medium text-studio-fg">{row.name}</span>
                <span className="text-[10px] text-studio-muted">{row.when}</span>
                <span className="w-full text-studio-muted">
                  {row.reason}
                  {row.amountNgn != null && row.amountNgn > 0 ? ` · ${formatNgn(row.amountNgn)}` : ''}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function WeekBlotter({ days }: { days: DeskShootDay[] }) {
  return (
    <section aria-labelledby="desk-week" className="rounded-xl border border-studio-border bg-studio-panel p-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id="desk-week" className="font-sans text-sm font-semibold text-studio-fg">
          Upcoming
        </h2>
        <Link to="/studio/bookings?view=upcoming" className="shrink-0 text-[10px] text-studio-muted hover:text-studio-fg">
          View schedule
        </Link>
      </div>

      {/* Phone: stacked days so names/times never clip. Desktop: week grid. */}
      <ul className="space-y-2 sm:hidden">
        {days.map((d) => (
          <li
            key={d.weekday + d.day}
            className={cn(
              'rounded-md border px-3 py-2',
              d.today ? 'border-studio-accent bg-studio-bg' : 'border-studio-border bg-studio-bg/60',
            )}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className={cn('text-xs font-medium', d.today ? 'text-studio-accent' : 'text-studio-fg')}>
                {d.weekday}
              </span>
              <span className="text-[10px] text-studio-muted">{d.day}</span>
            </div>
            {d.shoots.length ? (
              <ul className="mt-1.5 space-y-1">
                {d.shoots.map((s) => (
                  <li key={s.id}>
                    <Link
                      to={s.href}
                      className="flex min-w-0 items-baseline justify-between gap-2 text-xs text-studio-fg hover:text-studio-accent"
                      title={`${s.name} · ${s.status} · ${s.when}`}
                    >
                      <span className="min-w-0 truncate font-medium">{s.name}</span>
                      <span className="shrink-0 text-[10px] text-studio-muted">
                        {s.when}
                        {s.status ? ` · ${s.status}` : ''}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-[10px] text-studio-muted">Nothing booked</p>
            )}
          </li>
        ))}
      </ul>

      <div className="hidden grid-cols-7 gap-1.5 sm:grid sm:gap-2">
        {days.map((d) => (
          <div
            key={d.weekday + d.day}
            className={cn(
              'min-h-[4.5rem] min-w-0 overflow-hidden rounded-md border p-1.5',
              d.today ? 'border-studio-accent bg-studio-bg' : 'border-studio-border bg-studio-bg/60',
            )}
          >
            <div className="flex items-center justify-between gap-1">
              <span className={cn('truncate text-[10px] font-medium', d.today ? 'text-studio-accent' : 'text-studio-muted')}>
                {d.weekday}
              </span>
              <span className="shrink-0 text-[10px] text-studio-muted">{d.day}</span>
            </div>
            <ul className="mt-1 space-y-1">
              {d.shoots.map((s) => (
                <li key={s.id} className="min-w-0">
                  <Link
                    to={s.href}
                    className="block min-w-0 text-[10px] leading-tight text-studio-fg hover:text-studio-accent"
                    title={`${s.name} · ${s.status} · ${s.when}`}
                  >
                    <span className="block truncate font-medium">{s.name}</span>
                    <span className="block truncate text-studio-muted">
                      {s.when}
                      {s.status ? ` · ${s.status}` : ''}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

function LatestFrames({ frames }: { frames: DashboardPulse['frames'] }) {
  if (!frames.length) return null
  return (
    <section aria-labelledby="desk-frames">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id="desk-frames" className="font-sans text-sm font-semibold text-studio-fg">
          Recent photos
        </h2>
        <Link to="/studio/gallery" className="text-[10px] text-studio-muted hover:text-studio-fg">
          View gallery
        </Link>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
        {frames.map((f) => (
          <Link key={f.id} to={f.href} className="group relative aspect-square overflow-hidden rounded-md bg-studio-panel">
            {f.thumb ? (
              <img
                src={f.thumb}
                alt=""
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            ) : (
              <div className="h-full w-full bg-studio-border" />
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}

function pathLabel(path: string) {
  if (path === '/' || path === '') return 'Home'
  return path
}

function SiteVisitsStrip({ site }: { site: SiteAnalytics | null }) {
  if (!site || !site.available) return null
  return (
    <div className="rounded-xl border border-studio-border bg-studio-panel p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-studio-muted">Site</p>
          <p className="mt-1 font-sans text-3xl font-semibold tracking-tight text-studio-fg">
            {site.visits.toLocaleString()}
          </p>
          <p className="mt-0.5 text-xs text-studio-muted">Visits · public pages</p>
        </div>
        <div className="min-w-0 flex-1 sm:max-w-md">
          <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-studio-muted">Top pages</p>
          {site.topPaths.length === 0 ? (
            <p className="text-xs text-studio-muted">No public page views in this period yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {site.topPaths.map((row) => (
                <li key={row.path} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate text-studio-fg">{pathLabel(row.path)}</span>
                  <span className="shrink-0 tabular-nums text-studio-muted">{row.views.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export function StudioDashboardPage() {
  const [period, setPeriod] = useState<DeskPeriod>(readDeskPeriod)
  const [data, setData] = useState<DashboardPulse | null>(null)
  const [site, setSite] = useState<SiteAnalytics | null>(null)
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
    void loadSiteAnalytics(p).then((next) => {
      if (alive) setSite(next)
    })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    return load(period, { soft: true })
  }, [load, period])

  const onAssistantWrite = useCallback(() => {
    load(period, { soft: true })
  }, [load, period])
  useStudioRecordRefresh(['bookings', 'people', 'form_inquiries', 'deliveries'], onAssistantWrite)

  function onPeriod(next: DeskPeriod) {
    if (next === period) return
    writeDeskPeriod(next)
    setPeriod(next)
  }

  if (error && !data) {
    return (
      <StudioHubShell>
        <StudioHubHeader title="Dashboard" mobileTitle={STUDIO_SHORT_NAME} />
        <StudioScrollPane innerClassName="space-y-8">
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

  const moneyMax = Math.max(...data.moneySeries.map((p) => p.value), data.finance.collectedPeriod, 1)
  const volumeMax = Math.max(...data.volumeSeries.map((p) => p.value), 1)

  return (
    <StudioHubShell>
      <StudioHubHeader
        title="Dashboard"
        mobileTitle={STUDIO_SHORT_NAME}
        actions={<PeriodControl period={period} onChange={onPeriod} />}
      />
      <StudioScrollPane
        innerClassName={cn('space-y-4 transition-opacity duration-200', refreshing && 'opacity-70')}
      >
        <PartialDataNotice missing={data.failed} onRetry={() => load(period, { soft: true })} />
        {error ? (
          <Alert variant="error" onRetry={() => load(period, { soft: true })}>
            {error}
          </Alert>
        ) : null}

        <TodayStrip today={data.today} attention={data.attention} outstanding={data.micro.outstanding} />

        <section aria-labelledby="desk-overview" className="space-y-4">
          <h2 id="desk-overview" className="sr-only">
            Overview
          </h2>

          <SiteVisitsStrip site={site} />

          <div className="rounded-xl border border-studio-border bg-studio-panel p-4">
            <div className="flex flex-col gap-5 lg:flex-row lg:gap-6">
              <div className="flex flex-col justify-between gap-4 lg:w-1/3">
                <div>
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-studio-muted">Revenue</p>
                    <div className="text-right">
                      <p className="text-xs text-studio-muted">{data.periodLabel}</p>
                      <DeltaBadge delta={data.collectedDelta} />
                    </div>
                  </div>
                  <p className="font-sans text-4xl font-semibold tracking-tight text-studio-fg">
                    {formatNgn(data.finance.collectedPeriod)}
                  </p>
                </div>
                <MicroStats micro={data.micro} />
              </div>
              <div className="flex flex-col justify-end lg:w-2/3">
                <LineChart
                  series={data.moneySeries}
                  max={moneyMax}
                  label="Revenue over time"
                  formatValue={formatNgn}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-studio-border bg-studio-panel p-4">
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h3 className="font-sans text-sm font-semibold text-studio-fg">Bookings</h3>
                <p className="text-[10px] text-studio-muted">Created in period</p>
              </div>
              <LineChart
                series={data.volumeSeries}
                max={volumeMax}
                label="Bookings created over time"
                formatValue={(n) => String(n)}
              />
            </div>
            <div className="rounded-xl border border-studio-border bg-studio-panel p-4">
              <h3 className="mb-3 font-sans text-sm font-semibold text-studio-fg">Status</h3>
              <MixChart mix={data.pipelineMix} />
            </div>
            <div className="rounded-xl border border-studio-border bg-studio-panel p-4">
              <h3 className="mb-3 font-sans text-sm font-semibold text-studio-fg">Conversion</h3>
              <p className="mb-2 text-[10px] text-studio-muted">{data.periodLabel}</p>
              <FunnelChart funnel={data.funnel} />
            </div>
          </div>
        </section>

        <section aria-labelledby="desk-activity" className="space-y-4">
          <h2 id="desk-activity" className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-studio-muted">
            Activity
          </h2>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <NeedsYou rows={data.needsYou} />
            </div>
            <div className="lg:col-span-2">
              <WeekBlotter days={data.week} />
            </div>
          </div>
        </section>

        <LatestFrames frames={data.frames} />
      </StudioScrollPane>
    </StudioHubShell>
  )
}
