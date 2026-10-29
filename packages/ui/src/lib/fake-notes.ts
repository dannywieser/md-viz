import type { Note } from '../components/note-grid'
import { NOTE_COLORS } from '../components/note-grid'

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

function pick(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)]
}

/** random placeholder notes until real ones are loaded; differs on every call. */
export function makeFakeNotes(count: number): Note[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `note-${i}`,
    title: `${pick()} ${pick()}`,
    colors: [Math.floor(Math.random() * NOTE_COLORS)],
  }))
}
