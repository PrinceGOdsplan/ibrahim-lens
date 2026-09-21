import type { ElementType, ReactNode } from 'react'
import { useRevealInView } from '@/lib/reveal-in-view'

/** Scrolls into the nearest scroller when `open` becomes true. */
export function RevealOnOpen({
  open,
  id,
  as: Tag = 'div',
  className,
  children,
}: {
  open: boolean
  id?: string
  as?: ElementType
  className?: string
  children: ReactNode
}) {
  const ref = useRevealInView<HTMLElement>(open, [id])
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
