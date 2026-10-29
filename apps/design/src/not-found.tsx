import { Link } from 'react-router'
import { ErrorState, StateBlock } from '@md-viz/ui'

export function NotFound() {
  return (
    <StateBlock>
      <ErrorState
        detail="no such page"
        action={
          <Link to="/guidelines" className="text-sm underline">
            back to the guidelines
          </Link>
        }
      />
    </StateBlock>
  )
}
