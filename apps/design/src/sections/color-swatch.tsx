export function ColorSwatch({ label, cssVar }: { label: string; cssVar: string }) {
  return (
    <div className="space-y-1.5">
      <div
        className="h-14 rounded-md border"
        style={{ backgroundColor: `var(${cssVar})` }}
        aria-hidden
      />
      <p className="text-xs font-bold">{label}</p>
      <p className="text-xs text-muted-foreground">{cssVar}</p>
    </div>
  )
}
