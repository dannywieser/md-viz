import type { ComponentType } from 'react'

/** one shared component's page, served at `/components/<slug>`. */
export interface ComponentPage {
  slug: string
  title: string
  Page: ComponentType
}
