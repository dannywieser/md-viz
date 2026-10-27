import type { ScanResult } from '../../types'
import { listBearRows } from './bearcli'

/** counts the notes a Bear sync would push: all but the trashed and the locked ones. */
export async function scanBear(): Promise<ScanResult> {
  const rows = await listBearRows('id,locked,location')
  return { count: rows.filter((row) => row.locked !== 'yes').length }
}
