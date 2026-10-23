export type IconKind = 'empty' | 'error'

export type NotePalette = 'fill' | 'accent'

/** a pixel icon: '#' is foreground, '+' is the accent, '.' is empty. every row has the same width. */
export interface IconOption {
  id: string
  name: string
  kind: IconKind
  rows: readonly string[]
  /** colours cells with the note grid palette, a colour per row: the '#' cells (`fill`) or the '+' cells (`accent`). */
  notePalette?: NotePalette
}

/** replaces the cell in each row at the matching column with `char`, walking a crack down the bitmap. */
export function withCrack(rows: readonly string[], columns: readonly number[], char: string) {
  return rows.map((row, y) => {
    const x = columns[y]
    return x === undefined ? row : row.slice(0, x) + char + row.slice(x + 1)
  })
}

// the ".md" mark in the logo's bitmap glyphs.
const MD = [
  '.............#',
  '.............#',
  '...#####..####',
  '...#.#.#.#...#',
  '...#.#.#.#...#',
  '##.#.#.#.#...#',
  '##.#.#.#..####',
]

export const icons: IconOption[] = [
  {
    id: 'empty-box',
    name: 'empty box',
    kind: 'empty',
    rows: [
      '.#........#.',
      '.#........#.',
      '.#........#.',
      '.#........#.',
      '.#........#.',
      '.#...+....#.',
      '.##########.',
    ],
  },
  {
    id: 'ghost',
    name: 'ghost',
    kind: 'empty',
    notePalette: 'fill',
    rows: [
      '...######...',
      '..########..',
      '.##########.',
      '.##..##..##.',
      '.##..##..##.',
      '.##########.',
      '.##########.',
      '.##########.',
      '.##.####.##.',
      '.#...##...#.',
    ],
  },
  {
    id: 'broken-tile',
    name: 'broken tile',
    kind: 'error',
    notePalette: 'accent',
    rows: withCrack(
      Array.from({ length: 12 }, () => '#'.repeat(12)),
      [5, 5, 6, 4, 4, 5, 6, 5, 5, 6, 4, 4],
      '+',
    ),
  },
  {
    id: 'cracked-md',
    name: 'cracked .md',
    kind: 'error',
    rows: withCrack(MD, [6, 5, 6, 5, 6, 5, 6], '+'),
  },
  {
    id: 'sad-md',
    name: 'sad .md',
    kind: 'error',
    rows: [...MD, '....######....', '...#......#...'],
  },
]
