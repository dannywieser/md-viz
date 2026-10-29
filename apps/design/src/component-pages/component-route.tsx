import { Link, useParams } from 'react-router'
import { ErrorState, StateBlock } from '@md-viz/ui'
import { findComponent } from './registry'

/** `/components/:slug`: the component's page, or the not-found card. */
export function ComponentRoute() {
  const { slug = '' } = useParams()
  const entry = findComponent(slug)
  if (entry) return <entry.Page />
  return (
    <StateBlock>
      <ErrorState
        detail="no such component"
        action={
          <Link to="/components" className="text-sm underline">
            all components
          </Link>
        }
      />
    </StateBlock>
  )
}
