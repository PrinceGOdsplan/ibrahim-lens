import { useEffect } from 'react'
import { Pause, Play } from 'lucide-react'
import { SubjectCover } from '@/components/public/SubjectCover'
import type { MediaRecord } from '@/lib/library'

type Props = {
  images: MediaRecord[]
  index: number
  onIndexChange: (index: number) => void
  paused?: boolean
  intervalMs?: number
}

/** Full-bleed hero slideshow; pauses when prefers-reduced-motion. Controlled index. */
export function HeroSlideshow({
  images,
  index,
  onIndexChange,
  paused = false,
  intervalMs = 5500,
}: Props) {
  const slides = images.length ? images : []

  useEffect(() => {
    if (slides.length < 2 || paused) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return
    const id = window.setInterval(() => {
      onIndexChange((index + 1) % slides.length)
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [slides.length, intervalMs, index, onIndexChange, paused])

  if (!slides.length) {
    return (
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_30%,rgba(154,115,64,0.35),transparent_55%),linear-gradient(160deg,#3d342c,#1a1512)]" />
    )
  }

  return (
    <>
      {slides.map((item, i) => (
        <SubjectCover
          key={item.id}
          record={item}
          widthKey="full"
          sizes="100vw"
          alt={i === index ? item.caption || 'Featured photograph' : ''}
          loading={i === 0 ? 'eager' : 'lazy'}
          fetchPriority={i === 0 ? 'high' : 'low'}
          decoding={i === 0 ? 'sync' : 'async'}
          className={[
            'absolute inset-0 transition-[opacity,object-position] duration-1000 motion-reduce:transition-opacity',
            i === index ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
          aria-hidden={i !== index}
        />
      ))}
    </>
  )
}

export function HeroSlideControls({
  slides,
  index,
  paused,
  onPausedChange,
  onIndexChange,
}: {
  slides: MediaRecord[]
  index: number
  paused: boolean
  onPausedChange: (paused: boolean) => void
  onIndexChange: (index: number) => void
}) {
  if (slides.length < 2) return null

  return (
    <div className="flex shrink-0 items-center">
      <button
        type="button"
        onClick={() => onPausedChange(!paused)}
        aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
        aria-pressed={paused}
        className="mr-1 inline-flex h-11 min-w-11 items-center justify-center text-white/70 hover:text-white"
      >
        {paused ? (
          <Play className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        ) : (
          <Pause className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        )}
      </button>
      {slides.map((item, i) => (
        <button
          key={item.id}
          type="button"
          aria-label={`Show slide ${i + 1}`}
          aria-current={i === index ? 'true' : undefined}
          className="group flex h-11 min-w-11 items-center justify-center px-1.5"
          onClick={() => onIndexChange(i)}
        >
          <span
            aria-hidden
            className={[
              'h-1 min-w-6 transition-all',
              i === index ? 'w-10 bg-white' : 'w-6 bg-white/35 group-hover:bg-white/60',
            ].join(' ')}
          />
        </button>
      ))}
    </div>
  )
}
