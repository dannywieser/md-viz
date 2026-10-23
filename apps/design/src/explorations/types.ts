import type { ComponentType } from 'react'

/** one design exploration: a self-contained page, served at `/explorations/<slug>`. */
export interface Exploration {
  slug: string
  title: string
  description: string
  /** the page, a `lazy` component so each exploration is its own chunk. */
  Page: ComponentType
}
