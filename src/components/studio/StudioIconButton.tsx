import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export const STUDIO_ICON_STROKE = 1.75

export function StudioIcon({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return <Icon className={cn('h-4 w-4', className)} strokeWidth={STUDIO_ICON_STROKE} aria-hidden />
}

export function StudioIconButton({
  label,
  icon,
  onClick,
  active,
  disabled,
  mark,
  className,
}: {
  label: string
  icon: LucideIcon
  onClick?: () => void
  active?: boolean
  disabled?: boolean
  mark?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'relative inline-flex h-11 min-w-11 items-center justify-center rounded-md px-2 text-studio-muted hover:bg-studio-bg hover:text-studio-fg disabled:opacity-50',
        active && 'bg-studio-fg text-studio-bg hover:bg-studio-fg hover:text-studio-bg',
        className,
      )}
    >
      <StudioIcon icon={icon} />
      {mark ? (
        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-studio-accent" aria-hidden />
      ) : null}
    </button>
  )
}

export function StudioTextIconButton({
  label,
  icon,
  onClick,
  disabled,
  title,
  className,
}: {
  label: string
  icon: LucideIcon
  onClick?: () => void
  disabled?: boolean
  title?: string
  className?: string
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={title ?? label}
      onClick={onClick}
      className={cn(
        'inline-flex h-11 items-center gap-1.5 rounded-md px-2 text-sm text-studio-accent hover:opacity-80 disabled:opacity-50',
        className,
      )}
    >
      <StudioIcon icon={icon} />
      {label}
    </button>
  )
}
