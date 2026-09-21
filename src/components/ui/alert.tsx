import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'error' | 'info' | 'success'
type Tone = 'public' | 'studio'

const styles: Record<Tone, Record<Variant, string>> = {
  public: {
    error: 'text-public-danger',
    info: 'text-public-muted',
    success: 'text-public-accent',
  },
  studio: {
    error: 'rounded-md border border-studio-danger/25 bg-studio-danger/5 px-3 py-2 text-studio-danger',
    info: 'rounded-md border border-studio-border bg-studio-panel px-3 py-2 text-studio-muted',
    success: 'rounded-md border border-studio-border bg-studio-panel px-3 py-2 text-studio-fg',
  },
}

/**
 * Outcome message. Errors announce assertively, everything else politely, so a
 * result is never visible-only.
 */
export function Alert({
  variant = 'error',
  tone = 'studio',
  children,
  onRetry,
  retryLabel = 'Try again',
  className,
}: {
  variant?: Variant
  tone?: Tone
  children: ReactNode
  onRetry?: () => void
  retryLabel?: string
  className?: string
}) {
  const isError = variant === 'error'

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 text-sm', styles[tone][variant], className)}
    >
      <span>{children}</span>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            'shrink-0 underline underline-offset-2',
            tone === 'public' ? 'text-public-fg hover:opacity-80' : 'text-studio-fg hover:opacity-80',
          )}
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  )
}

const STUDIO_LOAD_LABELS: Record<string, string> = {
  Albums: 'Albums',
  Bookings: 'Bookings',
  Deliveries: 'Deliveries',
  FAQ: 'FAQ',
  Feedback: 'Feedback',
  Inbox: 'Inbox',
  MediaLifetime: 'Photos',
  MediaPeriod: 'Photos this period',
  MoneyEvents: 'Earnings',
  People: 'People',
  Portfolio: 'Portfolio',
  SEO: 'Search listings',
  Settings: 'Website settings',
  Tags: 'Tags',
  Testimonials: 'Testimonials',
  Work: 'Work',
}

/**
 * Aggregate surface loaded with gaps. Names what is missing rather than letting
 * absent data read as zero.
 */
export function PartialDataNotice({
  missing,
  onRetry,
  tone = 'studio',
}: {
  missing: string[]
  onRetry?: () => void
  tone?: Tone
}) {
  if (!missing.length) return null

  const labels = missing.map((key) => STUDIO_LOAD_LABELS[key] ?? key).join(', ')

  return (
    <Alert variant="info" tone={tone} onRetry={onRetry} retryLabel="Reload">
      Some of this page could not load ({labels}). What you see may be incomplete.
    </Alert>
  )
}
