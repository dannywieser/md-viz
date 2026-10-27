import { Loader } from '@md-viz/ui'
import { ProgressBar } from './progress-bar'

export type Shape = 'inline' | 'strip' | 'center'

interface SyncProgressProps {
  /** `inline` is a small loader and one line, `strip` adds a bar, `center` stacks everything big. */
  shape: Shape
  /** what is going on, e.g. the note being pushed. */
  line: string
  /** the counts so far. */
  count: string
  /** the bar's progress; null when the total is not known (a scan), and no bar is drawn. */
  bar: { value: number; max: number } | null
  label: string
}

/** the loader with a line of what is going on, the counts and, where the total is known, a bar. */
export function SyncProgress({ shape, line, count, bar, label }: SyncProgressProps) {
  const progressBar = bar && (
    <ProgressBar value={bar.value} max={bar.max} label={`${label} progress`} />
  )

  if (shape === 'center') {
    return (
      <div className="flex w-96 max-w-full flex-col items-center gap-4 p-6 text-center">
        <Loader label={label} cell={12} />
        <p className="max-w-full truncate text-sm">{line}</p>
        <div className="flex w-full items-center gap-3">
          {progressBar}
          <span className="text-sm">{count}</span>
        </div>
      </div>
    )
  }
  if (shape === 'strip') {
    return (
      <div className="flex items-center gap-4">
        <Loader label={label} cell={6} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="truncate text-sm">{line}</p>
          <div className="flex items-center gap-3">
            {progressBar}
            <span className="text-xs text-muted-foreground">{count}</span>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Loader label={label} cell={4} />
      <p className="truncate text-sm">
        {line} <span className="text-muted-foreground">· {count}</span>
      </p>
    </div>
  )
}
