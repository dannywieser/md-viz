/** how the squares fill the box: `rank` gives each cell (row by row, top left first) its place in the fill order. */
export interface LoaderFill {
  id: string
  name: string
  description: string
  rank: (cols: number, rows: number) => number[]
  /** squares fall from the top of the box to their place instead of appearing there. */
  drop?: boolean
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))

/** a small seeded generator, so the same box always fills in the same order. */
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const cells = (cols: number, rows: number, rank: (x: number, y: number) => number) =>
  Array.from({ length: cols * rows }, (_, i) => rank(i % cols, Math.floor(i / cols)))

export const loaderFills: LoaderFill[] = [
  {
    id: 'rows',
    name: 'rows',
    description: 'the box fills from the bottom, one row at a time, left to right.',
    rank: (cols, rows) => cells(cols, rows, (x, y) => (rows - 1 - y) * cols + x),
  },
  {
    id: 'columns',
    name: 'columns',
    description: 'each column stacks up from the bottom, then the next column starts.',
    rank: (cols, rows) => cells(cols, rows, (x, y) => x * rows + (rows - 1 - y)),
  },
  {
    id: 'scatter',
    name: 'scatter',
    description: 'squares land all over the box in a fixed, even-looking order.',
    rank: (cols, rows) => {
      const n = cols * rows
      let step = Math.round(n * 0.618)
      while (gcd(step, n) !== 1) step++
      return Array.from({ length: n }, (_, i) => (i * step) % n)
    },
  },
  {
    id: 'drop',
    name: 'drop',
    description:
      'squares fall from the top into random columns and stack up until the box is full.',
    drop: true,
    rank: (cols, rows) => {
      const random = seeded(7)
      // every column gets `rows` squares, in a random order.
      const drops = Array.from({ length: cols * rows }, (_, i) => i % cols)
      for (let i = drops.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1))
        ;[drops[i], drops[j]] = [drops[j], drops[i]]
      }
      const height = Array.from({ length: cols }, () => 0)
      const ranks = Array.from({ length: cols * rows }, () => 0)
      drops.forEach((x, order) => {
        ranks[(rows - 1 - height[x]++) * cols + x] = order
      })
      return ranks
    },
  },
]
