import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { StudioIcon } from '@/components/studio/StudioIconButton'

export type StudioTabItem<T extends string> = {
  id: T
  label: string
  icon?: LucideIcon
  hint?: string
  count?: number
}

type Props<T extends string> = {
  value: T
  onChange: (id: T) => void
  primary: StudioTabItem<T>[]
  secondary?: StudioTabItem<T>[]
  className?: string
  'aria-label'?: string
}

function tabClass(active: boolean, fillMobile?: boolean) {
  return cn(
    '-mb-px inline-flex shrink-0 items-center gap-1.5 border-b-2 px-2.5 py-2 text-sm transition-colors md:px-3',
    active
      ? 'border-studio-fg font-medium text-studio-fg'
      : 'border-transparent text-studio-muted hover:text-studio-fg',
    fillMobile && 'max-md:min-h-11 max-md:w-full max-md:justify-center max-md:px-1 max-md:text-xs',
  )
}

function TabButton<T extends string>({
  item,
  active,
  onChange,
  fillMobile,
}: {
  item: StudioTabItem<T>
  active: boolean
  onChange: (id: T) => void
  fillMobile?: boolean
}) {
  return (
    <button
      type="button"
      role="tab"
      title={item.hint}
      aria-selected={active}
      onClick={() => onChange(item.id)}
      className={tabClass(active, fillMobile)}
    >
      {item.icon ? <StudioIcon icon={item.icon} className="hidden h-3.5 w-3.5 md:inline-block" /> : null}
      {item.label}
      {item.count != null ? <span className="studio-numeral text-xs text-studio-muted">{item.count}</span> : null}
    </button>
  )
}

/** One underline-tab idiom for every Studio hub. */
export function StudioTabs<T extends string>({
  value,
  onChange,
  primary,
  secondary,
  className,
  'aria-label': ariaLabel = 'Sections',
}: Props<T>) {
  // Avoid display:contents — iOS Safari often drops hit-testing on those children.
  const fillMobile = primary.length <= 4 && !secondary?.length

  return (
    <div
      className={cn(
        'border-b border-studio-border',
        fillMobile
          ? 'grid grid-cols-4 md:flex md:flex-nowrap md:items-end md:gap-x-1'
          : '-mx-1 flex flex-nowrap items-end gap-x-1 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
      role="tablist"
      aria-label={ariaLabel}
    >
      {primary.map((item) => (
        <TabButton
          key={item.id}
          item={item}
          active={value === item.id}
          onChange={onChange}
          fillMobile={fillMobile}
        />
      ))}
      {secondary?.length ? (
        <>
          <span className="mb-2 hidden h-4 w-px shrink-0 bg-studio-muted/40 sm:block" aria-hidden />
          <p className="sr-only">More</p>
          {secondary.map((item) => (
            <TabButton key={item.id} item={item} active={value === item.id} onChange={onChange} />
          ))}
        </>
      ) : null}
    </div>
  )
}
