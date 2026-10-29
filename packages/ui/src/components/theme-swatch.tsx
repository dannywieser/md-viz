import { HUE_ORDER } from '../lib/note-colors'
import type { Theme } from '../lib/themes'

/** the grid is 3 by 3: the eight hues around the neutral grey. */
const CENTER = 4

/** a theme as a small pixel square: its eight hues around its neutral grey. decorative. */
function ThemeSwatch({ theme, cell = 5 }: { theme: Theme; cell?: number }) {
  const hues = HUE_ORDER.map((hue) => theme.hues[hue])
  const colors = [...hues.slice(0, CENTER), theme.ui.muted, ...hues.slice(CENTER)]
  return (
    <svg
      data-slot="theme-swatch"
      aria-hidden="true"
      viewBox="0 0 3 3"
      width={cell * 3}
      height={cell * 3}
      shapeRendering="crispEdges"
      className="shrink-0"
    >
      {colors.map((color, i) => (
        <rect key={i} x={i % 3} y={Math.floor(i / 3)} width={1} height={1} fill={color} />
      ))}
    </svg>
  )
}

export { ThemeSwatch }
