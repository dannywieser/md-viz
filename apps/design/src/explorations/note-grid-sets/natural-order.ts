/** a small seeded generator (mulberry32): the same seed always gives the same sequence. */
function random(seed: number): () => number {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * the natural order of the notes: the set of each note, one entry per note, with the sets mixed
 * the way notes of different sets follow each other when they are listed as they were written.
 * made up and fixed (seeded), so the same counts always give the same order.
 */
export function naturalOrder(counts: number[], seed = 7): number[] {
  const order = counts.flatMap((count, set) => Array.from({ length: count }, () => set))
  const next = random(seed)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order
}
