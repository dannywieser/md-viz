// @vitest-environment node
import { listBearRows, type BearRow } from '../../src/main/bearcli'
import { loadBearNotes } from '../../src/main/load-bear-notes'

vi.mock('../../src/main/bearcli', () => ({ listBearRows: vi.fn() }))

const row = (overrides: Partial<BearRow> = {}): BearRow => ({
  id: 'B1',
  title: 'plan',
  locked: 'no',
  tags: ['garden', 'garden/beds'],
  created: '2026-10-01T10:00:00Z',
  modified: '2026-10-02T11:30:00Z',
  location: 'notes',
  content: '# plan',
  ...overrides,
})

describe('loadBearNotes', () => {
  it('maps a Bear note to a note with Bear’s id, tags and content', async () => {
    vi.mocked(listBearRows).mockResolvedValue([row()])

    const result = await loadBearNotes()

    expect(listBearRows).toHaveBeenCalledWith('all,content')
    expect(result).toEqual({
      failed: [],
      notes: [
        {
          id: 'B1',
          source: 'bear',
          title: 'plan',
          body: '# plan',
          tags: ['garden', 'garden/beds'],
          created: '2026-10-01T10:00:00.000Z',
          modified: '2026-10-02T11:30:00.000Z',
        },
      ],
    })
  })

  it('skips locked notes and keeps archived ones', async () => {
    vi.mocked(listBearRows).mockResolvedValue([
      row({ id: 'open' }),
      row({ id: 'secret', locked: 'yes' }),
      row({ id: 'old', location: 'archive' }),
    ])

    const { notes } = await loadBearNotes()

    expect(notes.map((note) => note.id)).toEqual(['open', 'old'])
  })

  it('gives a note without content an empty body', async () => {
    vi.mocked(listBearRows).mockResolvedValue([row({ content: undefined })])

    const { notes } = await loadBearNotes()

    expect(notes[0]?.body).toBe('')
  })

  it('passes on a bearcli failure', async () => {
    vi.mocked(listBearRows).mockRejectedValue(new Error('bear is not installed'))

    await expect(loadBearNotes()).rejects.toThrow('bear is not installed')
  })
})
