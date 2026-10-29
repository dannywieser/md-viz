import hookSource from '../../../../packages/ui/src/hooks/use-dot-lattice.ts?raw'
import layoutSource from '../../../../packages/ui/src/lib/note-grid-layout.ts?raw'

/** the text from `start` to the end of `end`, '' when either is not found. */
function slice(source: string, start: string, end: string) {
  const from = source.indexOf(start)
  const to = from < 0 ? -1 : source.indexOf(end, from)
  return to < 0 ? '' : source.slice(from, to + end.length).trimEnd()
}

/** the real `latticeSpacing`, with its comment: how a cell becomes a dot spacing. */
export const spacingCode = slice(layoutSource, '/**\n * dot spacing', '\n}\n')

/** the real part of `useDotLattice` that puts the first square's corner on a dot. */
export const originCode = slice(hookSource, 'const apply = () => {', '\n    }\n')
  .split('\n')
  .map((line) => line.replace(/^ {4}/, ''))
  .join('\n')
