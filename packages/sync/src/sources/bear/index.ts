import type { BearTarget } from '../../types'
import type { SourceAdapter } from '../types'
import { loadBearNotes } from './load'
import { scanBear } from './scan'

/** the Bear source: the notes of the Bear library. there is no progress to report. */
export const bearSource: SourceAdapter<BearTarget> = {
  load: () => loadBearNotes(),
  scan: () => scanBear(),
  parse: () => Promise.resolve({ source: 'bear' }),
  // one sync for the whole library.
  key: () => 'bear',
  // Bear has one library: nothing to remember beyond the source itself.
  remember: () => undefined,
  restore: () => Promise.resolve({ source: 'bear' }),
}
