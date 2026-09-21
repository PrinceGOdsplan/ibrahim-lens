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
      <div className="mx-auto flex max-w-6xl flex-nowrap items-center justify-between gap-2 overflow-hidden">
        <h1 className="flex h-11 min-w-0 flex-1 items-center truncate font-sans text-2xl font-semibold leading-none tracking-tight">{title}</h1>
        {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
      </div>
      {children ? <div className="mx-auto max-w-6xl">{children}</div> : null}
    </header>
  )
}
