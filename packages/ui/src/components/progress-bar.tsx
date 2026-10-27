/** a bar of the progress made, in the square style: a hard border and a flat fill. */
function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const percent = max === 0 ? 0 : Math.round((value / max) * 100)
  return (
    <div
      data-slot="progress-bar"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className="h-3 w-full border bg-background"
    >
      <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
    </div>
  )
}

export { ProgressBar }
