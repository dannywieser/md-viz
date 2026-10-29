// @vitest-environment node
import { listBearRows, type BearRow } from '../../../src/sources/bear/bearcli'
import { loadBearNotes } from '../../../src/sources/bear/load'

vi.mock('../../../src/sources/bear/bearcli', () => ({ listBearRows: vi.fn() }))

const row = (overrides: Partial<BearRow> = {}): BearRow => ({
  id: 'B1',
  title: 'plan',
  locked: 'no',
  tags: ['#garden', '#garden/beds'],
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
          tags: ['garden/beds'],
          created: '2026-10-01T10:00:00.000Z',
          modified: '2026-10-02T11:30:00.000Z',
        },
      ],
    })
  })

  describe('nested tags', () => {
    const tagsOf = async (tags: string[]) => {
      vi.mocked(listBearRows).mockResolvedValue([row({ tags })])
      return (await loadBearNotes()).notes[0]?.tags
    }

    it('keeps the whole nested tag, not each of its levels', async () => {
      expect(await tagsOf(['#daily', '#daily/10', '#daily/10/28'])).toEqual(['daily/10/28'])
    })

    it('keeps the order of the tags that stay', async () => {
      expect(await tagsOf(['#work', '#daily', '#daily/10', '#ideas'])).toEqual([
        'work',
        'daily/10',
        'ideas',
      ])
    })

    it('keeps two nested tags that share a start', async () => {
      expect(await tagsOf(['#daily', '#daily/10/28', '#daily/11/02'])).toEqual([
        'daily/10/28',
        'daily/11/02',
      ])
    })

    it('does not take a tag with the same letters for a part of another', async () => {
      expect(await tagsOf(['#dai', '#daily/10'])).toEqual(['dai', 'daily/10'])
    })

    it('keeps plain tags and notes without tags', async () => {
      expect(await tagsOf(['#a', '#b'])).toEqual(['a', 'b'])
      expect(await tagsOf([])).toEqual([])
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
