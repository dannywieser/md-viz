import { useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listNotesOptions } from '@md-viz/api-client/cache'
import { Card, NoteGrid } from '@md-viz/ui'
import type { Note } from '@md-viz/ui'
import { useDotLattice } from './use-dot-lattice'

// the card's 1px border plus 2px, which the grid's own 3px of stroke room needs; the card has no padding.
const CARD_INSET = 3
// every note gets the same color until color carries meaning.
const NOTE_COLOR = 0

function Message({ children }: { children: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">{children}</p>
      </Card>
    </div>
  )
}

/** the cached notes as a grid, one cell per note, in the cache's order. */
export function CacheNoteGrid() {
  const { data, error, isPending } = useQuery(listNotesOptions({ query: { fields: 'title' } }))
  const cardRef = useRef<HTMLDivElement>(null)
  const [cell, setCell] = useState<number | null>(null)
  useDotLattice(cardRef, cell)

  const notes = useMemo<Note[]>(
    () =>
      (data ?? []).map((note) => ({
        id: note.id,
        title: note.fields.title ?? note.id,
        color: NOTE_COLOR,
      })),
    [data],
  )

  if (isPending) return <Message>loading notes</Message>
  if (error) return <Message>could not load notes from the cache</Message>
  if (notes.length === 0) return <Message>no notes in the cache</Message>

  return (
    <NoteGrid
      notes={notes}
      inset={CARD_INSET}
      onCellChange={setCell}
      frame={(grid) => (
        <Card ref={cardRef} className="gap-0 p-0">
          {grid}
        </Card>
      )}
    />
  )
}
