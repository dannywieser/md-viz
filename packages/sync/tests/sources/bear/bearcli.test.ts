// @vitest-environment node
import { execFile } from 'node:child_process'
import { listBearRows, runBearcli } from '../../../src/sources/bear/bearcli'

vi.mock('node:child_process', () => ({ execFile: vi.fn() }))

type Callback = (error: Error | null, stdout: string, stderr: string) => void

/** makes the next `bearcli` run finish with these results. */
function mockRun(error: (Error & { code?: string }) | null, stdout = '', stderr = '') {
  vi.mocked(execFile).mockImplementation(((
    _bin: string,
    _args: string[],
    _options: unknown,
    cb: Callback,
  ) => cb(error, stdout, stderr)) as unknown as typeof execFile)
}

const row = (id: string, location: string) => ({ id, location, locked: 'no' })

describe('runBearcli', () => {
  afterEach(() => {
    vi.clearAllMocks()
    delete process.env['BEAR_CLI']
  })

  it('runs the bundled bearcli with the arguments and resolves to its output', async () => {
    mockRun(null, 'out')

    await expect(runBearcli(['list'])).resolves.toBe('out')
    expect(vi.mocked(execFile).mock.calls[0]?.[0]).toBe(
      '/Applications/Bear.app/Contents/MacOS/bearcli',
    )
    expect(vi.mocked(execFile).mock.calls[0]?.[1]).toEqual(['list'])
  })

  it('takes the path from BEAR_CLI', async () => {
    process.env['BEAR_CLI'] = '/opt/bearcli'
    mockRun(null, '')

    await runBearcli([])

    expect(vi.mocked(execFile).mock.calls[0]?.[0]).toBe('/opt/bearcli')
  })

  it('says bear is not installed when the binary is missing', async () => {
    mockRun(Object.assign(new Error('spawn'), { code: 'ENOENT' }))

    await expect(runBearcli([])).rejects.toThrow(/bear is not installed/)
  })

  it('reports what bearcli printed on stderr when it fails', async () => {
    mockRun(new Error('exit 1'), '', 'database is locked\n')

    await expect(runBearcli([])).rejects.toThrow('bearcli failed: database is locked')
  })

  it('falls back to the error message when stderr is empty', async () => {
    mockRun(new Error('killed'))

    await expect(runBearcli([])).rejects.toThrow('bearcli failed: killed')
  })
})

describe('listBearRows', () => {
  afterEach(() => vi.clearAllMocks())

  it('lists every location and drops the trashed notes', async () => {
    mockRun(null, JSON.stringify([row('a', 'notes'), row('b', 'trash'), row('c', 'archive')]))

    const rows = await listBearRows('id,location')

    expect(rows.map((r) => r.id)).toEqual(['a', 'c'])
    expect(vi.mocked(execFile).mock.calls[0]?.[1]).toEqual([
      'list',
      '-l',
      'all',
      '--format',
      'json',
      '--fields',
      'id,location',
    ])
  })

  it('rejects output that is not a list', async () => {
    mockRun(null, '{"error":"x"}')

    await expect(listBearRows('id')).rejects.toThrow('unexpected list')
  })
})
