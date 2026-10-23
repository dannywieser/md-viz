import { Card, CardDescription, CardHeader, CardTitle } from '@md-viz/ui'
import { explorations } from './registry'

export function ExplorationsIndex() {
  return (
    <main className="mx-auto max-w-5xl space-y-8 p-8">
      <h1 className="text-2xl font-bold">explorations</h1>
      <ul className="grid gap-4 sm:grid-cols-2">
        {explorations.map(({ slug, title, description }) => (
          <li key={slug}>
            <a href={`/explorations/${slug}`} className="block">
              <Card>
                <CardHeader>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            </a>
          </li>
        ))}
      </ul>
    </main>
  )
}
