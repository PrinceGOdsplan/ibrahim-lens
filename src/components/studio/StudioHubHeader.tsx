import type { ReactNode } from 'react'

export function StudioHubHeader({
  title,
  actions,
  children,
}: {
  title: string
  actions?: ReactNode
  children?: ReactNode
}) {
  return (
    <header className="shrink-0 border-b border-studio-border bg-studio-panel px-3 py-3 sm:px-4 md:px-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-2xl leading-none">{title}</h1>
        {actions ? <div className="flex items-center gap-1">{actions}</div> : null}
      </div>
      {children}
    </header>
  )
}
