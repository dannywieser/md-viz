// @vitest-environment node
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { scanMarkdown } from '../../src/main/scan'
import type { ScanProgress } from '../../src/shared/ipc'

const DEMO = path.resolve(import.meta.dirname, '../../../../demo')

describe('scanMarkdown', () => {
  it('counts the markdown notes in the demo folder', async () => {
    const { count } = await scanMarkdown(DEMO)

    // .hidden/, the .txt files and the .svg are excluded.
    expect(count).toBe(18)
  })

  it('throttles progress reports to the interval, still reporting the final totals', async () => {
    const updates: ScanProgress[] = []

    const { count } = await scanMarkdown(DEMO, (p) => updates.push(p), {
      progressIntervalMs: 60_000,
    })

    expect(updates).toHaveLength(2)
    expect(updates.at(-1)).toMatchObject({ mdFiles: count })
  })

  it('reports progress, ending with the final totals', async () => {
    const updates: ScanProgress[] = []

    const { count } = await scanMarkdown(DEMO, (p) => updates.push(p), {
      progressIntervalMs: 0,
    })

    expect(updates.length).toBeGreaterThan(1)
    expect(updates.at(-1)).toMatchObject({ mdFiles: count })
    const counts = updates.map((p) => p.mdFiles)
    expect(counts).toEqual([...counts].sort((a, b) => a - b))
  })

  describe('with a temporary tree', () => {
    let root: string

    beforeEach(async () => {
      root = await mkdtemp(path.join(tmpdir(), 'md-viz-scan-'))
    })

    afterEach(async () => {
      await rm(root, { recursive: true, force: true })
    })

    it('skips node_modules, matches extensions case-insensitively and ignores non-notes', async () => {
      await mkdir(path.join(root, 'node_modules/pkg'), { recursive: true })
      await mkdir(path.join(root, 'sub'))
      await writeFile(path.join(root, 'node_modules/pkg/readme.md'), '')
      await writeFile(path.join(root, 'a.md'), '')
      await writeFile(path.join(root, 'sub/B.MD'), '')
      await writeFile(path.join(root, 'sub/c.markdown'), '')
      await writeFile(path.join(root, 'sub/d.txt'), '')

      expect((await scanMarkdown(root)).count).toBe(2)
    })

    it('returns zero for a missing folder', async () => {
      expect((await scanMarkdown(path.join(root, 'missing'))).count).toBe(0)
    })
  })
})
