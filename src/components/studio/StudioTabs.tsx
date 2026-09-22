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

function tabClass(active: boolean) {
  return cn(
    '-mb-px inline-flex shrink-0 items-center gap-1.5 border-b-2 px-2.5 py-2 text-sm transition-colors md:px-3',
    active
      ? 'border-studio-fg font-medium text-studio-fg'
      : 'border-transparent text-studio-muted hover:text-studio-fg',
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
  const fillMobile = primary.length <= 4 && !secondary?.length

  return (
    <div
      className={cn(
        'border-b border-studio-border',
        fillMobile
          ? 'max-md:grid max-md:grid-cols-4 max-md:gap-0'
          : '-mx-1 flex flex-nowrap items-end gap-x-1 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        !fillMobile && 'flex flex-nowrap items-end gap-x-1',
        className,
      )}
      role="tablist"
      aria-label={ariaLabel}
    >
      <div className={cn('flex flex-nowrap', fillMobile && 'contents max-md:contents')}>
        {primary.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            title={item.hint}
            aria-selected={value === item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              tabClass(value === item.id),
              fillMobile &&
                'max-md:w-full max-md:justify-center max-md:px-1 max-md:text-xs max-md:[touch-action:manipulation]',
            )}
          >
            {item.icon ? <StudioIcon icon={item.icon} className="hidden h-3.5 w-3.5 md:inline-block" /> : null}
            {item.label}
            {item.count != null ? (
              <span className="studio-numeral text-xs text-studio-muted">{item.count}</span>
            ) : null}
          </button>
        ))}
      </div>
      {secondary?.length ? (
        <>
          <span className="mb-2 hidden h-4 w-px shrink-0 bg-studio-muted/40 sm:block" aria-hidden />
          <p className="sr-only">More</p>
          <div className="flex flex-nowrap">
            {secondary.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                title={item.hint}
                aria-selected={value === item.id}
                onClick={() => onChange(item.id)}
                className={tabClass(value === item.id)}
              >
                {item.icon ? <StudioIcon icon={item.icon} className="hidden h-3.5 w-3.5 md:inline-block" /> : null}
                {item.label}
                {item.count != null ? (
                  <span className="studio-numeral text-xs text-studio-muted">{item.count}</span>
                ) : null}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
