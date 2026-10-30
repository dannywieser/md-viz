import type { ReactNode } from 'react'

type IterationSectionProps = {
  number: number
  title: string
  /** YYYY.MM.DD */
  date: string
  children: ReactNode
}

/** one iteration of the exploration: a heading with its number and date, then its sections. */
export function IterationSection({ number, title, date, children }: IterationSectionProps) {
  return (
    <section
      aria-label={`iteration ${number}`}
      className="space-y-8 border-t pt-8 first:border-t-0 first:pt-0"
    >
      <header className="space-y-1">
        <h2 className="text-xl font-bold">
          iteration {number}: {title}
        </h2>
        <p className="text-xs text-muted-foreground">{date}</p>
      </header>
      {children}
    </section>
  )
}
