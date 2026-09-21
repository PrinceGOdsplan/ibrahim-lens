/** Turns `preferred_location` into `Preferred location`. */
function answerLabel(key: string) {
  const words = key.replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

function answerValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.length ? value.map(answerValue).join(', ') : '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

/**
 * What the client typed into the booking form. It was a JSON dump, which is
 * unreadable at the exact moment the photographer is on the phone with them.
 */
export function BookingAnswers({ answers }: { answers?: Record<string, unknown> | null }) {
  const entries = Object.entries(answers ?? {})
  if (!entries.length) return null

  return (
    <div className="rounded-md border border-studio-border bg-studio-panel p-3">
      <p className="text-xs font-medium">From the booking form</p>
      <dl className="mt-2 space-y-2 text-xs">
        {entries.map(([key, value]) => (
          <div key={key} className="grid gap-0.5 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)] sm:gap-3">
            <dt className="text-studio-muted">{answerLabel(key)}</dt>
            <dd className="break-words">{answerValue(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
