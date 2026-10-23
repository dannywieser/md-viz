import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader } from '@md-viz/ui'

export function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold">{title}</h2>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  )
}
