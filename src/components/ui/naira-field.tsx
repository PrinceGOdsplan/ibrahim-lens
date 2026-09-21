import type { InputHTMLAttributes } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/** Underline amount field with a persistent ₦ prefix. */
export function NairaField({
  className,
  id,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'inputMode'>) {
  return (
    <div className={cn('flex items-end gap-2', className)}>
      <span className="pb-1 text-sm text-studio-muted" aria-hidden>
        ₦
      </span>
      <Input id={id} type="text" inputMode="decimal" autoComplete="off" className="min-w-0 flex-1" {...props} />
    </div>
  )
}
