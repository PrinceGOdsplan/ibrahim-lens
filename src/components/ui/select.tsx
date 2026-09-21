import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const selectVariants = {
  form: 'h-11 w-full rounded-md border border-studio-border bg-studio-panel px-2 text-base text-studio-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-studio-fg disabled:cursor-not-allowed disabled:opacity-50 md:h-10 md:text-sm',
  toolbar:
    'h-11 min-h-11 rounded-md border border-studio-border bg-studio-panel px-2 text-sm text-studio-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-studio-fg disabled:opacity-50 md:h-8 md:min-h-8',
}

export function Select({
  className,
  variant = 'form',
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { variant?: keyof typeof selectVariants }) {
  return <select className={cn(selectVariants[variant], className)} {...props} />
}
