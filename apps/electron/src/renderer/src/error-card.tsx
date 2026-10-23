import { Card } from '@md-viz/ui'

export function ErrorCard({ message }: { message: string }) {
  return (
    <Card className="px-4 py-3">
      <p role="alert" className="text-sm text-destructive">
        {message.toLowerCase()}
      </p>
    </Card>
  )
}
