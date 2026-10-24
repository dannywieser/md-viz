// @vitest-environment node
import { mkdir, mkdtemp, rm, utimes, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { loadFileNotes, noteId, noteTitle } from '../../src/main/load-file-notes'

// real by default; one test makes a file fail to read.
vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>()
  return { ...actual, readFile: vi.fn(actual.readFile) }
})

describe('noteId and noteTitle', () => {
  it('derives a stable 16-char slash-free id from the relative path', () => {
    expect(noteId('a/b.md')).toMatch(/^[0-9a-f]{16}$/)
    expect(noteId('a/b.md')).toBe(noteId('a/b.md'))
    expect(noteId('a/b.md')).not.toBe(noteId('b.md'))
  })

  it('strips the md extension from the file name only', () => {
    expect(noteTitle('sub/plan.md')).toBe('plan')
    expect(noteTitle('Plan.MD')).toBe('Plan')
    expect(noteTitle('a.md.md')).toBe('a.md')
  })
})

describe('loadFileNotes', () => {
  let root: string

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'md-viz-load-file-'))
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
    vi.restoreAllMocks()
  })

  it('loads each markdown file as a note with its mtime as modified', async () => {
    await mkdir(path.join(root, 'sub'))
    const file = path.join(root, 'sub', 'plan.md')
    await writeFile(file, '# plan\n')
    await writeFile(path.join(root, 'readme.txt'), 'not a note')
    const mtime = new Date('2026-03-04T05:06:07.000Z')
    await utimes(file, mtime, mtime)

    const { notes, failed } = await loadFileNotes(root)

    expect(failed).toBe(0)
    expect(notes).toEqual([
      {
        id: noteId('sub/plan.md'),
        source: 'file',
        title: 'plan',
        body: '# plan\n',
        tags: [],
        created: '',
        modified: '2026-03-04T05:06:07.000Z',
      },
    ])
  })

  it('returns nothing for a folder without notes', async () => {
    expect(await loadFileNotes(root)).toEqual({ notes: [], failed: 0 })
  })

  it('counts files that cannot be read and leaves them out', async () => {
    await writeFile(path.join(root, 'good.md'), 'good')
    await writeFile(path.join(root, 'bad.md'), 'bad')
    const fs = await import('node:fs/promises')
    const real = vi.mocked(fs.readFile).getMockImplementation()!
    vi.mocked(fs.readFile).mockImplementation(((file: string, ...rest: unknown[]) =>
      file.endsWith('bad.md')
        ? Promise.reject(new Error('EACCES'))
        : (real as (...args: unknown[]) => unknown)(file, ...rest)) as typeof fs.readFile)

    const { notes, failed } = await loadFileNotes(root)

    expect(notes.map((note) => note.title)).toEqual(['good'])
    expect(failed).toBe(1)
  })
})
