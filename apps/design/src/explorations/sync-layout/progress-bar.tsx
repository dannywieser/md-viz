/** a bar of the progress made, in the card's square style: a hard border and a flat fill. */
export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const percent = max === 0 ? 0 : Math.round((value / max) * 100)
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className="h-3 flex-1 border bg-background"
    >
      <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
    </div>
  )
}
