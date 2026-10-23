import * as React from 'react'
import { cn } from 'cn'
import { Wordmark } from './wordmark'

function AppHeader({
  title,
  subtitle,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<'header'>, 'title'> & {
  /** accessible name of the app; the wordmark is what is shown. */
  title: string
  /** shown beside the wordmark. */
  subtitle?: string
}) {
  return (
    <header
      data-slot="app-header"
      className={cn(
        'sticky top-4 z-10 mx-4 mt-4 flex items-center justify-between gap-4 border bg-card px-6 py-3 text-card-foreground shadow-hard',
        className,
      )}
      {...props}
    >
      <h1 className="flex items-center gap-3 text-lg font-bold">
        <Wordmark aria-hidden role="presentation" aria-label={undefined} />
        <span className="sr-only">{title}</span>
        {subtitle && <span aria-hidden>{subtitle}</span>}
      </h1>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </header>
  )
}

export { AppHeader }
