/** the title and a line about the component at the top of its page. */
export function PageHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
