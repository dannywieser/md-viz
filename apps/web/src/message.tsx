import { Card } from '@md-viz/ui'

export function Message({ children }: { children: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">{children}</p>
      </Card>
    </div>
  )
}
