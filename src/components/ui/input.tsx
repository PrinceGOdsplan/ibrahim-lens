import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Input({ className, type, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  // File inputs keep a light bordered control; text fields use underline.
  if (type === 'file') {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full cursor-pointer rounded border border-studio-border/60 bg-transparent px-2 text-xs text-studio-fg file:mr-2 file:border-0 file:bg-transparent file:text-xs file:text-studio-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-studio-fg disabled:opacity-50',
          className,
        )}
        {...props}
      />
    )
  }

  return (
    <input
      type={type}
      className={cn(
        // A 1px border tint is not a discernible focus indicator; keep a real outline.
        // 16px on touch stops iOS Safari from page-zooming on focus.
        'flex h-10 w-full border-0 border-b border-studio-border/70 bg-transparent px-0 py-1 font-sans text-base font-normal text-studio-fg placeholder:font-normal placeholder:text-studio-muted focus-visible:border-studio-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-studio-fg disabled:cursor-not-allowed disabled:opacity-50 md:h-8 md:text-sm',
        className,
      )}
      {...props}
    />
  )
}
