import { modes, type Mode } from './background-variants'
import { NoteBlock } from './note-block'

export function MockCard({
  mode,
  cell,
  columns,
  rows,
  aligned,
}: {
  mode: Mode
  cell: number
  columns: number
  rows: number
  /** no padding, so the squares start on the card's corner and stay on the dot lattice. */
  aligned: boolean
}) {
  const { card, text, dot } = modes[mode]
  return (
    <div
      className={aligned ? 'shadow-hard' : 'shadow-hard p-3'}
      style={{ background: card, outline: `1px solid ${dot}`, color: text }}
    >
      <NoteBlock mode={mode} cell={cell} columns={columns} rows={rows} />
    </div>
  )
}
