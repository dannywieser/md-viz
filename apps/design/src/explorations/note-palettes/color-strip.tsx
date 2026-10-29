type ColorStripProps = {
  /** the note colours, in index order. */
  colors: string[]
}

/** the note colours as numbered squares; the last one is the neutral default. */
export function ColorStrip({ colors }: ColorStripProps) {
  return (
    <ol className="flex flex-wrap gap-1" aria-label="note colors">
      {colors.map((color, index) => (
        <li
          key={index}
          title={`${index}`}
          className="flex size-8 items-end justify-end border border-border p-0.5 text-[10px] leading-none text-white mix-blend-normal"
          style={{ background: color }}
        >
          <span className="bg-black/50 px-0.5">{index}</span>
        </li>
      ))}
    </ol>
  )
}
