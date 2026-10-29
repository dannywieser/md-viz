import { CHAR_PX, LABEL_PAD, LINE_PX, labelFits, truncateLabel, type LabelMode } from './label-fit'

type BlockLabelProps = {
  mode: LabelMode
  /** the block, px in the svg. */
  x: number
  y: number
  width: number
  height: number
  text: string
}

const TAB_HEIGHT = LINE_PX + LABEL_PAD

/**
 * the label of one block: `inside` is a chip inset in the corner, cut to the width (nothing when not
 * even two characters fit), `tab` hangs flush on the top-left corner like a file tab, `threshold` is
 * the chip only where the whole text fits. a card-coloured backing keeps the text readable on any note colour.
 */
export function BlockLabel({ mode, x, y, width, height, text }: BlockLabelProps) {
  if (mode === 'none') return null
  const shown = mode === 'threshold' ? (labelFits(text, width, height) ? text : '') : truncateLabel(text, width)
  if (shown === '' || (mode === 'tab' && height < TAB_HEIGHT)) return null
  const flush = mode === 'tab'
  const left = flush ? x : x + LABEL_PAD / 2
  const top = flush ? y : y + LABEL_PAD / 2
  const chipWidth = shown.length * CHAR_PX + LABEL_PAD * 2
  return (
    <g pointerEvents="none" data-label={mode}>
      <rect
        x={left}
        y={top}
        width={chipWidth}
        height={TAB_HEIGHT}
        className="fill-card stroke-border"
        strokeWidth={flush ? 1 : 0}
      />
      <text
        x={left + LABEL_PAD}
        y={top + TAB_HEIGHT / 2}
        dominantBaseline="central"
        className="fill-card-foreground text-xs"
      >
        {shown}
      </text>
    </g>
  )
}
