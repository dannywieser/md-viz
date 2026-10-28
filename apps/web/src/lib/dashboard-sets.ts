export type SetSummary = { id: string; count: number }

export type DashboardSet = { id: string; label: string; count: number }

/** the automatic sets the dashboard shows, in display order (names as `packages/sync` writes them). */
const DASHBOARD_SETS = [
  { name: 'created-today', label: 'created today' },
  { name: 'created-last-30-days', label: 'created last 30 days' },
  { name: 'modified-today', label: 'modified today' },
  { name: 'modified-last-30-days', label: 'modified last 30 days' },
]

/** the sources the dashboard can show, preferred first. */
const SOURCES = ['bear', 'file']

/** the source whose sets the dashboard shows: the first of `SOURCES` with a set in the cache. */
export function pickSource(sets: SetSummary[]): string | null {
  return SOURCES.find((source) => sets.some((set) => set.id.startsWith(`${source}:`))) ?? null
}

/** the dashboard sets of `source` that the cache holds (the file source has no created sets). */
export function setsFor(source: string | null, sets: SetSummary[]): DashboardSet[] {
  if (source === null) return []
  return DASHBOARD_SETS.flatMap(({ name, label }) => {
    const id = `${source}:${name}`
    const found = sets.find((set) => set.id === id)
    return found ? [{ id, label, count: found.count }] : []
  })
}
