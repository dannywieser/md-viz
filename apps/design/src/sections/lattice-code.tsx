import { originCode, spacingCode } from './source-excerpt'

/** the line of `latticeSpacing` each case runs: the second for a cell over the maximum, else the last. */
const isActive = (line: string, divided: boolean) =>
  line.trimStart().startsWith(divided ? 'if (cell > max)' : 'return cell *')

/** the source that snaps a grid to the dots, the line the current cell runs highlighted. */
export function LatticeCode({ divided }: { divided: boolean }) {
  return (
    <div className="space-y-4">
      <figure className="space-y-1">
        <figcaption className="text-xs text-muted-foreground">
          latticeSpacing, in @md-viz/ui: cell to dot spacing
        </figcaption>
        <pre className="overflow-x-auto border bg-card p-3 text-xs">
          {spacingCode.split('\n').map((line, index) => (
            <code
              key={index}
              className={`block ${isActive(line, divided) ? 'bg-primary text-primary-foreground' : ''}`}
            >
              {line || ' '}
            </code>
          ))}
        </pre>
      </figure>
      <figure className="space-y-1">
        <figcaption className="text-xs text-muted-foreground">
          useDotLattice, in @md-viz/ui: puts a dot on the first square's corner
        </figcaption>
        <pre className="overflow-x-auto border bg-card p-3 text-xs">
          <code>{originCode}</code>
        </pre>
      </figure>
    </div>
  )
}
