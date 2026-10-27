// @vitest-environment node
import { buildNoteSets } from '../src/note-sets'
import type { Note } from '../src/notes'

const now = new Date(2026, 9, 27, 12, 0, 0)
const at = (...args: [number, number, number, number?, number?, number?]) =>
  new Date(...args).toISOString()

const note = (id: string, overrides: Partial<Note> = {}): Note => ({
  id,
  source: 'bear',
  title: id,
  body: '',
  tags: [],
  created: '',
  modified: '',
  ...overrides,
})

const byId = (sets: ReturnType<typeof buildNoteSets>) =>
  Object.fromEntries(sets.map((set) => [set.id, set.noteIds]))

describe('buildNoteSets', () => {
  it('returns the four sets for bear, in order', () => {
    expect(buildNoteSets('bear', [], now).map((set) => set.id)).toEqual([
      'bear:created-today',
      'bear:modified-today',
      'bear:created-last-30-days',
      'bear:modified-last-30-days',
    ])
  })

  it('returns only the modified sets for file', () => {
    expect(buildNoteSets('file', [], now).map((set) => set.id)).toEqual([
      'file:modified-today',
      'file:modified-last-30-days',
    ])
  })

  it('treats today as the local calendar day', () => {
    const sets = byId(
      buildNoteSets(
        'bear',
        [
          note('midnight', { created: at(2026, 9, 27, 0, 0, 0) }),
          note('late', { created: at(2026, 9, 27, 23, 59, 59) }),
          note('before', { created: at(2026, 9, 26, 23, 59, 59) }),
          note('after', { created: at(2026, 9, 28, 0, 0, 0) }),
        ],
        now,
      ),
    )
    expect(sets['bear:created-today']).toEqual(['midnight', 'late'])
  })

  it('uses a rolling 30 x 24 hour window for the last 30 days', () => {
    const edge = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sets = byId(
      buildNoteSets(
        'bear',
        [
          note('edge', { modified: edge.toISOString() }),
          note('older', { modified: new Date(edge.getTime() - 1).toISOString() }),
          note('recent', { modified: at(2026, 9, 1) }),
        ],
        now,
      ),
    )
    expect(sets['bear:modified-last-30-days']).toEqual(['edge', 'recent'])
    expect(sets['bear:modified-today']).toEqual([])
  })

  it('leaves out notes with a missing or unparseable date', () => {
    const sets = byId(
      buildNoteSets(
        'bear',
        [note('empty', { created: '' }), note('bad', { created: 'not a date' })],
        now,
      ),
    )
    expect(sets['bear:created-today']).toEqual([])
    expect(sets['bear:created-last-30-days']).toEqual([])
  })
})
