import { Link } from 'react-router'
import { ErrorState, StateBlock } from '@md-viz/ui'

export function ExplorationNotFound() {
  return (
    <main className="p-4">
      <StateBlock>
        <ErrorState
          detail="no such exploration"
          action={
            <Link to="/explorations" className="text-sm underline">
              all explorations
            </Link>
          }
        />
      </StateBlock>
    </main>
  )
}
