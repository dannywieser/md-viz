/** a pixel icon: '#' is foreground, '+' is the accent, '.' is empty. every row has the same width. */
type PixelIconData = {
  rows: readonly string[]
  /** which cells take the note grid palette, a colour per row: the '#' cells (`fill`) or the '+' cells (`accent`). */
  palette: 'fill' | 'accent'
}

export const PIXEL_ICONS = {
  /** the empty state: a ghost in the note palette. */
  ghost: {
    palette: 'fill',
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
  /** the error state: a tile with a crack in the note palette running down it. */
  'broken-tile': {
    palette: 'accent',
    rows: [
      '#####+######',
      '#####+######',
      '######+#####',
      '####+#######',
      '####+#######',
      '#####+######',
      '######+#####',
      '#####+######',
      '#####+######',
      '######+#####',
      '####+#######',
      '####+#######',
    ],
  },
} as const satisfies Record<string, PixelIconData>

export type PixelIconName = keyof typeof PIXEL_ICONS
