import { Link } from 'react-router'
import { Card, CardDescription, CardHeader, CardTitle } from '@md-viz/ui'
import { explorations } from './registry'

export function ExplorationsIndex() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">explorations</h1>
      <ul className="grid gap-4 sm:grid-cols-2">
        {explorations.map(({ slug, title, description }) => (
          <li key={slug}>
            <Link to={`/explorations/${slug}`} className="block">
              <Card>
                <CardHeader>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
