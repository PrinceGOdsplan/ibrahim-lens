import { useEffect, useRef, type ReactNode } from 'react'
import { attachFocusReveal } from '@/lib/reveal-in-view'
import { cn } from '@/lib/utils'

/** Hub fills the Studio main pane. Put chrome in shrink-0 siblings; scroll the leftover. */
export function StudioHubShell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex h-full min-h-0 flex-1 flex-col overflow-hidden', className)}>{children}</div>
}

/** Full-pane scroller so the gutter sits on the app edge, not on a padded column. */
export function StudioScrollPane({
  children,
  className,
  innerClassName,
}: {
  children: ReactNode
  className?: string
  innerClassName?: string
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  useEffect(() => attachFocusReveal(scrollerRef.current), [])

  return (
    <div ref={scrollerRef} className={cn('h-full min-h-0 overflow-auto overscroll-contain', className)}>
      <div className={cn('px-3 py-3 sm:px-4 sm:py-4 md:px-8', innerClassName)}>{children}</div>
    </div>
  )
}
