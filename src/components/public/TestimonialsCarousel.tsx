import { useEffect, useState } from 'react'
import type { Testimonial } from '@/lib/website'
import { StreetAtmosphere } from '@/components/public/StreetAtmosphere'

function initials(name: string) {
  const parts = name
    .replace(/,.*/, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!parts.length) return 'IL'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
}

function roleFromAuthor(item: Testimonial) {
  if (item.author_role?.trim()) return item.author_role.trim()
  const comma = item.author_name.indexOf(',')
  if (comma > 0) return item.author_name.slice(comma + 1).trim()
  return ''
}

function displayName(item: Testimonial) {
  const comma = item.author_name.indexOf(',')
  if (comma > 0 && !item.author_role?.trim()) return item.author_name.slice(0, comma).trim()
  return item.author_name.trim()
}

type Props = {
  items: Testimonial[]
  intervalMs?: number
}

export function TestimonialsCarousel({ items, intervalMs = 6500 }: Props) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const slides = items.length ? items : []

  useEffect(() => {
    setIndex(0)
  }, [slides.length])

  useEffect(() => {
    if (slides.length < 2 || paused) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [slides.length, intervalMs, paused])

  if (!slides.length) return null

  const current = slides[index] ?? slides[0]
  const name = displayName(current)
  const role = roleFromAuthor(current)

  return (
    <section className="street-atmosphere-panel relative overflow-hidden border-y border-white/10 py-20 md:py-32" aria-label="Testimonials">
      <StreetAtmosphere />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-10">
          <div>
            <h2 className="mt-2 font-display text-5xl leading-[1.05] md:text-7xl">
              Clients
              <br />
              & brands
            </h2>
          </div>
          {slides.length > 1 ? (
            <p className="text-sm text-public-muted md:mb-2 md:text-right">
              <span className="font-display text-2xl text-public-fg">{String(index + 1).padStart(2, '0')}</span>
              <span className="mx-2 text-public-fg/30">/</span>
              <span>{String(slides.length).padStart(2, '0')}</span>
            </p>
          ) : null}
        </div>

        {/* The quote swaps in place, so without a live region a screen reader
            user never learns the content changed. */}
        <div
          className="mt-14 grid gap-10 md:mt-20 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.7fr)] md:gap-8 md:items-end"
          aria-live="polite"
          aria-atomic="true"
        >
          <blockquote key={current.id} className="atelier-fade-up max-w-3xl">
            <p className="street-quote-text text-xl leading-relaxed text-public-fg sm:text-2xl md:text-[1.65rem] md:leading-relaxed">
              “{current.quote}”
            </p>
          </blockquote>

          <div className="flex flex-col gap-6 md:items-start md:pb-1">
            <div className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center border border-public-fg/25 bg-public-fg/5 font-display text-xl text-public-fg"
                aria-hidden
              >
                {initials(name)}
              </div>
              <div>
                <p className="font-medium text-public-fg">{name}</p>
                {role ? <p className="mt-1 text-sm text-public-muted">{role}</p> : null}
              </div>
            </div>

            {slides.length > 1 ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  aria-pressed={paused}
                  className="mr-2 inline-flex h-11 items-center px-1 text-xs tracking-wide text-public-muted hover:text-public-fg"
                >
                  {paused ? 'Play' : 'Pause'}
                </button>
                {slides.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`Show testimonial ${i + 1}`}
                    aria-current={i === index}
                    className={[
                      'hit-expand h-1.5 min-w-8 self-center transition-all',
                      i === index ? 'w-12 bg-public-accent' : 'w-8 bg-public-fg/20 hover:bg-public-fg/45',
                    ].join(' ')}
                    onClick={() => setIndex(i)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
