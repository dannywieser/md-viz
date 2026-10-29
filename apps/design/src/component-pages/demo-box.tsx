import type { ComponentProps } from 'react'

/** the page background (dots included) as a box, for components that float on it. */
export function DemoBox({ className = '', ...props }: ComponentProps<'div'>) {
  return <div className={`bg-background bg-dots border p-6 ${className}`} {...props} />
}
