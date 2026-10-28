import { Loader, ProgressBar } from '@md-viz/ui'

interface SyncProgressProps {
  /** what is going on, e.g. the note being pushed. */
  line: string
  /** the counts so far. */
  count: string
  /** the bar's progress; null when the total is not known (a scan), and no bar is drawn. */
  bar: { value: number; max: number } | null
  label: string
}

/** the loader with a line of what is going on, the counts and, where the total is known, a bar. */
export function SyncProgress({ line, count, bar, label }: SyncProgressProps) {
  return (
    <div className="flex w-96 max-w-full flex-col items-center gap-4 p-6 text-center">
      <Loader label={label} cell={12} />
      <p className="max-w-full truncate text-sm">{line}</p>
      {bar && <ProgressBar value={bar.value} max={bar.max} label={`${label} progress`} />}
      <p className="text-sm text-muted-foreground">{count}</p>
    </div>
  )
}
