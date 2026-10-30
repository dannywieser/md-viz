import type { GridSet } from './grid-layout/grid-model'
import { HUE_COLORS } from './note-colors'

const WORDS = [
  'garden',
  'recipe',
  'meeting',
  'idea',
  'budget',
  'travel',
  'reading',
  'project',
  'draft',
  'journal',
  'plan',
  'review',
  'workout',
  'homelab',
  'backup',
  'invoice',
  'gift',
  'movie',
  'book',
  'quote',
  'todo',
  'research',
  'sketch',
  'letter',
  'playlist',
  'checklist',
  'summary',
  'bug',
  'design',
  'network',
]

/**
 * placeholder sets for demos: one set per entry of `counts`, that many notes each, each with a
 * palette colour of its own (the colours wrap past the palette). always the same for the same counts.
 */
export function makeFakeSets(counts: number[]): GridSet[] {
  let note = 0
  return counts.map((count, index) => ({
    id: `set-${index}`,
    name: `${WORDS[index % WORDS.length]}${index >= WORDS.length ? ` ${Math.floor(index / WORDS.length) + 1}` : ''}`,
    color: index % HUE_COLORS,
    notes: Array.from({ length: count }, () => {
      const n = note++
      return {
        id: `note-${String(n).padStart(6, '0')}`,
        title: `${WORDS[(n * 7) % WORDS.length]} ${WORDS[(n * 13 + 5) % WORDS.length]}`,
      }
    }),
  }))
}
