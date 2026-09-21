/** Ambient glow + soft grid behind copy zones. No large decorative text. */
export function StreetAtmosphere({
  className = '',
  glow = 'end',
}: {
  className?: string
  /** Where the gold glow sits */
  glow?: 'end' | 'start' | 'center'
}) {
  return (
    <div className={['street-atmosphere', `street-atmosphere--glow-${glow}`, className].filter(Boolean).join(' ')} aria-hidden>
      <div className="street-atmosphere-glow" />
      <div className="street-atmosphere-grid" />
    </div>
  )
}
