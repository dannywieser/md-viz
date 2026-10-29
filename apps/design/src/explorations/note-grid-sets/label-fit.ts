/** width of one character of the label text (px, 12px Space Mono). */
export const CHAR_PX = 7.2
/** height of one line of label text (px). */
export const LINE_PX = 16
/** room kept free around label text (px). */
export const LABEL_PAD = 6

/** whether `text` fits a block of width x height px on one line with its padding. */
export function labelFits(text: string, width: number, height: number): boolean {
  return width >= text.length * CHAR_PX + 2 * LABEL_PAD && height >= LINE_PX + 2 * LABEL_PAD
}

/** `text` cut to what fits `width` px, with an ellipsis; empty when not even one character fits. */
export function truncateLabel(text: string, width: number): string {
  const chars = Math.floor((width - 2 * LABEL_PAD) / CHAR_PX)
  if (chars >= text.length) return text
  if (chars < 2) return ''
  return `${text.slice(0, chars - 1)}…`
}

/** how a grid labels its blocks: not at all, a chip inside, a tab on the top edge, or only where it fits. */
export type LabelMode = 'none' | 'inside' | 'tab' | 'threshold'
