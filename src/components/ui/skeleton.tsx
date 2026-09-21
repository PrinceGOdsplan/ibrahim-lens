import { cn } from '@/lib/utils'

type Tone = 'public' | 'studio'

const toneClass: Record<Tone, string> = {
  public: 'bg-public-fg/[0.07]',
  studio: 'bg-studio-border/60',
}

/** Placeholder block. Reserves the space the loaded content will occupy. */
export function Skeleton({
  className,
  tone = 'studio',
}: {
  className?: string
  tone?: Tone
}) {
  return <div aria-hidden className={cn('animate-pulse rounded', toneClass[tone], className)} />
}

/** Stack of text-height bars; last one short so it reads as a paragraph. */
export function SkeletonText({
  lines = 3,
  className,
  tone = 'studio',
}: {
  lines?: number
  className?: string
  tone?: Tone
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} tone={tone} className={cn('h-3', i === lines - 1 ? 'w-2/5' : 'w-full')} />
      ))}
    </div>
  )
}

/**
 * Grid of image placeholders for galleries and pickers. `aspect` should match
 * the loaded grid so nothing shifts when the photographs arrive.
 */
export function SkeletonGrid({
  count = 6,
  className,
  itemClassName = 'aspect-[4/5]',
  tone = 'studio',
}: {
  count?: number
  className?: string
  itemClassName?: string
  tone?: Tone
}) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} tone={tone} className={itemClassName} />
      ))}
    </div>
  )
}

/** Announces that a surface is busy, for assistive tech, without visible text. */
export function LoadingAnnouncement({ label = 'Loading' }: { label?: string }) {
  return (
    <span role="status" aria-live="polite" className="sr-only">
      {label}
    </span>
  )
}
