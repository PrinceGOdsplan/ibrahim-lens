import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/** Underline Studio textarea — same chrome and focus ring as `Input`. */
export const textareaClass =
  'min-h-16 w-full resize-y border-0 border-b border-studio-border/70 bg-transparent px-0 py-1.5 font-sans text-base font-normal leading-relaxed text-studio-fg placeholder:font-normal placeholder:text-studio-muted focus-visible:border-studio-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-studio-fg disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(textareaClass, className)} {...props} />
}
