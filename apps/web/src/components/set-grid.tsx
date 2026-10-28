import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getSetOptions } from '@md-viz/api-client/cache/react-query'
import { ErrorState, Loader, NoteGrid, StateBlock } from '@md-viz/ui'
import type { Note } from '@md-viz/ui'

type SetGridProps = {
  /** the cache set id, like `bear:created-today`. */
  id: string
  label: string
  /** every cached note; the set's members are looked up in it. */
  notes: Note[]
  /** the grid block, when this grid is the one the page's dots follow. */
  gridRef?: React.Ref<HTMLDivElement>
  onCellChange?: (cell: number) => void
}

/** one cached set as a labelled grid of its notes. */
export function SetGrid({ id, label, notes, gridRef, onCellChange }: SetGridProps) {
  const { data, error, isPending, refetch } = useQuery(getSetOptions({ path: { id } }))

  const members = useMemo(() => {
    const byId = new Map(notes.map((note) => [note.id, note]))
    return (data?.noteIds ?? []).flatMap((noteId) => byId.get(noteId) ?? [])
  }, [data, notes])

  if (isPending) {
    return (
      <StateBlock fill>
        <Loader label={`loading ${label}`} />
      </StateBlock>
    )
  }
  if (error) {
    return (
      <StateBlock fill>
        <ErrorState detail={`could not load ${label}`} onRetry={() => void refetch()} />
      </StateBlock>
    )
  }

  return <NoteGrid ref={gridRef} label={label} notes={members} onCellChange={onCellChange} />
}
