import { execFile } from 'node:child_process'

const DEFAULT_BEARCLI = '/Applications/Bear.app/Contents/MacOS/bearcli'

/** big enough for a whole library as json: 5,000 notes are about 9 MB. */
const MAX_BUFFER = 512 * 1024 * 1024

/** one note as `bearcli list --format json` prints it. */
export interface BearRow {
  id: string
  title: string
  locked: 'yes' | 'no'
  tags: string[]
  created: string
  modified: string
  location: 'notes' | 'archive' | 'trash'
  content?: string
}

/** runs `bearcli` (`BEAR_CLI` overrides its path) and resolves to what it printed. */
export function runBearcli(args: string[]): Promise<string> {
  const bin = process.env['BEAR_CLI'] ?? DEFAULT_BEARCLI
  return new Promise((resolve, reject) => {
    execFile(bin, args, { maxBuffer: MAX_BUFFER }, (error, stdout, stderr) => {
      if (!error) return resolve(stdout)
      if ('code' in error && error.code === 'ENOENT') {
        return reject(new Error(`bear is not installed: ${bin} was not found`))
      }
      reject(new Error(`bearcli failed: ${stderr.trim() || error.message}`))
    })
  })
}

/**
 * every note that is not in the trash, for `fields` (a comma-separated list or `all`); the
 * trash filter reads `location`, so `fields` must include it unless it is `all...`.
 */
export async function listBearRows(fields: string): Promise<BearRow[]> {
  const out = await runBearcli(['list', '-l', 'all', '--format', 'json', '--fields', fields])
  const rows = JSON.parse(out) as unknown
  if (!Array.isArray(rows)) throw new Error('bearcli returned an unexpected list')
  return (rows as BearRow[]).filter((row) => row.location !== 'trash')
}
